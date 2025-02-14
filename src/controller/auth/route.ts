import { Context, Hono } from "hono"
import { handleLogin, handleGoogleCallback, handleVerifyToken } from "./service"
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { createApiResponse } from "../../api-docs/openAPIResponseBuilders"
import { AuthDoc } from "../../model/authModel"

const auth = new Hono()
export const authRegistry = new OpenAPIRegistry()

auth.post("/login", async (c: Context<{}, any, {}>) => {
    return await handleLogin(c)
})

authRegistry.registerPath({
    method: "post",
    description: "Login with a provider",
    path: "/auth/login",
    tags: ["Auth"],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        provider: { type: "string", example: "google" },
                        redirectAfterLogin: { type: "string", example: "https://s.jsclub.dev/notion" },
                    },
                    required: ["provider", "redirectAfterLogin"],
                },
            },
        },
    },
    responses: createApiResponse(AuthDoc, "Success"),
});

auth.get("/callback", async (c: Context<{}, any, {}>) => {
    return await handleGoogleCallback(c)
})

authRegistry.registerPath({
    method: "get",
    description: "Callback from Google",
    path: "/auth/callback",
    tags: ["Auth"],
    responses: createApiResponse(AuthDoc, "Success"),
});

auth.get("/verify/:token", async (c: Context<{}, "/:token", {}>) => {
    return await handleVerifyToken(c)
})

authRegistry.registerPath({
    method: "get",
    description: "Verify token",
    path: "/auth/verify/{token}",
    tags: ["Auth"],
    parameters: [
        {
            name: "token",
            in: "path",
            required: true,
            schema: {
                type: "string",
                example: ""
            },
            description: "JWT token to verify",
        }
    ],
    responses: createApiResponse(AuthDoc, "Success"),
});

auth.get("/auth/logout", async (c: Context<{}, any, {}>) => {
    return c.json({ message: "Logged out" }, 200)
})

authRegistry.registerPath({
    method: "get",
    description: "Logout",
    path: "/auth/logout",
    tags: ["Auth"],
    responses: createApiResponse(AuthDoc, "Success"),
});



export default auth


