import { join } from "path";
import { appDataSource } from "../db/dataBase";
import { Binnacle } from "../db/entities/binnacle.entity";
import { User } from "../db/entities/user.entity";
import { CreateUserDto } from "../Dto/user/createUser.dto";
import { validRoles } from "../types/enums/roles";
import { ValidStateMov } from "../types/enums/validMov";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, unlinkSync, writeFileSync } from 'fs';
import { upDateUserDTO } from "../Dto/user/upDateUser.dto";
import { StatusUser } from "../types/enums/status_user";
import jsPDF from "jspdf";
import base64 from 'base-64';
import qrcode from 'qrcode';
import bcrypt from 'bcrypt';
import { SystemConfiguration } from "../db/entities/system_configuration";
import { QueryRelationsDTO } from "../Dto/query_relations.dto";
import { createSignature } from "../utils/create_signature";

// TODO: Directorio privado para vacaciones y cursos
// TODO: Crear contraseña aleatoria

enum UserQueryContext {
    FROM_ENTERPRISE = 'FROM_ENTERPRISE', // Desde /enterprise/:id/users
    FROM_OFFICE = 'FROM_OFFICE', // Desde offices/:id/users
    FROM_AREA = 'FROM_AREA', // Desde areea/:id/users
    FROM_POSITION = 'FROM_POSITION', // Desde positions/:id/users
    FROM_COURSE = 'FROM_COURSE', // Desde course/:id/courses
    FROM_GENERAL = 'FROM_GENERAL' // Desde /users
}
// TODO Cambiar documentos 
/**
 * 1. Para upload de todos los docuemntos sera en la carpeta id/docs/
 * 2. Las carpetas /id/holidays y /id/courses seran privadas junto con la foto y firma del usuario.
 * 3. La ruta para obtener la foto del usuaio será publica la de la firma no. 
 */
export class UserService {

    constructor(
        public userRepository = appDataSource.getRepository(User),
        private readonly systemConfigRepository = appDataSource.getRepository(SystemConfiguration),
    ) { }

    // public create(userDto: CreateUserDto, employeeId: string) {
    //     const dir = join(__dirname, "..", "..", "uploads", 'users', userDto.user_id);
    //     return this.userRepository.manager.transaction(async (transactionalEntityManager) => {

    //         const user = await transactionalEntityManager.save(User, { ...userDto, password: bcrypt.hashSync('1234', 10) });

    //         if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); // Crear la carpeta
    //         mkdirSync(dir + '/docs');
    //         mkdirSync(dir + '/holidays');
    //         mkdirSync(dir + '/courses');

    //         await transactionalEntityManager.insert(Binnacle, {
    //             modified_user_id: userDto.user_id,
    //             modifier_user_id: employeeId,
    //             type: ValidStateMov.alta
    //         });

    //         return user;
    //     })
    // }

    // public getAll(pagination: QueryRelationsDTO) {
    //     // TODO reparar carpetas
    //     // const dir = join(__dirname, "..", "..", "uploads", 'users');
    //     // const users = readdirSync(dir);
    //     // users.map(user => {
    //     //     const dirs = readdirSync(join(dir, user));
    //     //     console.log(dirs);
    //     //     mkdirSync(join(dir,user,'courses'))
    //     //     // if(dirs.includes('vacaciones')){
    //     //     //     rmSync(join(dir,user,'vacaciones'), {recursive: true})
    //     //     // }
    //     // })
            
    //     const { skip, take, search } = pagination;
    //     const query = this.getQuery(UserQueryContext.FROM_GENERAL)
    //         .where("user.rol != :rol", { rol: validRoles.SUPER_USER })
    //         .skip(skip).take(take);
    //     if (search) query.andWhere("user.name LIKE :search", { search: `%${search}%` });
    //     return query.getManyAndCount();
    // }

    // public async getOne(user_id: string) {
    //     const query = this.getQuery(UserQueryContext.FROM_GENERAL)
    //     query.where('user.user_id = :user_id', { user_id })
    //     const user = await query.getOne();
    //     if (!user) throw "Usuario no encontrado";
    //     return user;
    // }

