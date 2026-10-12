import { appDataSource } from "../db/dataBase";
import { User } from "../db/entities/user.entity";
import { AuthDTO } from "../Dto/auth/auth.dto";
import bcrypt from 'bcrypt';
import { join } from 'path';
import jwt from 'jsonwebtoken'
import { readFileSync } from "fs";
import { CustomError } from "../utils/error";
import { Employee } from "../db/entities/employee.entity";



export class AuthService {
    constructor(
        private readonly refreshSign = readFileSync(join(__dirname, '../', '../', 'certs', 'refresh', 'private.pem')),
        private readonly refreshVerify = readFileSync(join(__dirname, '../', '../', 'certs', 'refresh', 'public.pem')),
        private readonly userRepository = appDataSource.getRepository(User),
        private readonly repo = appDataSource.getRepository(Employee),
    ) { }

    public async auth(loginDTO: AuthDTO) {
        const { password, user_id } = loginDTO;
        const user = await this.userRepository.findOne({
            where: { user_id: user_id },
            relations: { rol: true },
            select: {
                user_id: true,
                name: true,
                password: true,
                rol: { name: true },
                update_at: true,
                deleted_at: true,
            }
        });

        if (user && bcrypt.compareSync(password, user.password)) {
            delete user.password;
            // const userInfo = user;
            const refreshToken = jwt.sign({ id: user.user_id }, this.refreshSign, { algorithm: 'RS256', expiresIn: '7d' });
            return { user, token: this.generateToken(user.user_id), refreshToken }
        }
        throw new CustomError("Credenciales no validas", 400);
    }

    public check(user: User) {
        return { user }
        // return this.generateToken(user.user_id);
    }

    public refresh(token: string) {
        try {
            const payload = jwt.verify(token, this.refreshVerify) as { id: string };
            const accessToken = this.generateToken(payload.id);
            return accessToken;
        } catch (error) {
            throw new CustomError('Invalid refresh token', 400);
        }

    }

    private generateToken(id: string) {
        const path = join(__dirname, '../', '/certs', 'private.pem')
        return jwt.sign({ id }, readFileSync(path), { algorithm: 'RS256', expiresIn: 60 });
    }

}