import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const AuthDoc = z.object({
    // "url": z.string(),
    // "code": z.string(),
});