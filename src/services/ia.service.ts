import axios from 'axios';
import { createWriteStream, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { enviroment } from '../config/enviroment';
import { appDataSource } from '../db/dataBase';
import { ImageIA } from '../db/entities/Image_ia.entity';
import { CustomError } from '../utils/error';
import mime from 'mime-types'
import { PaginationDto } from '../Dto/pagination.dto';
import { Like } from 'typeorm';
import dayjs from '../utils/dayjs'

const DOWNLOAD_FILES = join(__dirname, "..", "..", "uploads");

// TODO No se utiliza
export class IAService {

    constructor(
        private readonly imageRepository = appDataSource.getRepository(ImageIA),
        private readonly nanoBananaKey = enviroment.NANOBANANA_API_KEY
    ) { }

    public async getImages(pagination: PaginationDto): Promise<[ImageIA[], number]> {
        const { take, skip, search } = pagination;

        const [data, total] = await this.imageRepository.findAndCount({
            where: search ? { description: Like(`%${search}%`) } : undefined,
            take, skip
        });
        return [data, total];
    }

    public async downloadImageNanoBanana(url: string, taskID: string) {
        const path = join(DOWNLOAD_FILES, `${taskID}.jpg`);
        const response = await axios.get(url, {
            responseType: "stream",
        });
        await new Promise<void>((resolve, reject) => {
            const writer = createWriteStream(path);

            response.data.pipe(writer);

            writer.on("finish", resolve);
            writer.on("error", reject);
            response.data.on("error", reject);
        });

        await this.imageRepository.update(
            { image_id: taskID },
            { status: 2 }
        );

        return true;

    }

    public async getImage(taskID: string) {
        const pathFile = join(DOWNLOAD_FILES, `${taskID}.jpg`);
        const image = await this.imageRepository.findOneBy({ image_id: taskID });
        if (!image) throw new CustomError("La imagen no existe", 404);
        if (image.status == 1) throw new CustomError("La imagen aun se esta procesando", 400);
        if (image.status == 3) throw new CustomError("La imagen no pudo ser creada, reviso los logs", 400);
        if (!existsSync(pathFile)) throw new CustomError("Archivo no encontrado", 404);
        const mimeType = mime.lookup(`${taskID}.jpg`) || 'application/octet-stream';
        const buffer = readFileSync(pathFile);
        return [buffer, mimeType];
    }

    public async createImageNanoBanana(month: number) {
        const date = dayjs().set('month', month);
        const stringMonth = date.format('MMMM')
        const { data } = await axios.post<{ code: number, msg: string, data: { taskId: string } }>('https://api.nanobananaapi.ai/api/v1/nanobanana/generate', {
            prompt: '',
            numImages: 1,
            type: 'TEXTTOIAMGE',
            image_size: '5:4',
            callBackUrl: 'https://test-serv.pem-sa.com.mx/ia/nanobanana-image-callback'
        }, {
            headers: { Authorization: `Bearer ${this.nanoBananaKey}` }
        });
        this.imageRepository.save({
            image_id: data.data.taskId,
            description: `Imagen creada para el mes de ...`,
            status: 1
        })

    }

}