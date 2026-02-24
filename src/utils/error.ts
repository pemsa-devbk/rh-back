export class CustomError extends Error{
    private code: number
    constructor(message: string, code: number){
        super(message);
        this.code = code;
    }

    get Message(){
        return this.message;
    }

    get Code(){
        return this.code;
    }
}