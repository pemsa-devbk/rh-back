import jsPDF from "jspdf";
import { join } from 'path';
import { User } from "../db/entities/user.entity";
import dayjs from '../utils/dayjs';
import { readdirSync } from "fs";

interface Template {
    withImage: boolean;
    positionDay: 'T' | 'B' | 'C';
    formatDay: 'Number' | 'Text';
    colorBackgroundDay: string;
    colorTextDay: string;
    withPosition: boolean;
    borderImage: boolean;
}

interface GridLayout {
    elementWidth: number;
    elementHeight: number;
    spaceX: number;
    spaceY: number;
}

interface GridResult {
    cols: number;
    rows: number;
    elementWidth: number;
    elementHeight: number;
    spaceX: number;
    spaceY: number;
}

export class BirthdayService {

    private readonly pathSources = join(__dirname, '..', '..', 'uploads', 'birthday');
    private readonly pathUsers = join(__dirname, '..', '..', 'uploads', 'users');
    constructor() { }

    // TODO: posibilidad de modificar el spacio en casos de pocos usuarios
    // public template_1(users: User[]) {

    //     const doc = new jsPDF({
    //         unit: 'px',
    //         compress: true
    //     });
    //     const pathLogo = join(__dirname, '..', '..', 'public', 'img', 'logo1.png');
    //     const chunks = [];
    //     for (let i = 0; i < users.length; i += 10) {
    //         const chunk = users.slice(i, i + 10);
    //         chunks.push(chunk);
    //     }
    //     const padding = 15;
    //     const drawUserCard = (
    //         x: number,
    //         y: number,
    //         textDay: string,
    //         textWidth: number,
    //         user: User
    //     ) => {
    //         // Fondo principal (naranja)
    //         doc.setFillColor(245, 129, 25);
    //         doc.roundedRect(x, y, textWidth + padding * 2, 15, 8, 8, "F");

    //         // Estrella
    //         doc.setFillColor(37, 52, 108);
    //         this.dibujarEstrella(doc, x, y - 2, 15);

    //         // Texto de fecha
    //         const textX = x + textWidth / 2 + padding;
    //         doc.setTextColor("white");
    //         doc.text(textDay, textX, y + 11, { align: "center" });

    //         // Nombre
    //         doc.setTextColor("black");
    //         doc.text(user.name, textX, y + 25, { align: "center" });

    //         // Puesto
    //         doc.setTextColor("blue");
    //         doc.setFontSize(12);
    //         doc.setFont("helvetica", "bold");
    //         doc.text(user.position.name, textX, y + 35, { align: "center" });

    //         // Restaurar fuente normal
    //         doc.setFont("helvetica", "normal");
    //         doc.setFontSize(14);
    //     };

    //     chunks.forEach((chunk, idx) => {
    //         if (idx > 0) doc.addPage();

    //         doc.setFontSize(30);
    //         doc.setFont('helvetica', 'bold');
    //         doc.text("CUMPLEAÑEROS", 223, 40, { align: 'center' });
    //         doc.setFont('courier', 'bolditalic');
    //         doc.setTextColor('red')
    //         doc.text("del mes", 223, 50, { align: 'center' });


    //         let spacing = 0;
    //         let countDrawColumns = 0;
    //         let startY = (chunks.length > 7) ? 80 : 140;

    //         chunk.forEach((user, index) => {
    //             doc.setFontSize(14);
    //             doc.setFont("helvetica", "normal");

    //             const textDay = dayjs(user.birthdate).format("DD [de] MMMM");
    //             const textWidth = doc.getTextWidth(textDay);

    //             let x: number;

    //             // Determinar posición (izquierda, centro, derecha)
    //             if (index === 0 || index % 3 === 0) {
    //                 x = 223 - textWidth / 2 - padding; // centro
    //             } else if (index % 2 === 0) {
    //                 x = 40; // izquierda
    //             } else {
    //                 x = 320; // derecha
    //             }
    //             console.log(user);

    //             // Dibujar tarjeta
    //             drawUserCard(x, startY + spacing, textDay, textWidth, user);

    //             // Ajustar espaciado vertical
    //             if (index === 0 || index % 3 === 0) {
    //                 spacing += 60;
    //             } else {
    //                 countDrawColumns++;
    //                 if (countDrawColumns === 2) {
    //                     countDrawColumns = 0;
    //                     spacing += 60;
    //                 }
    //             }
    //         });

    //         // chunk.forEach((user, index) => {
    //         //     doc.setFontSize(14);
    //         //     doc.setFont('helvetica', 'normal');
    //         //     const textDay = dayjs(user.birthdate).format('DD [de] MMMM');
    //         //     doc.setFillColor(245, 129, 25);
    //         //     const textWitdth = doc.getTextWidth(textDay);

