import { Context } from "hono"
import { User, LoginRequest, Provider, providersMap } from "./dto"
import { google } from "worker-auth-providers"
import { env } from "hono/adapter"
import { Env } from "../../types"
import { generateToken, getUserFromHeader, getUserFromToken } from "../../utils"
import { ContextWithDB, getDB } from "../../db/connectdb"
import { BadRequestException } from "../../exception/exception"
import { createUser, getUser, getUserById, updateSubscription } from "../../repository/users"
import { createPersonalOrg } from "../../repository/orgs"
import { setCookie, setSignedCookie } from "hono/cookie"
import { tokenExpries } from "../../config/constant"

export const handleLogin = async (c: Context<{}, any, {}>) => {

    const { provider, redirectAfterLogin } = await c.req.json<LoginRequest>();

    if (!provider || !redirectAfterLogin) {
        throw new BadRequestException("Invalid request")
    }

    let redirectUrl = ""

    const { GOOGLE_CLIENT_ID, SERVICE_URL } = env<typeof Env>(c)

    switch (providersMap[provider]) {
        case Provider.GOOGLE:
            redirectUrl = await google.redirect({
                options: {
                    clientId: GOOGLE_CLIENT_ID,
                    redirectTo: `${SERVICE_URL}/auth/callback`,
                    state: redirectAfterLogin,
                },
            })
            break
        default:
            throw new BadRequestException("Invalid provider")
    }
    return c.json(
        {
            url: redirectUrl,
            code: 302,
        },
        200
    )
}

export const handleGoogleCallback = async (c: Context<{}, any, {}>) => {
    try {
        const request = c.req.raw
        const { code, state: redirect } = c.req.query()

        if (!code) {
            throw new BadRequestException("Authorization code is missing");
        }

        const {
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            SERVICE_URL,
            JWT_SECRET,
        } = env<typeof Env>(c)

        const { user } = await google.users({
            options: {
                clientSecret: GOOGLE_CLIENT_SECRET,
                clientId: GOOGLE_CLIENT_ID,
                redirectUrl: `${SERVICE_URL}/auth/callback`,
            },
            request,
        })
        const db = getDB((c.env as ContextWithDB).DB)

        let userData: User | null = null

        const data = await getUser(user.email, db)

        if (!data) {
            const newUser = await createUser(user, db)

            await createPersonalOrg(user.name, newUser.id, db)

            userData = newUser as User
        } else {
            userData = data as User
        }
        const accessToken = await generateToken(userData, JWT_SECRET)

        setCookie(c as any, "accesstoken", accessToken, {
            path: "/",
            expires: new Date(tokenExpries()),
            domain: "localhost",
            secure: false,
            httpOnly: true,
            sameSite: "none",
        })

        // Set cookie for application
        setCookie(c as any, "accesstoken", accessToken, {
            path: "/",
            expires: new Date(tokenExpries()),
            domain: ".quickcap.live",
            secure: true,
            httpOnly: true,
        })

        return c.redirect(`${redirect}?token=${accessToken}`)

    } catch (error) {
        throw new BadRequestException("Invalid request")
    }
}

export const handleVerifyToken = async (c: Context<{}, any, {}>) => {
    const { token } = c.req.param()

    if (!token) {
        throw new BadRequestException("Invalid request")
    }

    const { JWT_SECRET } = env<typeof Env>(c)

    const db = getDB((c.env as ContextWithDB).DB)

    const user = await getUserFromToken(token, { JWT_SECRET, DB: db })

    return c.json(user)
}

export const handleLogout = async (c: Context<{}, any, {}>) => {
    setCookie(c as any, "accesstoken", "", {
        path: "/",
        expires: new Date(0),
        domain: "localhost",
        secure: false,
        httpOnly: true,
    })

    setCookie(c as any, "accesstoken", "", {
        path: "/",
        expires: new Date(0),
        domain: ".quickcap.live",
        secure: true,
        httpOnly: true,
    })

    return c.json({ message: "Loggout success" }, 200)
}

export const handleGetUser = async (c: Context<{}, any, {}>) => {
    const { id } = c.req.param()

    console.log(id)

    if (!id) {
        throw new BadRequestException("Invalid request")
    }

    const db = getDB((c.env as ContextWithDB).DB)

    const user = await getUserById(id, db)

    return c.json(user)
}

export const handleUpdateSubscription = async (c: Context<{}, any, {}>) => {
    const user = await getUserFromHeader(c)

    const { subscription } = await c.req.json<{ subscription: string }>()

    if (!subscription) {
        throw new BadRequestException("Invalid subscription")
    }

    const db = getDB((c.env as ContextWithDB).DB)

    const updatedUser = await updateSubscription(user.id, subscription, db)

    return c.json(updatedUser)
}



