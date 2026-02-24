import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, extname, join, normalize } from 'path';

const UPLOADS_DIR_USERS = join(__dirname, "..", "..", "uploads", "users");

export class FileService {

    public uploadFiles(relativePath: string, files?: Express.Multer.File[] | {
        [fieldname: string]: Express.Multer.File[];
    }) {
        const dir = normalize(join(UPLOADS_DIR_USERS, relativePath));

        if (!dir.startsWith(UPLOADS_DIR_USERS)) throw "Directorio no permitirdo";
        if (!existsSync(dir)) throw "Directorio no existente";

        if (files) {
            if (Array.isArray(files))
                for (const file of files) {
                    const filepath = join(dir, `${file.originalname}`);
                    writeFileSync(filepath, file.buffer);
                }
            else {
                Object.values(files).forEach(file => {
                    const filepath = join(dir, `${file[0].originalname}`);
                    writeFileSync(filepath, file[0].buffer);
                })
            }
        }
        return true;
    }

    public downloadFile(relativePath: string) {
        const dir = normalize(join(UPLOADS_DIR_USERS, relativePath));

        if (!dir.startsWith(UPLOADS_DIR_USERS)) throw "Directorio no permitirdo";
        if (!existsSync(dir)) throw "Archivo no existente";

        if (statSync(dir).isDirectory()) throw "El archivo solicitado es un directorio";
        const filename = relativePath.split("/").pop();
        return [filename, dir];
    }

    public listDirectory(relativePath: string) {
        const dir = normalize(join(UPLOADS_DIR_USERS, relativePath));

        if (!dir.startsWith(UPLOADS_DIR_USERS)) throw "Directorio no permitirdo";
        if (!existsSync(dir)) throw "Directorio no existente";

        return readdirSync(dir, { withFileTypes: true }).map(entry => ({
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file'
        })).sort((a, b) => {
            if (a.type === 'directory' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'directory') return 1;
        });
    }

    public rename(from: string, to: string) {
        const fromPath = normalize(join(UPLOADS_DIR_USERS, from));

        if (!fromPath.startsWith(UPLOADS_DIR_USERS)) throw 'Ruta no permitida';


        if (!existsSync(fromPath)) throw 'Origen no existe';

        const stat = statSync(fromPath);

        const dir = dirname(fromPath);
        let newName = to;
        if (stat.isFile) {
            const ext = extname(fromPath);
            if (!extname(to)) newName += ext;
        }
        const toPath = normalize(join(dir, newName));

        renameSync(fromPath, toPath);
        return true;
    }

    public delete(relativePath: string) {
        const targetPath = normalize(join(UPLOADS_DIR_USERS, relativePath));

        if (!targetPath.startsWith(UPLOADS_DIR_USERS)) throw 'Ruta no permitida';


        if (!existsSync(targetPath)) throw 'Archivo o directorio no existe';


        const stat = statSync(targetPath);
        if (stat.isDirectory()) {
            rmSync(targetPath, { recursive: true, force: true });
        } else {
            unlinkSync(targetPath);
        }
        return true;
    }

    public create(dir: string) {
        const dirPath = normalize(join(UPLOADS_DIR_USERS, dir));
        if (!dirPath.startsWith(UPLOADS_DIR_USERS)) throw  'Ruta no permitida';
        if (existsSync(dirPath)) throw  'El directorio ya existe';
        mkdirSync(dirPath, { recursive: true });
        return true;
    }
}