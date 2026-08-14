import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join, normalize } from 'path';
import mime from 'mime-types'
import { CreateFileDTO } from '../Dto/file/createFile.dto';
import { appDataSource } from '../db/dataBase';
import { File } from '../db/entities/file.entity';
import { UpdateFileDTO } from '../Dto/file/updateFile.dto';
import { CustomError } from '../utils/error';
import { ColumnTypeMap } from '../types/search_type';
import { FileArray } from 'express-fileupload';
import { EmployeeFiles } from '../db/entities/employee_files.entity';
import { UploadFileDTO } from '../Dto/file/uploadFile.dto';
import { User } from '../db/entities/user.entity';
import jsPDF from 'jspdf';
import { SystemConfiguration } from '../db/entities/system_configuration';
import base64 from 'base-64';
import qrcode from 'qrcode';
import { createSignature } from '../utils/create_signature';

const FILE_COLUMNS_TYPES: ColumnTypeMap<File> = {
    // * entidad principal
    name: { type: 'text', column: 'file', default: 'day' },
    key: { type: 'text', column: 'file', default: 'day' },
    valid_mime_types: { type: 'text', column: 'file', default: 'day' },
    description: { type: 'text', column: 'file', default: 'day' },
    created_at: { type: 'date', column: 'file', default: 'day' },
    is_active: { type: 'boolean', column: 'file', default: 'day' },
    is_required: { type: 'boolean', column: 'file', default: 'day' }
};
const UPLOADS_DIR_USERS = join(__dirname, "..", "..", "uploads", "employees");

export class FileService {

    constructor(
        private readonly repository = appDataSource.getRepository(File),
        private readonly systemConfigurationRepository = appDataSource.getRepository(SystemConfiguration),
        private readonly userRepository = appDataSource.getRepository(User)
    ) { }

    public create(createDTO: CreateFileDTO) {
        return this.repository.save({ ...createDTO, valid_mime_types: createDTO.valid_mime_types.toString() });
    }

    public async update(file_id: number, updateDTO: UpdateFileDTO) {
        const file = await this.repository.findOneBy({ file_id });
        if (updateDTO.valid_mime_types) updateDTO.valid_mime_types = updateDTO.valid_mime_types.toString();
        if (!file) throw new CustomError('Configuración de archivo no encontrada', 404);
        await this.repository.update({ file_id }, updateDTO)
        return { ...file, ...updateDTO };
    }

    public async changeStatus(file_id: number) {
        const file = await this.repository.findOneBy({ file_id });
        if (!file) throw new CustomError('Configuración de archivo no encontrada', 404);
        await this.repository.update({ file_id }, { is_active: !file.is_active })
        return { ...file, is_active: !file.is_active };
    }

    public async getAll(searchDTO: any) {
        const { orderBy = 'created_at', orderDirection } = searchDTO;
        const query = this.repository.createQueryBuilder('file');
        // applySearch(query, searchDTO, FILE_COLUMNS_TYPES);
        // const orderConfig = FILE_COLUMNS_TYPES[orderBy];
        // const orderField = orderConfig
        //     ? `${orderConfig.alias}.${orderBy}` // columna registrada en el mapa
        //     : `file.${orderBy}`;

        // return query.orderBy(orderField, orderDirection).getMany();
        return query.getMany();
    }

    public async delete(file_id: number) {
        const dir = normalize(join(UPLOADS_DIR_USERS, 'docs'));
        const folders = readdirSync(dir);
        for (let index = 0; index < folders.length; index++) {
            const folderPath = join(dir, folders[index]);
            this.removeFile(folderPath, `FILE_${file_id}.`)
        }
        return `Configuración de archivo eliminado`;
    }

    public async getAllByEmployee(employee_id: string) {
        const query = this.repository.createQueryBuilder('file')
            .select(['file.file_id as file_id', 'file.name as name', 'file.key as "key"', 'file.valid_mime_types as valid_mime_types', 'file.max_size as max_size', 'file.is_required as is_required', 'file.description as description', 'file.is_active as is_active', 'file.is_cropped as is_cropped', 'file.aspect_ratio as aspect_ratio'])
            .leftJoin('file.employeeFiles', 'employeeFile', 'file.file_id = employeeFile.file_id and employeeFile.employee_id = :employee_id', { employee_id })
            .leftJoin('employeeFile.userUploaded', 'userUploaded')
            .addSelect(['employeeFile.updated_at as updated_at', 'employeeFile.expires_on as expires_on'])
            .addSelect(['userUploaded.name as name_employee_uploaded', 'userUploaded.user_id as user_id_employee_uploaded'])

        return query.getRawMany();
    }

