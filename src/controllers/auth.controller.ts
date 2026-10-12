import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";


export class AuthController {
    constructor(
        private readonly authService = new AuthService()
    ) { }

    public login = async (req: Request, res: Response, next: NextFunction) => {
        const dto = req.body;
        try {
            const { refreshToken, token, user } = await this.authService.auth(dto);
            
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false, //enviroment.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
            })
            res.json({ user, token });
        } catch (error) {
            next(error);
        }
    }

    public check = (req: Request, res: Response, next: NextFunction) => {
        try {
            // const token = this.authService.check(req.user);
            res.json({
                user: req.user,
            });
        } catch (error) {
            next(error);
        }

    }

    public refresh = (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            const token = this.authService.refresh(refreshToken);
            res.json({
                token,
            });
        } catch (error) {
            next(error);
        }
    }

}


