import { NextFunction, Request, Response } from 'express';
import { FileService } from '../services/file.service';
import mime from 'mime-types'
import { SearchFile } from '../Dto/file/SearchFile.dto';


export class FileController {
    constructor(
        private readonly fileService = new FileService()
    ) { }

    public getAll = async(req:Request, res: Response, next: NextFunction) => {
        const query = req.validatedQuery as SearchFile;
        try {
            const files = await this.fileService.getAll(query);
            res.json(files)
        } catch (error) {
            next(error);
        }
    }

    public create = async(req:Request, res: Response, next: NextFunction) => {
        const dto = req.body;
        try {
            const file = await this.fileService.create(dto);
            res.json(file)
        } catch (error) {
            next(error);
        }
    }

    public update = async(req:Request, res: Response, next: NextFunction) => {
        const dto = req.body;
        const {file_id} = req.params;
        try {
            const file = await this.fileService.update(+file_id, dto);
            res.json(file)
        } catch (error) {
            next(error);
        }
    }

    public changeStatus = async(req:Request, res: Response, next: NextFunction) => {
        const {file_id} = req.params;
        try {
            const file = await this.fileService.changeStatus(+file_id);
            res.json(file)
        } catch (error) {
            next(error);
        }
    }

    public delete = async(req:Request, res: Response, next: NextFunction) => {
        const {file_id} = req.params;
        try {
            const msg = await this.fileService.delete(+file_id);
            res.json({msg}); 
        } catch (error) {
            next(error)
        }
    }

    public uploadForUser = async(req:Request, res: Response, next: NextFunction) => {
        const {file_id, employee_id} = req.params;
        const dto = req.body;
        try {
            const msg = await this.fileService.uploadFileUser(+file_id, employee_id, req.files, dto, req.user)
            res.json({msg})
        } catch (error) {
            next(error);
        }
    }

    public getFileUser = async(req:Request, res: Response, next: NextFunction) => {
        const {file_id, user_id} = req.params;
        try {
            //  const [filename, dir, mimeType] = this.courseService.downloadProof(+course_id, user_id);
            // res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            // res.setHeader('Content-Type', mimeType);
            // res.download(dir, filename, err => {
            //     if (err) {
            //         res.status(500).json({ message: "Error al descargar el archivo" })
            //     }
            // })
        } catch (error) {
            next(error);
        }
    }

    // public uploadFiles = (req: Request, res: Response) => {
    //     try {
    //         const relativePath = req.params[0];
    //         this.fileService.uploadFiles(relativePath, req.files);
    //         res.json({ message: "Archivos subidos" });
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // public donwload = (req: Request, res: Response) => {
    //     const relativePath = req.params[0];
    //     try {
    //         const [filename, dir] = this.fileService.downloadFile(relativePath);
    //         res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    //         res.setHeader('Content-Type', 'application/octet-stream');
    //         res.download(dir, filename, err => {
    //             if (err) {
    //                 res.status(500).json({ message: "Error al descargar el archivo" })
    //             }
    //         })
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    // public listDirecoty = (req: Request, res: Response) => {
    //     const relativePath = req.params[0];
    //     try {
    //         const files = this.fileService.listDirectory(relativePath);
    //         res.json({ content: files });

    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // public rename = (req: Request, res: Response) => {
    //     const { from, to } = req.body;
    //     try {
    //         this.fileService.rename(from, to);
    //         res.json({ message: "Modificado" });

    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // public delete = (req: Request, res: Response) => {
    //     const relativePath = req.params[0];
    //     try {
    //         this.fileService.delete(relativePath);
    //         res.json({ success: true });

    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // public create = (req: Request, res: Response) => {
    //     const { dir } = req.body;
    //     try {
    //         this.fileService.create(dir);
    //         res.json({ success: true });

    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

}