    // public async update(patialUser: upDateUserDTO, user_id: string, employeeId: string): Promise<User> {
    //     const user = await this.findOneOrFail(user_id);
    //     return this.userRepository.manager.transaction(async (transactionalEntityManager) => {
    //         await transactionalEntityManager.update(User, { user_id }, patialUser);

    //         await transactionalEntityManager.insert(Binnacle, {
    //             modified_user_id: user_id,
    //             modifier_user_id: employeeId,
    //             type: ValidStateMov.edicion
    //         });
    //         return { ...user, ...patialUser };
    //     });
    // }

    // public getByEnterprise(enterprise_id: string, pagination: QueryRelationsDTO){
    //     const { skip, take, search } = pagination;
    //     const query = this.getQuery(UserQueryContext.FROM_GENERAL)
    //         .where("user.rol != :rol", { rol: validRoles.SUPER_USER })
    //         .andWhere("office.enterprise_id = :enterprise_id", {enterprise_id})
    //         .skip(skip).take(take);
    //     if (search) query.andWhere("user.name LIKE :search", { search: `%${search}%` });
    //     return query.getManyAndCount();
    // }

    // public getByOffice(office_id: number, pagination: QueryRelationsDTO){
    //     const { skip, take, search } = pagination;
    //     const query = this.getQuery(UserQueryContext.FROM_GENERAL)
    //         .where("user.rol != :rol", { rol: validRoles.SUPER_USER })
    //         .andWhere("area.office_id = :office_id", {office_id})
    //         .skip(skip).take(take);
    //     if (search) query.andWhere("user.name LIKE :search", { search: `%${search}%` });
    //     return query.getManyAndCount();
    // }

    // public getByArea(area_id: number, pagination: QueryRelationsDTO){
    //     const { skip, take, search } = pagination;
    //     const query = this.getQuery(UserQueryContext.FROM_GENERAL)
    //         .where("user.rol != :rol", { rol: validRoles.SUPER_USER })
    //         .andWhere("position.area_id = :area_id", {area_id})
    //         .skip(skip).take(take);
    //     if (search) query.andWhere("user.name LIKE :search", { search: `%${search}%` });
    //     return query.getManyAndCount();
    // }

    // public getByPosition(position_id: number, pagination: QueryRelationsDTO){
    //     const { skip, take, search } = pagination;
    //     const query = this.getQuery(UserQueryContext.FROM_GENERAL)
    //         .where("user.rol != :rol", { rol: validRoles.SUPER_USER })
    //         .andWhere("user.position_id = :position_id", {position_id})
    //         .skip(skip).take(take);
    //     if (search) query.andWhere("user.name LIKE :search", { search: `%${search}%` });
    //     return query.getManyAndCount();
    // }
    
    // public getByCourse(course_id: number, pagination: QueryRelationsDTO){
    //     const { skip, take, search } = pagination;
    //     const query = this.getQuery(UserQueryContext.FROM_COURSE)
    //         .where("user.rol != :rol", { rol: validRoles.SUPER_USER })
    //         .andWhere("courses.course_id = :course_id", {course_id})
    //         .skip(skip).take(take);
    //     if (search) query.andWhere("user.name LIKE :search", { search: `%${search}%` });
    //     return query.getManyAndCount();

    // }




    // public async updateFile(user_id: string, file: Express.Multer.File, type: 'foto' | 'firma') {
    //     const userDir = join(__dirname, "..", "..", 'uploads/users', user_id);
    //     this.deleteFile(userDir, type);
    //     const ext = this.validateExt(file.originalname);

    //     const filepath = join(userDir, `${file.fieldname}.${ext}`);
    //     writeFileSync(filepath, file.buffer);
    //     return true;
    // }

    

