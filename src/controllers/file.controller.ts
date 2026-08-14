import { NextFunction, Request, Response } from 'express';
import { FileService } from '../services/file.service';


export class FileController {
    constructor(
        private readonly fileService = new FileService()
    ) { }

    public getAll = async(req:Request, res: Response, next: NextFunction) => {
        const query = req.validatedQuery;
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

    public getByEmployee = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        try {
            const files = await this.fileService.getAllByEmployee(employee_id);
            res.json(files); 
        } catch (error) {
            next(error)
        }
    }

    public uploadForUser = async(req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        const dto = req.body;
        try {
            const msg = await this.fileService.uploadFileUser(employee_id, req.files, dto, req.user)
            res.json({msg})
        } catch (error) {
            next(error);
        }
    }

    public getFileEmployee = (req:Request, res: Response, next: NextFunction) => {
        const {file_id, employee_id} = req.params;
        try {
             const [filename, dir, mimeType] = this.fileService.getFileEmployee(+file_id, employee_id);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', mimeType);
            res.download(dir, filename, err => {
                if (err) {
                    res.status(500).json({ message: "Error al descargar el archivo" })
                }
            })
        } catch (error) {
            next(error);
        }
    }

    public getPhotoEmployee = (req:Request, res: Response, next: NextFunction) => {
        const {employee_id} = req.params;
        try {
             const [bufferPhoto, mimeType] = this.fileService.getPhotoEmployee(employee_id);
            res.setHeader('Content-Disposition', `inline; filename="Foto"`);
            res.setHeader('Content-Type', mimeType);
            res.send(bufferPhoto);
        } catch (error) {
            next(error);
        }
    }

    public getCredential = async (req: Request, res: Response, next: NextFunction) => {
        const { employee_id } = req.params;
        const { year } = req.query;
        try {
            const [user, credential] = await this.fileService.getCredential(employee_id, `${year}` );
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=Credencial ${user.name}.pdf`);
            res.send(credential)
        } catch (error) {
            next(error);
        }
    }

    public getSignature = async (req: Request, res: Response, next: NextFunction) => {
        const { employee_id } = req.params;
        try {
            const [user, signatureDir] = await this.fileService.getSignature(employee_id);
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `inline; filename=Firma de correo ${user.name}.png`);
            res.download(signatureDir, 'signature.png', err => {
                if (err) {
                    res.status(500).json({ message: "Error al descargar el archivo" })
                }
            })
        } catch (error) {
            next(error);
        }
    }

    public refreshSignature = async (req: Request, res: Response, next: NextFunction) => {
        const { employee_id } = req.params;
        try {
            const [employee, signature] = await this.fileService.refreshSignature(employee_id );
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `inline; filename=Firma de correo ${employee.name}.png`);
            res.send(signature)
        } catch (error) {
            next(error);
        }
    }

}

