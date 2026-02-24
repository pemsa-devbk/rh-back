import { join } from 'path';
import { User } from '../db/entities/user.entity';
import { readFileSync } from 'fs';
import { Resend } from 'resend';
import { enviroment } from '../config/enviroment';
export class EmailService {
    private resend = new Resend(enviroment.RESEND_API_KEY);
    constructor() {

    }
    // TODO Aplicar random para tener una plantilla distinta
    public async sendBirthDaymail(users: User[]) {
        const path = join(__dirname, '../../uploads/birthday/email/html/1.html');
        const content = readFileSync(path, "utf8");
        
        for await (const user of users) {
            const textHtml = this.replaceInFile(content, { name: user.name });
            const { data, error } = await this.resend.emails.send({
                from: 'Acme <onboarding@resend.dev>',
                to: ['prz.rmz.eduardo@gmail.com'], // user.email
                subject: 'Feliz Cumpleaños',
                html: textHtml,
                text: 'Feliz Cumpleaños'
            });
            if (error) {
                console.log({ error });
            }
            console.log({ data });
        }
        return true;

    }

    private replaceInFile(content: string, replacements: Record<string, string>) {
        for (const [key, value] of Object.entries(replacements)) {
            const regex = new RegExp(`{{${key}}}`, "g");
            content = content.replace(regex, value);
        }
        return content;
    }
}