    //         //     if (index === 0 || index % 3 === 0) { // *Center
    //         //         doc.roundedRect(223 - (textWitdth / 2) - padding, startY + spacing, textWitdth + padding * 2, 15, 8, 8, "F");
    //         //         doc.setFillColor(37, 52, 108);
    //         //         this.dibujarEstrella(doc, 223 - (textWitdth / 2) - padding, (startY - 2) + spacing, 15);
    //         //         doc.setTextColor('white');
    //         //         doc.text(textDay, 223, startY + 11 + spacing, { align: 'center' });
    //         //         doc.setTextColor('black')
    //         //         doc.text(user.name, 223, startY + 25 + spacing, { align: 'center' });
    //         //         doc.setTextColor('blue')
    //         //         doc.setFontSize(12);
    //         //         doc.setFont('helvetica', 'bold')
    //         //         doc.text(user.position.name, 223, startY + 35 + spacing, { align: 'center' });
    //         //         spacing += 60;
    //         //     } else {
    //         //         countDrawColumns += 1;
    //         //         if (index % 2 === 0) { // * Izquierda
    //         //             doc.roundedRect(40, startY + spacing, textWitdth + padding * 2, 15, 8, 8, "F");
    //         //             doc.setFillColor(37, 52, 108);
    //         //             this.dibujarEstrella(doc, 40, (startY - 2) + spacing, 15);
    //         //             doc.setTextColor('white');
    //         //             doc.text(textDay, 40 + (textWitdth / 2) + padding, startY + 11 + spacing, { align: 'center' });
    //         //             doc.setTextColor('black')
    //         //             doc.text(user.name, 40 + (textWitdth / 2) + padding, startY + 25 + spacing, { align: 'center' });
    //         //             doc.setTextColor('blue')
    //         //             doc.setFontSize(12);
    //         //             doc.setFont('helvetica', 'bold')
    //         //             doc.text(user.position.name, 40 + (textWitdth / 2) + padding, startY + 35 + spacing, { align: 'center' });
    //         //         } else {
    //         //             doc.roundedRect(320, startY + spacing, textWitdth + padding * 2, 15, 8, 8, "F");
    //         //             doc.setFillColor(37, 52, 108);
    //         //             this.dibujarEstrella(doc, 320, (startY - 2) + spacing, 15);
    //         //             doc.setTextColor('white');
    //         //             doc.text(textDay, 320 + (textWitdth / 2) + padding, startY + 11 + spacing, { align: 'center' });
    //         //             doc.setTextColor('black')
    //         //             doc.text(user.name, 320 + (textWitdth / 2) + padding, startY + 25 + spacing, { align: 'center' });
    //         //             doc.setTextColor('blue')
    //         //             doc.setFontSize(12);
    //         //             doc.setFont('helvetica', 'bold')
    //         //             doc.text(user.position.name, 320 + (textWitdth / 2) + padding, startY + 35 + spacing, { align: 'center' });
    //         //         }
    //         //         if (countDrawColumns == 2) {
    //         //             countDrawColumns = 0;
    //         //             spacing += 60;
    //         //         }
    //         //     }
    //         // })



    //         doc.addImage(pathLogo, 'PNG', 350, 5, 80, 80, null, 'FAST');
    //         doc.addImage(join(this.pathSources, 'globo_1.png'), 'PNG', 20, 30, 80, 80, null, 'FAST');
    //         doc.addImage(join(this.pathSources, 'regalo_7.png'), 'PNG', 80, 530, 100, 100, null, 'FAST');
    //         doc.addImage(join(this.pathSources, 'regalo_6.png'), 'PNG', 290, 530, 100, 100, null, 'FAST');
    //         doc.addImage(join(this.pathSources, 'pastel_1.png'), 'PNG', 163, 480, 150, 150, null, 'FAST');

    //     })
    //     return doc.output('arraybuffer');
    // }

    // 
    // public template_2(users: User[]) {
    //     const template: Template = {
    //         formatDay: 'Text',
    //         colorBackgroundDay: '#ffffff',
    //         colorTextDay: '#000000',
    //         positionDay: 'B',
    //         withImage: true,
    //         withPosition: true,
    //         borderImage: false,
    //     }