    // public async updateStatus(user_id: string, employeeId: string) {
    //     const user = await this.getOne(user_id);
    //     if (user.status == StatusUser.vacaciones) throw "El suaurio se encuentra en vacaciones";
    //     return this.userRepository.manager.transaction(async (transactionalEntityManager) => {
    //         await transactionalEntityManager.update(User, { user_id }, { status: (user.status == StatusUser.activo) ? StatusUser.baja : StatusUser.activo });
    //         await transactionalEntityManager.insert(Binnacle, {
    //             modified_user_id: user_id,
    //             modifier_user_id: employeeId,
    //             type: (user.status) ? ValidStateMov.baja : ValidStateMov.reintegro,
    //         })

    //         return user;
    //     });
    // }

    // public async photoUser(user_id: string, name: string) {
    //     const pathFile = join(__dirname, "..", "..", "uploads/users", user_id);
    //     if (!existsSync(pathFile)) throw "Directorio no existente";
    //     const files = readdirSync(pathFile);

    //     const fileImgUser = files.find(file => file.includes(name.toString()));
    //     if (!fileImgUser) throw "El usuario aun no tiene foto";

    //     return `${pathFile}/${fileImgUser}`;
    // }

    // public async publicUser(user_id: string) {
    //     const user = await this.userRepository.createQueryBuilder('user')
    //         .select(['user.user_id', 'user.name', 'user.status', 'user'])
    //         .leftJoin('user.office', 'office')
    //         .leftJoin('user.area', 'area')
    //         .leftJoin('user.position', 'position')
    //         .addSelect(['office.name, area.name, position.name'])
    //         .where('user.user_id = :user_id', { user_id })
    //         .getOne();
    //     if (!user) throw "Usuario no encontrado";
    //     return user;
    // }

    // public async credencial(user_id: string): Promise<[User, Buffer<ArrayBufferLike>]> {
    //     const user = await this.userRepository.createQueryBuilder('user')
    //         .leftJoin('user.position', 'position')
    //         .addSelect(['position.name'])
    //         .where('user.user_id = :user_id', { user_id })
    //         .getOne();
    //     if (!user) throw "Usuario no encontrado";

    //     const credential = await this.createCredencial(user);
    //     return [user, credential];
    // }

    // public async getEmailSignature(user_id: string) {
    //     const user = await this.userRepository.findOne({ where: { user_id }, relations: { position: { area: { deparment: {office: { enterprise: { signature: true } }} } } } });
    //     const enterprise = user.position.area.deparment.office.enterprise;
    //     return createSignature(user, enterprise, enterprise.signature);
    // }

    // private getQuery(context: UserQueryContext) {
    //     const query = this.userRepository.createQueryBuilder('user')
    //         .select(['user.user_id', 'user.name', 'user.phone', 'user.cell_phone', 'user.email', 'user.ext', 'user.gender', 'user.birthdate', 'user.curp', 'user.address', 'user.blood_type', 'user.allergies', 'user.nss', 'user.cuip', 'user.rol', 'user.status', 'user.vacation_days', 'user.contract_date', 'user.update_at', 'user.deleted_at', 'user.user_chief_id', 'user.position_id']);

    //     switch (context) {
    //         case UserQueryContext.FROM_ENTERPRISE:
    //             // Necesito usuario, officina, area y position 
    //             query.leftJoin('user.userChief', 'chief')
    //                 .leftJoin('user.position', 'position')
    //                 .leftJoin('position.area', 'area')
    //                 .leftJoin('area.office', 'office')
    //                 .addSelect(['chief.name', 'office.office_id', 'office.name', 'area.area_id', 'area.name', 'position.name']);
    //             break;
    //         case UserQueryContext.FROM_OFFICE:
    //             // Necesito usuario, area y position 
    //             query.leftJoin('user.userChief', 'chief')
    //                 .leftJoin('user.position', 'position')
    //                 .leftJoin('position.area', 'area')
    //                 .addSelect(['chief.name', 'area.area_id', 'area.name', 'position.name']);
    //             break;
    //         case UserQueryContext.FROM_AREA:
    //             // Necesito usuario y position 
    //             query.leftJoin('user.userChief', 'chief')
    //                 .leftJoin('user.position', 'position')
    //                 .addSelect(['chief.name', 'position.name']);
    //             break;
    //         case UserQueryContext.FROM_COURSE:
    //             // Necesito usuario, officina, area y position 
    //             query.leftJoin('user.courseUsers', 'courses')
    //             .addSelect(['courses.haveProof'])
    //             break;
    //         case UserQueryContext.FROM_GENERAL:
    //             // Nenecito todo usuario, empresa, officina, area y position 
    //             query.leftJoin('user.userChief', 'chief')
    //                 .leftJoin('user.position', 'position')
    //                 .leftJoin('position.area', 'area')
    //                 .leftJoin('area.office', 'office')
    //                 .leftJoin('office.enterprise', 'enterprise')
    //                 .addSelect(['chief.name', 'office.office_id', 'office.name', 'area.area_id', 'area.name', 'position.name', 'enterprise.enterprise_id', 'enterprise.name']);
    //             break;
    //         default: break;
    //     }