    public async uploadFileUser(employee_id: string, files: FileArray, uploadDTO: UploadFileDTO, user: User) {
        const dir = normalize(join(UPLOADS_DIR_USERS, employee_id, 'docs'));
        if (!dir.startsWith(UPLOADS_DIR_USERS)) throw "Directorio no permitirdo";
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        const keys = Object.keys(files);
        if (keys.length > 1) throw new CustomError('Solo se puede subir un archivo a la vez', 400);

        return this.repository.manager.transaction(async (transactionalEntityManager) => {
            const fileConfig = await transactionalEntityManager.findOneBy(File, { key: keys[0] });

            if (!fileConfig) throw new CustomError('No hay coincidencia del archivo a subir', 400);

            const simpleFile = files[keys[0]];

            if (!fileConfig.is_active) throw new CustomError(`El archivo ${fileConfig.name} esta marcado como inactivo`, 400);

            if (Array.isArray(simpleFile)) throw new CustomError(`Solo se acepta un archivo para ${fileConfig.name}`, 400);
            if (!fileConfig.valid_mime_types.includes(simpleFile.mimetype)) throw new CustomError(`Tipo de archivo no soportado para ${fileConfig.name}`, 400);
            if ((fileConfig.max_size * 1000000) < simpleFile.size) throw new CustomError(`El tamaño de archivo excede el limite permitido para ${fileConfig.name}`, 400);


            // //* Guardar en employeeFile
            const userFile = await transactionalEntityManager.findOneBy(EmployeeFiles, { employee_id, file_id: fileConfig.file_id });
            if (!userFile) await transactionalEntityManager.insert(EmployeeFiles, { file_id: fileConfig.file_id, employee_id, uploaded_by: user.user_id, ...uploadDTO });
            else await transactionalEntityManager.update(EmployeeFiles, userFile, { uploaded_by: user.user_id, ...uploadDTO });

            const ext = mime.extension(simpleFile.mimetype);
            const relativeName = `FILE_${fileConfig.file_id}.`;
            const uploadPath = join(dir, `${relativeName}${ext}`);
            this.removeFile(dir, relativeName);
            await simpleFile.mv(uploadPath);

            return `Archivo subidos correctamente`;
        });

    }

    public getFileEmployee(file_id: number, employee_id: string) {
        const employeeDir = join(UPLOADS_DIR_USERS, employee_id, 'docs');
        const docs = readdirSync(employeeDir);
        const file = docs.find(doc => doc.startsWith(`FILE_${file_id}.`));
        if (!file) throw new CustomError('Archivo no encontrado', 400);
        const dirFile = join(employeeDir, file);
        const mimeType = mime.lookup(file) || 'application/octet-stream';
        return [file, dirFile, mimeType];
    }

    public getPhotoEmployee(employee_id: string): [Buffer<ArrayBufferLike>, string] {
        const employeeDir = join(UPLOADS_DIR_USERS, employee_id, 'docs');
        const docs = readdirSync(employeeDir);
        const file = docs.find(doc => doc.startsWith(`FILE_1.`));
        if (!file) throw new CustomError('Archivo no encontrado', 400);
        const dirFile = join(employeeDir, file);
        const mimeType = mime.lookup(file) || 'application/octet-stream';
        const buffer = readFileSync(dirFile);
        return [buffer, mimeType];
    }

    public async getCredential(employee_id: string, year?: string): Promise<[User, Buffer<ArrayBufferLike>]> {
        const employee = await this.userRepository.findOne({
            where: { user_id: employee_id }, relations: {
                employee: {
                    medicalData: true, enterpriseInformation: true, position: true
                }
            }
        });

        if (!employee) throw new CustomError("No existe el empleado", 400);
        const credential = await this.createCredencial(employee, year || new Date().getFullYear().toString());
        return [employee, credential];
    }