    //     // * Aleatorio para saber si la orientación va a ser 'l' o 'p'
    //     const mode = 'p'//Math.random() < 0.5 ? 'l' : 'p';
    //     const doc = new jsPDF({
    //         unit: 'px',
    //         compress: true,
    //         orientation: mode
    //     });
    //     const optionsDocument = {
    //         //@ts-ignore
    //         width: (mode == 'l') ? 530 : 350,
    //         //@ts-ignore
    //         height: (mode == 'l') ? 340 : 440,
    //         //@ts-ignore
    //         startX: (mode == 'l') ? 50 : 50,
    //         //@ts-ignore
    //         startY: (mode == 'l') ? 60 : 120
    //     };
    //     // Tamaño de hoja modo normal w: 445 h: 630 
    //     // Potrait render w: 350 h: 440
    //     // Landscape render w: 530 h: 340 
    //     const layout = this.calculateOptimalGrid(optionsDocument.width, optionsDocument.height, users.length, 20, 20);
    //     const chunks = this.getChunks(users, layout.cols);

    //     // TODO buscar el background dependiendo la horientación.
    //     // * background
    //     doc.addImage(join(this.pathSources, '5.png'), "PNG", 0, 0, 450, 630);
    //     // TODO Marcos
    //     // const withMarc = Math.random() < 0.5 ? 'y' : 'n';

    //     chunks.forEach((chunk, rowIndex) => {
    //         chunk.forEach((user, colIndex) => {
    //             const x = optionsDocument.startX + colIndex * (layout.elementWidth + layout.spaceX);
    //             const y = optionsDocument.startY + rowIndex * (layout.elementHeight + layout.spaceY);

    //             // Dibujar cuadrado
    //             // doc.rect(x, y, layout.elementWidth, layout.elementHeight, "S");

    //             // * Si lleva marco ocupara el tamaño del cuadro
    //             let positionY = y;

    //             const pathUser = join(this.pathUsers, user.user_id);
    //             const listDirectories = readdirSync(pathUser);
    //             const photo = listDirectories.find(directory => directory.includes('foto.'));
    //             const imageSize = layout.elementWidth * ((layout.elementWidth > layout.elementHeight) ? 0.4 : 0.5);
    //             const imageX = x + (layout.elementWidth - imageSize) / 2;
    //             const imageY = y;
    //             // TODO ver si se pone borde a la imagen
    //             // if (true) {
    //             //     doc.setDrawColor('#fc0203');
    //             //     doc.setLineWidth(5);
    //             //     doc.rect(imageX, imageY, imageSize, imageSize, "S");
    //             // }
    //             if (photo) doc.addImage(join(pathUser, photo), "PNG", imageX, imageY, imageSize, imageSize);
    //             positionY = imageY + imageSize; // + (layout.elementHeight * 0.12)

    //             const cuadroH = positionY + layout.elementHeight * 0.25;
    //             doc.setFillColor('#ba5523')
    //             doc.roundedRect(x, positionY, layout.elementWidth, cuadroH - positionY + 5, 10, 10, "F");
    //             positionY += layout.elementHeight * 0.12;

    //             // * Name
    //             const text1Y = positionY;
    //             const name = this.getNameFormat(user.name);
    //             const textBoxWidth = layout.elementWidth + 3;
    //             doc.setTextColor('#fff');
    //             doc.setFontSize(layout.elementHeight * 0.13);
    //             const wrappedText = doc.splitTextToSize(name, textBoxWidth);
    //             // * Cuadro
    //             const text2Y = positionY + (wrappedText.length * layout.elementHeight * 0.13);
    //             // doc.rect(x, positionY + 5, layout.elementWidth, text2Y - positionY, "F");
    //             positionY += layout.elementHeight * 0.12;
    //             // * Fecha
    //             doc.text(wrappedText, x + layout.elementWidth / 2, text1Y, {
    //                 align: "center",
    //             });

    //             // * Texto del día
    //             const textDay = dayjs(user.birthdate).format('DD [de] MMMM');
    //             this.drawTextCenter(doc, x, text2Y, textDay, layout.elementWidth);


    //             //=== 3️⃣ Texto secundario (debajo del principal) ===
    //             // doc.setFontSize(8);
    //             // doc.text( textDay, x + layout.elementWidth / 2, text2Y, {
    //             //     align: "center",
    //             // });

    //             // doc.setLineWidth(1.5);
    //             // doc.rect(30, 30, 60, 60);
    //             // doc.setFontSize(14);
    //             // doc.text(user.name, 60, 105, { align: 'center', maxWidth: 100, })
    //         })
    //     })
    //     doc.setLineWidth(1);

    //     // doc.rect(50, 80, 350, 470,'S');
    //     // doc.rect(optionsDocument.startX, optionsDocument.startY, optionsDocument.width, optionsDocument.height, "S"); // Lanscape

    //     return doc.output('arraybuffer');

    // }

    private getChunks(users: User[], elements: number) {
        const chunks = [];
        for (let i = 0; i < users.length; i += elements) {
            const chunk = users.slice(i, i + elements);
            chunks.push(chunk);
        }
        return chunks;
    }
    private getNameFormat(name: string) {
        const parts = name.split(' ');
        if (parts.length <= 3) return `${parts[0]} ${parts[1]}`;
        return `${parts[0]} ${parts[1].charAt(0)}. ${parts[2]}`;
    }

