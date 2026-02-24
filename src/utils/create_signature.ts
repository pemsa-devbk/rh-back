import { createCanvas, loadImage, registerFont } from "canvas";
import { Enterprise } from "../db/entities/enterprise.entity";
import { CreateSignatureDto } from "../Dto/enterprise/createSignature.dto";
import { join } from 'path';

interface UserToSignature {
    name: string;
    phone?: string;
    ext?: string;
    cell_phone?: string;
    position?: { name: string }
}
export const createSignature = async (user: UserToSignature, enterprice: Enterprise, signature: CreateSignatureDto) => {
    const canvas = createCanvas(600, 300);
    const ctx = canvas.getContext('2d');
    const path = join(__dirname, '../../public/fonts/bank-gothic-light-bt.ttf');
    registerFont(path, { family: 'BankGothic' });

    let background = await loadImage(signature.background);
    ctx.drawImage(background, 0, 0, 600, 300);
    if (signature.vertical_text) {
        const maxHeight = 180; 
        const minFontSize = 20;
        const maxFontSize = 47;
        let fontSize = maxFontSize;
        ctx.font = `${fontSize}px BankGothic`;
        let textHeight = ctx.measureText(signature.vertical_text).width;
        // Reducimos hasta que quepa
        while (textHeight > maxHeight && fontSize > minFontSize) {
            fontSize -= 1;
            ctx.font = `${fontSize}px BankGothic`;
            textHeight = ctx.measureText(signature.vertical_text).width;
        }
        // Guardar estado antes de rotar
        ctx.save();
        ctx.translate(585, 190);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = signature.color_vertical_text || '#fff';
        ctx.fillText(signature.vertical_text, 0, 0);
        ctx.restore();
    }
    // * Fondos
    if(signature.first_color_first_section || signature.second_color_first_section){
        const grad = ctx.createLinearGradient(0, 0, 400, 0);
        grad.addColorStop(0, signature.first_color_first_section || signature.second_color_first_section);   // inicio
        grad.addColorStop(1, signature.second_color_first_section || signature.first_color_first_section);  // final
        ctx.fillStyle = grad;
        ctx.fillRect(0, 200, 600, 15);
    }
    ctx.strokeStyle = "#5f5f5fff";  
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 200, 600, 15); // x, y, ancho, alto

    if(signature.first_color_third_section || signature.second_color_third_section){
        const radial = ctx.createRadialGradient(300, 270, 10, 300, 270, 300);
        radial.addColorStop(0, signature.first_color_third_section || signature.second_color_third_section);    // centro
        radial.addColorStop(1, signature.second_color_third_section || signature.first_color_third_section); // borde
        ctx.fillStyle = radial;
        roundRect(ctx, 0.5, 245, 599, 54, 20); // último parámetro = radio
        ctx.fill();
    }else{
        roundRect(ctx, 0.5, 245, 599, 54, 20); // último parámetro = radio
    }
    ctx.strokeStyle = "#5f5f5fff";
    ctx.lineWidth = 1;
    ctx.stroke();
    // * Logo
    const logo = await loadImage(signature.url_logo);
    ctx.drawImage(logo, 40, 10, 120, 160);
    ctx.fillStyle = "black";
    ctx.fillRect(199, 10, 1, 170);
    // * Textos centrales
    ctx.font = "bold 16px BankGothic";
    ctx.fillStyle = signature.color_text;
    let text = user.name;
    let textWidth = ctx.measureText(text).width;
    let centerX = 200 + (550 - 200) / 2 - textWidth / 2;
    ctx.fillText(text, centerX, 30);

    ctx.font = "normal 10px BankGothic";
    text = user.position?.name || '';
    textWidth = ctx.measureText(text).width;
    centerX = 200 + (550 - 200) / 2 - textWidth / 2;
    ctx.fillText(text, centerX, 45);
    ctx.font = "normal 10px BankGothic";
    ctx.fillText(enterprice.address, 220, 80);
    // ctx.fillText('C.P.72420, PUEBLA, PUE.', 220, 93);
    ctx.font = "bold 12px BankGothic";
    if (user.phone && user.ext) {
        ctx.fillText(`TEL: ${user.phone}`, 220, 120);
        ctx.fillText(`EXT: ${user.ext}`, 380, 120);
    }
    if (user.cell_phone)
        ctx.fillText(`CEL: ${user.cell_phone}`, 220, 135);
    ctx.font = "bold 14px BankGothic";

    if (signature.extra_text) {
        ctx.fillStyle = signature.color_extra;
        ctx.fillText(signature.extra_text || '#000', 220, 155);
    }
    ctx.fillStyle = signature.color_text;
    ctx.font = "normal 10px BankGothic";
    ctx.fillText(enterprice.name, 220, 175);


    // ? Secciones finales
    ctx.font = "bold 8px BankGothic";
    // ? Parte 1
    text = signature.text_first_section;
    textWidth = ctx.measureText(text).width;
    centerX = 600 / 2 - textWidth / 2;
    ctx.fillText(text, centerX, 210);
    // ? Parte 2
    paintText(ctx, signature.text_second_section, 230, 10)
    // ? Parte 3 
    paintText(ctx, signature.text_third_section, 260, 10)

    return canvas.toBuffer('image/png');
}

const roundRect = (ctx: any, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y);                     // esquina superior izq
    ctx.lineTo(x + width, y);             // arriba
    ctx.lineTo(x + width, y + height - radius); // lado derecho
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius); // esquina inf der
    ctx.lineTo(x + radius, y + height);   // abajo
    ctx.arcTo(x, y + height, x, y + height - radius, radius); // esquina inf izq
    ctx.closePath();
}

const paintText = (ctx: any, originaltext: string, y: number, sum: number) => {
    originaltext.split("\n").forEach((text, idx) => {
        const textWidth = ctx.measureText(text).width;
        const centerX = 600 / 2 - textWidth / 2;
        ctx.fillText(text, centerX, (sum * idx) + y);
    })
}