    public async refreshSignature(employee_id: string): Promise<[User, Buffer<ArrayBufferLike>]> {
        const employee = await this.userRepository.findOne({
            where: { user_id: employee_id }, relations: {
                employee: {
                    enterpriseInformation: true, position: { area: { department: { office: { enterprise: { signature: true } } } } },
                }
            }
        });
        if (!employee) throw new CustomError("Empleado no encontrado", 400);
        const userParse = {
            name: employee.name,
            phone: employee.employee.enterpriseInformation.phone,
            ext: employee.employee.enterpriseInformation.ext,
            cell_phone: employee.employee.enterpriseInformation.cell_phone,
            position: employee.employee.position,
        };
        const dataBuffer = await createSignature(userParse, employee.employee.position.area.department.office.enterprise);
        const pathSignature = join(UPLOADS_DIR_USERS, employee_id, 'docs', 'signature.png');
        writeFileSync(pathSignature, dataBuffer);
        return [employee, dataBuffer];
    }

    public async getSignature(employee_id: string): Promise<[User, string]> {
        const employee = await this.userRepository.findOne({
            where: { user_id: employee_id }
        });
        if (!employee) throw new CustomError("Empleado no encontrado", 400);
        const pathSignature = join(UPLOADS_DIR_USERS, employee_id, 'docs', 'signature.png');
        if (!existsSync(pathSignature)) throw new CustomError("No existe el archivo intente volver a crearlo", 400);
        return [employee, pathSignature];
    }

