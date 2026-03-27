import { existsSync, mkdirSync, writeFileSync } from "fs";
import { appDataSource } from "../db/dataBase";
import { Enterprise } from "../db/entities/enterprise.entity";
import { join } from 'path';
import { CreateEnterpriseDTO } from "../Dto/enterprise/createEnterprise.dto";
import { UpdateEnterpriseDTO } from "../Dto/enterprise/updateEnterprise.dto";
import { Signature } from '../db/entities/signature.entity';
import { createSignature } from "../utils/create_signature";
import { CreateSignatureDto } from "../Dto/enterprise/createSignature.dto";
import { QueryRelationsDTO } from "../Dto/query_relations.dto";
import { UpdateSignatureDto } from "../Dto/enterprise/updateSignature.dto";
import { NewSignatureDto } from "../Dto/enterprise/newSignature.dto";
import { Like } from "typeorm";
import { CustomError } from "../utils/error";

export class EnterpriseService {
    private testUser = { name: 'Nombre Del Usuario', phone: '222 141 12 30', ext: '112-114', cell_phone: '222 240 66 48', position: { name: 'Puesto' } };

    constructor(
        private readonly enterpriseRepository = appDataSource.getRepository(Enterprise),
        private readonly signatureRepository = appDataSource.getRepository(Signature)
    ) { }

    // TODO: Meter en una transaccion
    public async create(createDto: CreateEnterpriseDTO, logo: Express.Multer.File) {
        const enterprise = await this.enterpriseRepository.save({
            ...createDto
        });
        const dir = join(__dirname, "..", "..", "uploads", "enterprises", enterprise.enterprise_id);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        const validaExten = logo.originalname.split('.');
        if (validaExten.length < 2) throw "Archivo no valido"
        const extenArch = validaExten.pop();
        writeFileSync(`${dir}/${logo.fieldname}.${extenArch}`, logo.buffer);
        return enterprise;
    }

    public async getAll(pagination: QueryRelationsDTO) {
        const { take, skip, search } = pagination;

        const [data, total] = await this.enterpriseRepository.findAndCount({
            where: search ? { name: Like(`%${search}%`) } : undefined,
            take, skip
        });

        const ids = data.map(dt => dt.enterprise_id);
        if (ids.length === 0) return [[], total];
        const enterprices = await this.getQuery().where("enterprise.enterprise_id IN (:...ids)", { ids }).getRawMany()
        return [enterprices, total];

    }
    // ? Se envia junto a las relaciones
    public async getOne(enterprise_id: string) {
        const enterprise = await this.getQuery().where('enterprise.enterprise_id = :enterprise_id', {enterprise_id}).getRawOne();
        if (!enterprise) throw new CustomError("Empresa no existente", 404);
        return enterprise;
    }

    public async update(enterprise_id: string, updateDto: UpdateEnterpriseDTO) {
        const enterprise = await this.findOneOrFail(enterprise_id);
        await this.enterpriseRepository.update(enterprise, updateDto);
        return { ...enterprise, ...updateDto };
    }

    public async delete(enterprise_id: string) {
        const enterprise = await this.findOneOrFail(enterprise_id);
        await this.enterpriseRepository.delete({ enterprise_id });
        return enterprise;
    }

    // * Signature
    public async previewSignature(enterprise_id: string, signatureDto: CreateSignatureDto) {
        const enterprise = await this.getOne(enterprise_id);
        return createSignature(this.testUser, enterprise, signatureDto);
    }

    public async createSignature(enterprise_id: string, signatureDto: CreateSignatureDto) {
        await this.getOne(enterprise_id);
        return this.signatureRepository.insert({
            ...signatureDto,
            enterprise_id
        })
    }

    public async updateSignature(signature_id: string, signatureDto: UpdateSignatureDto) {
        const signature = await this.getSignature(signature_id);
        await this.signatureRepository.update({ signature_id }, signatureDto);
        return { ...signature, ...signatureDto };
    }

    public async newSignature(enterprise_id: string, dataSignature: NewSignatureDto) {
        const enterprise = await this.getOne(enterprise_id);
        const signature = await this.signatureRepository.findOneBy({ enterprise_id: enterprise.enterprise_id });
        if (!signature) throw "Aun no hay firma establecida";
        const dataUser = { ...dataSignature, position: { name: dataSignature.position } };
        return createSignature(dataUser, enterprise, signature);
    }

    public async getSignature(signature_id: string) {
        const signature = await this.signatureRepository.findOneBy({ signature_id });
        if (!signature) throw "No existe la firma";
        return signature;
    }

    private getQuery() {
        const query = this.enterpriseRepository.createQueryBuilder("enterprise")
            .select(["enterprise.enterprise_id as enterprise_id", "enterprise.name as name", "enterprise.address as address"])
            .leftJoin("enterprise.offices", "office")
            .leftJoin("enterprise.signature", 'signature')
            .leftJoin("office.departments", "department")
            .leftJoin("department.areas", "area")
            .leftJoin("area.positions", "position")
            .leftJoin("position.employees", "employee")
            .addSelect("COUNT(DISTINCT office.office_id)", "total_offices")
            .addSelect("COUNT(DISTINCT department.department_id)", "total_departments")
            .addSelect(['signature.signature_id as signature_id'])
            .addSelect("COUNT(DISTINCT area.area_id)", "total_areas")
            .addSelect("COUNT(DISTINCT position.position_id)", "total_positions")
            .addSelect("COUNT(DISTINCT employee.user_id)", "total_employees")
            .groupBy("enterprise.enterprise_id").addGroupBy("enterprise.name").addGroupBy("enterprise.address").addGroupBy('signature.signature_id')

        return query;
    }

    private async findOneOrFail(enterprise_id: string){
        const enterprise = await this.enterpriseRepository.findOne({ where: { enterprise_id } })
        if (!enterprise) throw new Error("Empresa no existente");
        return enterprise;
    }

}