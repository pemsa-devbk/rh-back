import { plainToInstance } from 'class-transformer';
import { NextFunction, Request, Response } from "express";
import { CreateUserDto } from '../Dto/user/createUser.dto';
import { UserService } from '../services/user.service';
import { QueryRelationsDTO } from '../Dto/query_relations.dto';

export class UserController {
    constructor(
        private readonly userService = new UserService()
    ) { }

    // public create = async (req: Request, res: Response, next: NextFunction) => {
    //     const userDto = plainToInstance(CreateUserDto, req.body, {excludeExtraneousValues: true});
    //     try {
    //         const user = await this.userService.create(userDto, req.user.user_id);
    //         res.json(user)
    //     } catch (error) {
    //         next(error)
    //     }
    // }

    // public getAll = async (req: Request, res: Response, next: NextFunction) => {
    //     const pagination = plainToInstance(QueryRelationsDTO, req.query);
    //     try {
    //         const [users, total] = await this.userService.getAll(pagination);
    //         res.json({
    //             data: users,
    //             total
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // public getOne = async (req: Request, res: Response, next: NextFunction) => {
    //     const { user_id } = req.params;
    //     try {
    //         const user = await this.userService.getOne(user_id);
    //         res.json(user)
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // public update = async (req: Request, res: Response, next: NextFunction) => {
    //     const { user_id } = req.params;
    //     const partialDto = plainToInstance(upDateUserDTO, req.body, {excludeExtraneousValues: true});
    //     try {
    //         const user = await this.userService.update(partialDto, user_id, req.user.user_id);
    //         res.json(user)
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // public getByEnterprise = async (req: Request, res: Response, next: NextFunction) => {
    //     const pagination = plainToInstance(QueryRelationsDTO, req.query);
    //     const {enterprise_id} = req.params;
    //     try {
    //         const [users, total] = await this.userService.getByEnterprise(enterprise_id, pagination);
    //         res.json({
    //             data: users,
    //             total
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // public getByOffice = async (req: Request, res: Response, next: NextFunction) => {
    //     const pagination = plainToInstance(QueryRelationsDTO, req.query);
    //     const {office_id} = req.params;
    //     try {
    //         const [users, total] = await this.userService.getByOffice(+office_id, pagination);
    //         res.json({
    //             data: users,
    //             total
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // public getByArea = async (req: Request, res: Response, next: NextFunction) => {
    //     const pagination = plainToInstance(QueryRelationsDTO, req.query);
    //     const {area_id} = req.params;
    //     try {
    //         const [users, total] = await this.userService.getByArea(+area_id, pagination);
    //         res.json({
    //             data: users,
    //             total
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // }
    // public getByPosition = async (req: Request, res: Response, next: NextFunction) => {
    //     const pagination = plainToInstance(QueryRelationsDTO, req.query);
    //     const {position_id} = req.params;
    //     try {
    //         const [users, total] = await this.userService.getByPosition(+position_id, pagination);
    //         res.json({
    //             data: users,
    //             total
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // public getByCourse = async (req: Request, res: Response, next: NextFunction) => {
    //     const pagination = plainToInstance(QueryRelationsDTO, req.query);
    //     const {course_id} = req.params;
    //     try {
    //         const [users, total] = await this.userService.getByCourse(+course_id, pagination);
    //         res.json({
    //             data: users,
    //             total
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // }
    // // *


    // public updatePhoto = async (req: Request, res: Response, next: NextFunction) => {
    //     const { id } = req.params;
    //     try {
    //         await this.userService.updateFile(id, req.file, 'foto');
    //         res.json({
    //             msg: 'Imagen actualizada'
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // public updateFirma = async (req: Request, res: Response, next: NextFunction) => {
    //     const { id } = req.params;
    //     try {
    //         await this.userService.updateFile(id, req.file, 'firma');
    //         res.json({
    //             msg: 'Imagen actualizada'
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    

    // public getPhoto = async (req: Request, res: Response, next: NextFunction) => {
    //     const { id } = req.params;
    //     const { name = 'foto' } = req.query;
    //     try {
    //         const path = await this.userService.photoUser(id, name.toString());
    //         res.sendFile(path);
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // public getSignature = async (req: Request, res: Response, next: NextFunction) => {
    //     const { id } = req.params;
    //     try {
    //         const img = await this.userService.getEmailSignature(id);
    //         res.setHeader("Content-Type", "image/png");
    //         res.setHeader('Content-Disposition', `inline; filename=image.png`);
    //         res.send(img);
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // public getPublicUser = async (req: Request, res: Response, next: NextFunction) => {
    //     const { id } = req.params;
    //     try {
    //         const user = this.userService.publicUser(id);
    //         res.json({
    //             ...user
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // }
    // public getCredential = async (req: Request, res: Response, next: NextFunction) => {
    //     const { id } = req.params;
    //     try {
    //         const [user, credential] = await this.userService.credencial(id);
    //         res.setHeader('Content-Type', 'application/pdf');
    //         res.setHeader('Content-Disposition', `inline; filename=Credencial ${user.name}.pdf`);
    //         res.send(credential)
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // public updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    //     const { id } = req.params;

    //     try {
    //         const user = await this.userService.updateStatus(id, req.user.user_id);
    //         res.json({
    //             ...user
    //         })
    //     } catch (error) {
    //         next(error);
    //     }
    // }


}