    private async createCredencial(employee: User, year: string) {

        const legalRep = await this.systemConfigurationRepository.findOne({ where: { key: 'RL' } });
        if (!legalRep || !legalRep.user_id) throw new CustomError("No hay registro de representante legal", 400);
        const doc = new jsPDF({
            unit: 'px',
            compress: true
        });
        // * Logos de la empresa
        const dirLogo1 = join(__dirname, "../..", "public/img/logo1.png");
        const dirLogo2 = join(__dirname, "../..", "public/img/logo1.png");
        if (!existsSync(dirLogo1) || !existsSync(dirLogo2)) throw new CustomError("Verifique que los logotipos para credencial existan", 400);
        const logo1 = readFileSync(join(__dirname, "../..", "public/img/logo1.png"));
        const logo2 = readFileSync(join(__dirname, "../..", "public/img/logo2.png"));

        // * Firma representante legal
        const dirRP = join(UPLOADS_DIR_USERS, legalRep.user_id, 'docs', 'FILE_2.png');
        console.log(dirRP)
        if (!existsSync(dirRP)) throw new CustomError("No existe firma del representante legal", 400);
        const imgRP = readFileSync(dirRP);

        // * Archivos del empleado
        const dirEmployee = join(UPLOADS_DIR_USERS, employee.user_id, 'docs');
        if (!existsSync(dirEmployee)) throw new CustomError("No existe directorio del empleado", 400);
        const filesEmployee = readdirSync(dirEmployee);

        const fileImgUser = filesEmployee.find(file => file.startsWith('FILE_1.'));
        const fileFirUser = filesEmployee.find(file => file.startsWith('FILE_2.'));
        if (!fileImgUser || !fileFirUser) throw new CustomError("Verifique la imagen y/o firma del empleado", 400);

        // * Imagenes
        doc.addImage(readFileSync(join(dirEmployee, fileImgUser)), fileImgUser.includes('png') ? "PNG" : "JPEG", 18, 110, 114, 128);
        doc.addImage(logo1, "PNG", 346, 52.91, 85, 85);
        doc.addImage(logo2, "PNG", 346, 333.91, 91, 115);
        // QR image
        const idEncode = base64.encode(employee.user_id);
        const code = await qrcode.toBuffer(`https://www.pem-sa.com.mx/personal/${idEncode}`, { type: 'png' });

        doc.addImage(code, "PNG", 18, 388.91, 91, 91);
        doc.addImage(readFileSync(join(dirEmployee, fileFirUser)), "PNG", 18, 251.91, 114, 45);
        doc.addImage(imgRP, "PNG", 153, 385.91, 137, 39);


        doc.setFont("helvetica", "bold");
        doc.setFontSize(22.28);
        doc.setTextColor(162, 35, 40);
        doc.text("CREDENCIAL", 23, 68.91);
        doc.setFillColor(162, 35, 40);
        doc.rect(9, 71.91, 324, 11, "F");
        doc.setFillColor(0, 0, 102);
        doc.rect(9, 91.91, 324, 11, "F");
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(17.6);
        doc.text(employee.name, 147, 150.91);
        doc.setFontSize(13.11);
        doc.text(employee.employee.position.name, 147, 167.91);
        //textos en  rojo
        doc.setFontSize(11.23);
        doc.setTextColor(162, 35, 40);
        doc.text("NO. EMPLEADO:", 147, 198.91); // 198.91
        doc.text("TIPO DE SANGRE:", 305, 198.91); // 198.91
        doc.text("VIGENCIA:", 147, 218.91); // 218.91
        doc.text("NSS:", 305, 218.91); // 218.91
        doc.text("TELÉFONO:", 147, 241.91); // 241.91
        doc.text("CUIP:", 305, 241.91); // 241.91
        doc.text("ALÉRGICO A ALGÚN MEDICAMENTO:", 147, 262.91); // 262.91
        doc.text("CURP:", 147, 282.91); // 282.91
        //doc.text("DOMICILIO:", 147, 282.91);
        doc.text("FIRMA DEL USUARIO", 31, 309.91);
        //TEXTOS EN NEGRO (EDITAR)
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(employee.user_id, 235, 198.91);
        doc.text(employee.employee.medicalData.blood_type || "", 395, 198.91);
        doc.text(year, 235, 218.91);
        doc.text(employee.employee.medicalData.nss || "", 355, 218.91);
        doc.text(employee.employee.enterpriseInformation.phone || "", 235, 241.91);
        doc.text(employee.employee.cuip || "", 341, 241.91);
        doc.text(employee.employee.medicalData.allergies || "Ninguna", 309, 262.91);
        doc.text(employee.employee.curp, 235, 282.91);
        //doc.text(user.address || "", 235, 282.91, { maxWidth: 180 });

        //PARTE TRASERA
        doc.setFillColor(162, 35, 40);
        doc.rect(9, 344.91, 324, 11, "F");
        doc.setFillColor(0, 0, 102);
        doc.rect(9, 364.91, 324, 11, "F");
        doc.setFontSize(9.36);
        doc.setTextColor(0, 0, 102);
        doc.text("FIRMA DEL REPRESENTANTE LEGAL", 223, 432.91, { align: "center" });
        doc.text("PROTECCIÓN ELECTRÓNICA MONTERREY S.A. DE C.V.", 223, 446.91, { align: "center" });
        doc.text("33 PONIENTE 307 COL. CHULAVISTA C.P. 72420", 223, 458.91, { align: "center" });
        doc.text("PUEBLA, PUE. T:222 141 1230 / 222 243 3339 / 222 240 6378", 223, 470.91, { align: "center" });
        doc.text("www.pem-sa.com", 223, 484.91, { align: "center" });

        doc.text("PERMISO SSP FEDERAL: DGSP/303-16/3302", 223, 502.91, { align: "center" });
        doc.text("PERMISO SSP EDO. DE PUEBLA: SSP/SUBCOP/DGSP/506-23/460", 223, 516.91, { align: "center" });
        doc.text("REPSE: STPS/UTD/DGIFT/AR10508/2021", 223, 527.91, { align: "center" });
        doc.text("Registro Patronal: E061123710", 223, 539.91, { align: "center" });
        doc.text("ESTE DOCUMENTO ES OFICIAL DE PROTECCIÓN ELETRÓNICA MONTERREY S.A. DE C.V.", 223, 559.91, { align: "center" });
        doc.text("AMPARA SERVICIOS Y RESPONSABILIDADES. ES PERSONAL E INTRANSFERIBLE", 223, 572.91, { align: "center" });

        return Buffer.from(doc.output('arraybuffer'));
        // doc.save(`${pathFile}/${user.id}/credencial.pdf`);
    }



    private removeFile(path: string, fileName: string) {
        const files = readdirSync(path);
        const file = files.find(fl => fl.startsWith(`${fileName}.`));
        if (file) rmSync(join(path, file));
    }
}