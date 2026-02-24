import { appDataSource } from "../db/dataBase";
import { Contact } from "../db/entities/contact.entity";
import { CreateContactDTO } from "../Dto/contact/createContact.dto";
import { UpDateContactDTO } from "../Dto/contact/upDateContact.dto";
import { PaginationDto } from "../Dto/pagination.dto";

export class ContactService {
    constructor(
        private readonly contactRepository = appDataSource.getRepository(Contact),
    ) { }

    public async create(user_id: string, contactsDto: CreateContactDTO) {
        const contacts = this.contactRepository.create(contactsDto.contacts.map(contact => ({
            ...contact, user_id
        })));
        await this.contactRepository.save(contacts);
        return contacts;
    }

    public getContactsByUser(user_id: string, pagination: PaginationDto) {
        const { skip, take } = pagination;
        return this.contactRepository.findAndCount({
            where: { user_id },
            take, skip
        });
    }

    public async update(user_id: string, contact_id: number, updateDto: UpDateContactDTO): Promise<Contact>{
        const contact = await this.findContact(user_id, contact_id);
        await this.contactRepository.update({contact_id}, updateDto);
        return {...contact, ...updateDto};
    }

    public async delete(user_id: string, contact_id: number){
        const contact = await this.findContact(user_id, contact_id);
        await this.contactRepository.delete({contact_id});
        return contact;
    }

    private async findContact (user_id: string, contact_id: number){
        const contact = await this.contactRepository.findOne({where: {contact_id, user_id}});
        if(!contact) throw 'Contacto no encontrado';
        return contact;
    }
}