    //     return query;
    // }

    // private async findOneOrFail(user_id: string) {
    //     const user = await this.userRepository.findOne({ where: { user_id } });
    //     if (!user) throw 'Usuario no encontrado';
    //     return user;
    // }




    // TODO: Solo buscar el usuario RL y las fotos tenerlas en configuración
    // private async createCredencial(user: User) {
    //     const pathFile = join(__dirname, "..", "..", "uploads/users");
    //     const users = await this.systemConfigRepository.find({ relations: { user: true } });
    //     const doc = new jsPDF({
    //         unit: 'px',
    //         compress: true
    //     });
    //     const logo1 = readFileSync(join(__dirname, "../..", "public/img/logo1.png"));
    //     const logo2 = readFileSync(join(__dirname, "../..", "public/img/logo2.png"));
    //     const rl = users.find(us => us.key == 'RL').user;

    //     const imgRP = readFileSync(`${pathFile}/${rl.user_id}/firma.png`);

    //     const files = readdirSync(`${pathFile}/${user.user_id}`);

    //     const fileImgUser = files.find(file => file.includes('foto'));
    //     const fileFirUser = files.find(file => file.includes('firma'));

    //     //User image
    //     fileImgUser && doc.addImage(readFileSync(`${pathFile}/${user.user_id}/${fileImgUser}`), fileImgUser.includes('png') ? "PNG" : "JPEG", 18, 110, 114, 128);
    //     // logo 1 image
    //     doc.addImage(logo1, "PNG", 346, 52.91, 85, 85);
    //     // logo 2 image
    //     doc.addImage(logo2, "PNG", 346, 333.91, 91, 115);
    //     // QR image
    //     const idEncode = base64.encode(user.user_id);
    //     const code = await qrcode.toBuffer(`https://www.pem-sa.com.mx/personal/${idEncode}`, { type: 'png' });

    //     doc.addImage(code, "PNG", 18, 388.91, 91, 91);
    //     // firma user image
    //     fileFirUser && doc.addImage(readFileSync(`${pathFile}/${user.user_id}/${fileFirUser}`), "PNG", 18, 251.91, 114, 45);
    //     // firma rep legal 
    //     doc.addImage(imgRP, "PNG", 153, 385.91, 137, 39);


