export const Env: Record<string, string> = {
    SERVICE_URL: "SERVICE_URL",
    GOOGLE_CLIENT_ID: "GOOGLE_CLIENT_ID",
    GOOGLE_CLIENT_SECRET: "GOOGLE_CLIENT_SECRET",
    JWT_SECRET: "JWT_SECRET",
    QUICKCAP_BE_URL: "QUICKCAP_BE_URL",

}

export interface Payload {
    sub: string
    email: string
    name?: string
    exp: number
}