    private drawCircleDay(
        doc: jsPDF,
        x: number,
        y: number,
        width: number,
        day: string,
        background: string,
        color: string
    ) {
        doc.setFillColor(background);
        doc.circle(x, y, width, 'F');
        doc.setTextColor(color);
        doc.text(day, x, y + (width / 2.9), { align: 'center' })
    }

    // private drawTextDayStyle(
    //     doc: jsPDF,
    //     x: number,
    //     y: number,
    //     day: string,
    //     width: number,
    //     background: string,
    //     color: string
    // ) {
    //     // Fondo principal (naranja)
    //     doc.setFillColor(background);
    //     doc.roundedRect(x, y, width, 15, 8, 8, "F");

    //     // Estrella
    //     doc.setFillColor(37, 52, 108);
    //     this.dibujarEstrella(doc, x - 5, y - 2, 15);

    //     this.drawTextCenter(doc, x, y, day, width, color)
    // }

    private drawTextCenter(
        doc: jsPDF,
        x: number,
        y: number,
        text: string,
        width: number,
    ) {
        const textX = x + width / 2;
        doc.text(text, textX, y, { align: "center" });
    }

    private calculateOptimalGrid(
        totalWidth: number,
        totalHeight: number,
        itemCount: number,
        spaceX: number = 10,
        spaceY: number = 10
    ): GridResult {
        if (itemCount <= 0) throw new Error("Debe haber al menos un elemento.");

        let bestCols = 1;
        let bestRows = itemCount;
        let bestRatioDiff = Infinity;
        let bestElementWidth = 0;
        let bestElementHeight = 0;

        const containerRatio = totalWidth / totalHeight;

        // Probar posibles cantidades de columnas (1 hasta itemCount)
        for (let cols = 1; cols <= itemCount; cols++) {
            const rows = Math.ceil(itemCount / cols);

            const elementWidth = (totalWidth - (cols - 1) * spaceX) / cols;
            const elementHeight = (totalHeight - (rows - 1) * spaceY) / rows;

            if (elementWidth <= 0 || elementHeight <= 0) continue;

            const cellRatio = elementWidth / elementHeight;
            const ratioDiff = Math.abs(cellRatio - 1); // entre más cerca de 0 → más cuadrado

            if (ratioDiff < bestRatioDiff) {
                bestRatioDiff = ratioDiff;
                bestCols = cols;
                bestRows = rows;
                bestElementWidth = elementWidth;
                bestElementHeight = elementHeight;
            }
        }

        return {
            cols: bestCols,
            rows: bestRows,
            elementWidth: bestElementWidth,
            elementHeight: bestElementHeight,
            spaceX,
            spaceY,
        };
    }

    private dibujarEstrella(doc: jsPDF, xInicio: number, yInicio: number, size: number) {
        const escala = size / 67;

        // Definir offsets relativos desde el punto de inicio
        const puntos = {
            // Triángulo superior (base)
            t1: [
                { x: xInicio, y: yInicio }, // Esquina izquierda
                { x: xInicio + 34 * escala, y: yInicio + 24 * escala }, // Centro superior
                { x: xInicio + 67 * escala, y: yInicio } // Esquina derecha
            ],

            // Triángulo izquierdo-inferior
            t2: [
                { x: xInicio + 34 * escala, y: yInicio - 25 * escala }, // Punta superior
                { x: xInicio + 47 * escala, y: yInicio + 14 * escala }, // Esquina derecha-media
                { x: xInicio + 13 * escala, y: yInicio + 38 * escala } // Esquina izquierda-inferior
            ],

            // Triángulo derecho-inferior
            t3: [
                { x: xInicio + 34 * escala, y: yInicio - 25 * escala }, // Punta superior
                { x: xInicio + 54 * escala, y: yInicio + 38 * escala }, // Esquina derecha-inferior
                { x: xInicio + 20 * escala, y: yInicio + 14 * escala } // Esquina izquierda-media
            ]
        };

        // Dibujar los triángulos
        doc.triangle(puntos.t1[0].x, puntos.t1[0].y, puntos.t1[1].x, puntos.t1[1].y, puntos.t1[2].x, puntos.t1[2].y, 'F');
        doc.triangle(puntos.t2[0].x, puntos.t2[0].y, puntos.t2[1].x, puntos.t2[1].y, puntos.t2[2].x, puntos.t2[2].y, 'F');
        doc.triangle(puntos.t3[0].x, puntos.t3[0].y, puntos.t3[1].x, puntos.t3[1].y, puntos.t3[2].x, puntos.t3[2].y, 'F');
    }
}