    //     doc.setFont("helvetica", "bold");
    //     doc.setFontSize(22.28);
    //     doc.setTextColor(162, 35, 40);
    //     doc.text("CREDENCIAL", 23, 68.91);
    //     doc.setFillColor(162, 35, 40);
    //     doc.rect(9, 71.91, 324, 11, "F");
    //     doc.setFillColor(0, 0, 102);
    //     doc.rect(9, 91.91, 324, 11, "F");
    //     doc.setFont("helvetica", "bold");
    //     doc.setTextColor(0, 0, 0);
    //     doc.setFontSize(17.6);
    //     doc.text(user.name, 147, 150.91);
    //     doc.setFontSize(13.11);
    //     doc.text(user.position.name, 147, 167.91);
    //     //textos en  rojo
    //     doc.setFontSize(11.23);
    //     doc.setTextColor(162, 35, 40);
    //     doc.text("NO. EMPLEADO:", 147, 198.91); // 198.91
    //     doc.text("TIPO DE SANGRE:", 305, 198.91); // 198.91
    //     doc.text("VIGENCIA:", 147, 218.91); // 218.91
    //     doc.text("NSS:", 305, 218.91); // 218.91
    //     doc.text("TELÉFONO:", 147, 241.91); // 241.91
    //     doc.text("CUIP:", 305, 241.91); // 241.91
    //     doc.text("ALÉRGICO A ALGÚN MEDICAMENTO:", 147, 262.91); // 262.91
    //     doc.text("CURP:", 147, 282.91); // 282.91
    //     //doc.text("DOMICILIO:", 147, 282.91);
    //     doc.text("FIRMA DEL USUARIO", 31, 309.91);
    //     //TEXTOS EN NEGRO (EDITAR)
    //     doc.setTextColor(0, 0, 0);
    //     doc.setFont("helvetica", "bold");
    //     doc.text(user.user_id, 235, 198.91);
    //     doc.text(user.medicalData.blood_type || "", 395, 198.91);
    //     doc.text("2026", 235, 218.91);
    //     doc.text(user.medicalData.nss || "", 355, 218.91);
    //     doc.text(user.enterpriseInformation.phone || "", 235, 241.91);
    //     doc.text(user.cuip || "", 341, 241.91);
    //     doc.text(user.medicalData.allergies || "Ninguna", 309, 262.91);
    //     doc.text(user.curp, 235, 282.91);
    //     //doc.text(user.address || "", 235, 282.91, { maxWidth: 180 });

    //     //PARTE TRASERA
    //     doc.setFillColor(162, 35, 40);
    //     doc.rect(9, 344.91, 324, 11, "F");
    //     doc.setFillColor(0, 0, 102);
    //     doc.rect(9, 364.91, 324, 11, "F");
    //     doc.setFontSize(9.36);
    //     doc.setTextColor(0, 0, 102);
    //     doc.text("FIRMA DEL REPRESENTANTE LEGAL", 223, 432.91, { align: "center" });
    //     doc.text("PROTECCIÓN ELECTRÓNICA MONTERREY S.A. DE C.V.", 223, 446.91, { align: "center" });
    //     doc.text("33 PONIENTE 307 COL. CHULAVISTA C.P. 72420", 223, 458.91, { align: "center" });
    //     doc.text("PUEBLA, PUE. T:222 141 1230 / 222 243 3339 / 222 240 6378", 223, 470.91, { align: "center" });
    //     doc.text("www.pem-sa.com", 223, 484.91, { align: "center" });

    //     doc.text("PERMISO SSP FEDERAL: DGSP/303-16/3302", 223, 502.91, { align: "center" });
    //     doc.text("PERMISO SSP EDO. DE PUEBLA: SSP/SUBCOP/DGSP/506-23/460", 223, 516.91, { align: "center" });
    //     doc.text("REPSE: STPS/UTD/DGIFT/AR10508/2021", 223, 527.91, { align: "center" });
    //     doc.text("Registro Patronal: E061123710", 223, 539.91, { align: "center" });
    //     doc.text("ESTE DOCUMENTO ES OFICIAL DE PROTECCIÓN ELETRÓNICA MONTERREY S.A. DE C.V.", 223, 559.91, { align: "center" });
    //     doc.text("AMPARA SERVICIOS Y RESPONSABILIDADES. ES PERSONAL E INTRANSFERIBLE", 223, 572.91, { align: "center" });

    //     return Buffer.from(doc.output('arraybuffer'));
    //     // doc.save(`${pathFile}/${user.id}/credencial.pdf`);
    // }

    // private deleteFile(dir: string, file: string, ext: string = '') {
    //     if (!existsSync(dir)) throw "No existe el directorio";
    //     const existingFiles = readdirSync(dir);

    //     for (const f of existingFiles) {
    //         if (f.startsWith(file + '.' + ext)) {
    //             unlinkSync(join(dir, f));
    //         }
    //     }
    // }

    // private validateExt(name: string) {
    //     const validaExten = name.split('.');
    //     if (validaExten.length < 2) throw "Archivo no valido"
    //     return validaExten.pop();
    // }


}