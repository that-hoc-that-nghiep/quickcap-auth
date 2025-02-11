import { HTTPException } from "hono/http-exception";
import { ExceptionResponse } from "./exceptionResponse";

export class BadRequestException extends HTTPException {
    constructor(message: string) {
        super(401, {
            message,
            res: new ExceptionResponse(401, message, "Bad Request"),
        });
    }
}

export class ForbiddenException extends HTTPException {
    constructor(message: string) {
        super(403, {
            message,
            res: new ExceptionResponse(403, message, "Forbidden"),
        });
    }
}

export class NotFoundException extends HTTPException {
    constructor(message: string) {
        super(404, {
            message,
            res: new ExceptionResponse(404, message, "Not Found"),
        });
    }
}
