import { Request, Response } from 'express';
import { FileService } from '../services/file.service';

export class FileController {
    constructor(
        private readonly fileService = new FileService()
    ) { }

    public uploadFiles = (req: Request, res: Response) => {
        try {
            const relativePath = req.params[0];
            this.fileService.uploadFiles(relativePath, req.files);
            res.json({ message: "Archivos subidos" });
        } catch (error) {
            console.log(error);
        }
    }

    public donwload = (req: Request, res: Response) => {
        const relativePath = req.params[0];
        try {
            const [filename, dir] = this.fileService.downloadFile(relativePath);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.download(dir, filename, err => {
                if (err) {
                    res.status(500).json({ message: "Error al descargar el archivo" })
                }
            })
        } catch (error) {
            console.log(error);
        }
    }
    public listDirecoty = (req: Request, res: Response) => {
        const relativePath = req.params[0];
        try {
            const files = this.fileService.listDirectory(relativePath);
            res.json({ content: files });

        } catch (error) {
            console.log(error);
        }
    }

    public rename = (req: Request, res: Response) => {
        const { from, to } = req.body;
        try {
            this.fileService.rename(from, to);
            res.json({ message: "Modificado" });

        } catch (error) {
            console.log(error);
        }
    }

    public delete = (req: Request, res: Response) => {
        const relativePath = req.params[0];
        try {
            this.fileService.delete(relativePath);
            res.json({ success: true });

        } catch (error) {
            console.log(error);
        }
    }

    public create = (req: Request, res: Response) => {
        const { dir } = req.body;
        try {
            this.fileService.create(dir);
            res.json({ success: true });

        } catch (error) {
            console.log(error);
        }
    }

}

