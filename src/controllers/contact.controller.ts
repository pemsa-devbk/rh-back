import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { PaginationDto } from "../Dto/pagination.dto";
import { ContactService } from "../services/contact.service";

export class ContactController {
    constructor(
        private readonly contactService = new ContactService()
    ) { }

    public create = async (req: Request, res: Response, next: NextFunction) => {
        const { user_id } = req.params;
        const createContact = req.body;
        try {
            const contacts = await this.contactService.create(user_id, createContact);
            res.json(
                contacts
            )
        } catch (error) {
            next(error);
        }
    }

    public getByUser = async (req: Request, res: Response, next: NextFunction) => {
        const { user_id } = req.params;
        const paginationDto = plainToInstance(PaginationDto, req.query);
        try {
            const [contacts, total] = await this.contactService.getContactsByUser(user_id, paginationDto);
            res.json({
                data: contacts,
                total
            })
        } catch (error) {
            next(error);
        }
    }
    public update = async (req: Request, res: Response, next: NextFunction) => {
        const { user_id, contact_id } = req.params;
        const updateDto = req.body;
        try {
            const contact = await this.contactService.update(user_id, +contact_id, updateDto);
            res.json(contact)
        } catch (error) {
            next(error);
        }
    }
    public delete = async (req: Request, res: Response, next: NextFunction) => {
        const { user_id, contact_id } = req.params;
        try {
            const contact = await this.contactService.delete(user_id, +contact_id);
            res.json(contact)
        } catch (error) {
            next(error);
        }
    }
}