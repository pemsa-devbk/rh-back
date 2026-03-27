import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, extname, join, normalize } from 'path';
import mime from 'mime-types'
import { CreateFileDTO } from '../Dto/file/createFile.dto';
import { appDataSource } from '../db/dataBase';
import { File } from '../db/entities/file.entity';
import { UpdateFileDTO } from '../Dto/file/updateFile.dto';
import { CustomError } from '../utils/error';
import { SearchFile } from '../Dto/file/SearchFile.dto';
import { ColumnTypeMap } from '../types/search_type';
import { applySearch } from '../utils/applySearch';
import { FileArray } from 'express-fileupload';
import { EmployeeFiles } from '../db/entities/employee_files.entity';
import { UploadFileDTO } from '../Dto/file/uploadFile.dto';
import { User } from '../db/entities/user.entity';

const FILE_COLUMNS_TYPES: ColumnTypeMap<File> = {
    // * entidad principal
    name: { type: 'text', alias: 'file' },
    key: { type: 'text', alias: 'file' },
    valid_mime_types: { type: 'text', alias: 'file' },
    description: { type: 'text', alias: 'file' },
    created_at: { type: 'date', alias: 'file' },
    is_active: { type: 'boolean', alias: 'file' },
    is_required: { type: 'boolean', alias: 'file' }
};
const UPLOADS_DIR_USERS = join(__dirname, "..", "..", "uploads", "employees");

export class FileService {

    constructor(
        private readonly repository = appDataSource.getRepository(File),
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

    public async getAll(searchDTO: SearchFile) {
        const { orderBy = 'created_at', orderDirection } = searchDTO;
        const query = this.repository.createQueryBuilder('file');
        applySearch(query, searchDTO, FILE_COLUMNS_TYPES);
        const orderConfig = FILE_COLUMNS_TYPES[orderBy];
        const orderField = orderConfig
            ? `${orderConfig.alias}.${orderBy}` // columna registrada en el mapa
            : `file.${orderBy}`;

        return query.orderBy(orderField, orderDirection).getMany();
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

    public async uploadFileUser(file_id: number, employee_id: string, files: FileArray, uploadDTO: UploadFileDTO, user: User) {
        const dir = normalize(join(UPLOADS_DIR_USERS, employee_id, 'docs'));
        if (!dir.startsWith(UPLOADS_DIR_USERS)) throw "Directorio no permitirdo";
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

        return this.repository.manager.transaction(async (transactionalEntityManager) => {
            const fileConfig = await transactionalEntityManager.findOneBy(File, { file_id });
            if (!fileConfig) throw new CustomError('Configuración de archivo no existente', 400);
            if (!fileConfig.is_active) throw new CustomError('El archivo esta marcado como inactivo, no se podrá subir hasta activar el archivo', 400);
            if (!files[fileConfig.key]) throw new CustomError('Clave no valida para el archivo', 400);

            const simpleFile = files[fileConfig.key];

            if (Array.isArray(simpleFile)) throw new CustomError('Solo se acepta un archivo', 400);
            if (!fileConfig.valid_mime_types.includes(simpleFile.mimetype)) throw new CustomError('Tipo de archivo no soportado', 400);
            if ((fileConfig.max_size * 1000000) < simpleFile.size) throw new CustomError('El tamaño de archivo excede el limite permitido', 400);

            //* Guardar en employeeFile
            const userFile = await transactionalEntityManager.findOneBy(EmployeeFiles, { employee_id, file_id });
            if (!userFile) await transactionalEntityManager.insert(EmployeeFiles, { file_id, employee_id, uploaded_by: user.user_id, ...uploadDTO });
            else await transactionalEntityManager.update(EmployeeFiles, userFile ,{ uploaded_by: user.user_id, ...uploadDTO });

            const ext = mime.extension(simpleFile.mimetype);
            const relativeName = `FILE_${fileConfig.file_id}.`;
            const uploadPath = join(dir, `${relativeName}${ext}`);
            this.removeFile(dir, relativeName);
            await simpleFile.mv(uploadPath);

            return `Archivo ${fileConfig.name} subido correcatmente`;
        });

    }

    public async getFileUser(file_id: number, user_id: string) {
        // const userDir = join(__dirname, "..", "..", 'uploads/users', user_id, 'courses');
        //         const proofs = readdirSync(userDir);
        //         const file = proofs.find(proof => proof.includes(`${user_id}_${course_id}.`));
        //         if (!file) throw 'Archivo no encontrado';
        //         const dirFile = join(userDir, file);
        //         const mimeType = mime.lookup(file) || 'application/octet-stream';
        //         return [file, dirFile, mimeType];
    }

    // public downloadFile(relativePath: string) {
    //     const dir = normalize(join(UPLOADS_DIR_USERS, relativePath));

    //     if (!dir.startsWith(UPLOADS_DIR_USERS)) throw "Directorio no permitirdo";
    //     if (!existsSync(dir)) throw "Archivo no existente";

    //     if (statSync(dir).isDirectory()) throw "El archivo solicitado es un directorio";
    //     const filename = relativePath.split("/").pop();
    //     return [filename, dir];
    // }

    // public listDirectory(relativePath: string) {
    //     const dir = normalize(join(UPLOADS_DIR_USERS, relativePath));

    //     if (!dir.startsWith(UPLOADS_DIR_USERS)) throw "Directorio no permitirdo";
    //     if (!existsSync(dir)) throw "Directorio no existente";

    //     return readdirSync(dir, { withFileTypes: true }).map(entry => ({
    //         name: entry.name,
    //         type: entry.isDirectory() ? 'directory' : 'file'
    //     })).sort((a, b) => {
    //         if (a.type === 'directory' && b.type === 'file') return -1;
    //         if (a.type === 'file' && b.type === 'directory') return 1;
    //     });
    // }

    // public rename(from: string, to: string) {
    //     const fromPath = normalize(join(UPLOADS_DIR_USERS, from));

    //     if (!fromPath.startsWith(UPLOADS_DIR_USERS)) throw 'Ruta no permitida';


    //     if (!existsSync(fromPath)) throw 'Origen no existe';

    //     const stat = statSync(fromPath);

    //     const dir = dirname(fromPath);
    //     let newName = to;
    //     if (stat.isFile) {
    //         const ext = extname(fromPath);
    //         if (!extname(to)) newName += ext;
    //     }
    //     const toPath = normalize(join(dir, newName));

    //     renameSync(fromPath, toPath);
    //     return true;
    // }

    // public delete(relativePath: string) {
    //     const targetPath = normalize(join(UPLOADS_DIR_USERS, relativePath));

    //     if (!targetPath.startsWith(UPLOADS_DIR_USERS)) throw 'Ruta no permitida';


    //     if (!existsSync(targetPath)) throw 'Archivo o directorio no existe';


    //     const stat = statSync(targetPath);
    //     if (stat.isDirectory()) {
    //         rmSync(targetPath, { recursive: true, force: true });
    //     } else {
    //         unlinkSync(targetPath);
    //     }
    //     return true;
    // }

    // public create(dir: string) {
    //     const dirPath = normalize(join(UPLOADS_DIR_USERS, dir));
    //     if (!dirPath.startsWith(UPLOADS_DIR_USERS)) throw  'Ruta no permitida';
    //     if (existsSync(dirPath)) throw  'El directorio ya existe';
    //     mkdirSync(dirPath, { recursive: true });
    //     return true;
    // }

    private removeFile(path: string, fileName: string) {
        const files = readdirSync(path);
        const file = files.find(fl => fl.startsWith(`${fileName}.`));
        if (file) rmSync(join(path, file));
    }
}