export class ExceptionResponse extends Response {
    constructor(code: number, message: string, res: string) {
        super(
            JSON.stringify({
                code,
                message,
                res,
            }),
            {
                status: code,
                headers: {
                    "content-type": "application/json",
                },
            }
        )
    }
}
