import { sign, verify } from "hono/jwt";
import { tokenExpries } from "../config/constant";
import { BadRequestException } from "../exception/exception";
import { Env, Payload } from "../types";
import { Context } from "hono";
import { User } from "../controller/auth/dto";
import { env } from "hono/adapter";
import { ContextWithDB, getDB } from "../db/connectdb";
import { getUser } from "../repository/users";

type Secrets = {
    JWT_SECRET: string;
    DB: any;
};

export const generateToken = async (user: User, secret: string) => {
    const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        exp: tokenExpries(),
    };
    return await sign(payload, secret);
};

export const getUserFromToken = async (
    token: string,
    secrets: Secrets
) => {
    try {
        const { email } = await verify(token, secrets.JWT_SECRET) as unknown as Payload;

        const user = getUser(email, secrets.DB);

        if (!user) {
            throw new BadRequestException("User not found");
        }

        return user;
    } catch (e) {
        throw new BadRequestException("Invalid token");
    }
};

export const getTokenFromHeader = (c: Context<{}, any, {}>) => {
    return c.req.header("Authorization")?.split(" ")[1]
}

export const getUserFromHeader = (c: Context<{}, any, {}>) => {
    const token = getTokenFromHeader(c)
    if (!token) {
        throw new BadRequestException("Invalid token")
    }
    const { JWT_SECRET } = env<typeof Env>(c)

    const db = getDB((c.env as ContextWithDB).DB)

    return getUserFromToken(token, { JWT_SECRET, DB: db })
}