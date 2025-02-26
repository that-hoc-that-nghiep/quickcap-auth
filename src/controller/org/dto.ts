export interface GetOrgRequestParams {
    orgId: string
}

export interface CreateOrgRequest {
    name: string
    // logo: string
}

export interface UpdateOrgRequest {
    name: string
    // logo: string
}

export interface AddUserToOrgRequest {
    usersEmail: string[]
}

export interface RemoveUserFromOrgRequest {
    usersEmail: string[]
}

export interface TransferOwnershipRequest {
    newOwnerEmail: string
}

export interface UpdatePermissionInOrgRequest {
    email: string
    permission: string
}