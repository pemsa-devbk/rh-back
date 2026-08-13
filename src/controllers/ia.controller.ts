import { Request, Response } from "express";
import { IAService } from "../services/ia.service";

// TODO No se utiliza
export class IAController {
    constructor(
        private readonly iaService = new IAService(),
    ) { }

    public callbackNanobanana = async (req: Request, res: Response) => {
        const { code, msg, data } = req.body;
        if (code === 200) {
            const { taskId, info } = data;
            const { resultImageUrl } = info;
            if (resultImageUrl) {
                this.iaService.downloadImageNanoBanana(resultImageUrl, taskId)
            }
        } else {
            // Task failed
            console.log('NanoBanana image generation failed:', msg);
            // Handle specific error types
            if (code === 400) {
                console.log('Content policy violation - please adjust your prompt');
            } else if (code === 500) {
                console.log('Internal error - please try again later');
            } else if (code === 501) {
                console.log('Generation task failed - may need to adjust parameters');
            }
        }

        res.status(200).json({ status: 'received' });
    }
}