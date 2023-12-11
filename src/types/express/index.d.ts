import 'express-serve-static-core'
import { User } from "../../db/entities/user.entity";


declare module 'express-serve-static-core' {
    interface Request {
        user?: User
    }
}