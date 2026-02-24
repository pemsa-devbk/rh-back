import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import { EnterpriseService } from "../services/enterprise.service";
import { CreateSignatureDto } from "../Dto/enterprise/createSignature.dto";
import { QueryRelationsDTO } from "../Dto/query_relations.dto";
import { UpdateSignatureDto } from "../Dto/enterprise/updateSignature.dto";
import { NewSignatureDto } from "../Dto/enterprise/newSignature.dto";

export class EnterpriceController {

    constructor(
        private readonly enterpriseService = new EnterpriseService()
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction) => {
        const createDto = req.body;
        try {
            const enterprise = await this.enterpriseService.create(createDto, req.file);
            res.json(enterprise)
        } catch (error) {
            next(error)
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const pagination = plainToInstance(QueryRelationsDTO, req.query);
            const [enterprises, total] = await this.enterpriseService.getAll(pagination);
            res.json({
                data: enterprises,
                total
            })
        } catch (error) {
            next(error);
        }
    }

    public getOne = async (req: Request, res: Response, next: NextFunction) => {
        const { enterprise_id } = req.params;
        try {
            const enterprise = await this.enterpriseService.getOne(enterprise_id);
            res.json(enterprise)
        } catch (error) {
            next(error);
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction) => {
        const { enterprise_id } = req.params;
        const updateDto = req.body;
        try {
            const enterprise = await this.enterpriseService.update(enterprise_id, updateDto);
            res.json(enterprise)
        } catch (error) {
            next(error);
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const { enterprise_id } = req.params;
        try {
            const enterprise = await this.enterpriseService.delete(enterprise_id);
            res.json(enterprise)
        } catch (error) {
            next(error);
        }
    }

    // * Signature
    public priviewSignature = async (req: Request, res: Response, next: NextFunction) => {
        const { enterprise_id } = req.params;
        const signatureDto = plainToInstance(CreateSignatureDto, req.body);
        try {
            const img = await this.enterpriseService.previewSignature(enterprise_id, signatureDto);
            res.setHeader("Content-Type", "image/png");
            res.setHeader('Content-Disposition', `inline; filename=image.png`);
            res.send(img);
        } catch (error) {
            next(error);
        }
    }

    public createSignature = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const signatureDto = plainToInstance(CreateSignatureDto, req.body);
        try {
            const rp = await this.enterpriseService.createSignature(id, signatureDto);
            res.json({
                rp
            })
        } catch (error) {
            next(error);
        } // 20-12-2022
    }

    public updateSignature = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const signatureDto = plainToInstance(UpdateSignatureDto, req.body);
        try {
            const rp = await this.enterpriseService.updateSignature(id, signatureDto);
            res.json({
                rp
            })
        } catch (error) {
            next(error);
        } // 20-12-2022
    }

    public getSignature = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const siganture = await this.enterpriseService.getSignature(id);
            res.json(siganture)
        } catch (error) {
            next(error);
        }
    }// 20-12-2022

    public newSignature = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const signatureDto = plainToInstance(NewSignatureDto, req.body);
        try {
            const img = await this.enterpriseService.newSignature(id, signatureDto);
            res.setHeader("Content-Type", "image/png");
            res.setHeader('Content-Disposition', `inline; filename=image.png`);
            res.send(img);
        } catch (error) {
            next(error);
        }
    }

}