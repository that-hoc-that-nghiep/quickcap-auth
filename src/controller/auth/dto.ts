
export interface LoginRequest {
    provider: string
    redirectAfterLogin: string
}

export interface User {
    id: string
    email: string
    verified_email: boolean
    name: string
    given_name: string
    family_name: string
    picture: string
    locale: string
    subscription: string
}

export enum Provider {
    GOOGLE = "google",
}

export const providersMap: Record<string, Provider> = {
    google: Provider.GOOGLE,
}


