import { Context } from "hono"
import { getUserFromHeader } from "../../utils"
import { ContextWithDB, getDB } from "../../db/connectdb"
import { organizations } from "../../db/schema"
import { AddUserToOrgRequest, CreateOrgRequest, RemoveUserFromOrgRequest, UpdateOrgRequest } from "./dto"
import { BadRequestException, ForbiddenException } from "../../exception/exception"
import { addUsersToOrg, createOrg, deleteOrg, getOrg, removeUsersFromOrg, updateOrg } from "../../repository/orgs"

export const handleGetOrg = async (c: Context<{}, "/:orgId", {}>) => {
    const user = await getUserFromHeader(c)
    const { orgId } = c.req.param()
    console.log(user.organizations)
    const isBelongsToOrg = user.organizations.some((org: any) => org.id == orgId)

    if (!isBelongsToOrg) {
        throw new ForbiddenException(
            "You are not a member of this organization"
        )
    }

    const db = getDB((c.env as ContextWithDB).DB)
    const org = await getOrg(orgId, db)

    return c.json(org)
}

export const handleCreateOrg = async (c: Context<{}, any, {}>) => {
    const user = await getUserFromHeader(c)
    const { name } = await c.req.json<CreateOrgRequest>()

    if (!name || name.trim() === "") {
        throw new BadRequestException("Invalid name")
    }

    const db = getDB((c.env as ContextWithDB).DB)
    const newOrg = await createOrg(name, user.id, db)

    return c.json(newOrg)
}

export const handleUpdateOrg = async (c: Context<{}, "/:orgId", {}>) => {
    const user = await getUserFromHeader(c)
    const { orgId } = c.req.param()
    const { name } = await c.req.json<UpdateOrgRequest>()

    if (!name || name.trim() === "") {
        throw new BadRequestException("Invalid name")
    }

    const isOwner = user.organizations.some(
        (org: any) => org.id == orgId && org.is_owner
    )

    if (!isOwner) {
        throw new ForbiddenException(
            "You are not an owner of this organization"
        )
    }

    const db = getDB((c.env as ContextWithDB).DB)
    const org = await updateOrg(orgId, name, db)

    return c.json(org)
}

export const handleAddUserToOrg = async (c: Context<{}, any, {}>) => {
    const user = await getUserFromHeader(c)

    const { orgId } = c.req.param()

    const { usersEmail } = await c.req.json<AddUserToOrgRequest>()

    if (!Array.isArray(usersEmail) || usersEmail.length === 0) {
        throw new BadRequestException("Invalid email")
    }

    const isOwner = user.organizations.some(
        (org: any) => org.id == orgId && org.is_owner
    )

    if (!isOwner) {
        throw new ForbiddenException(
            "You are not an owner of this organization"
        )
    }

    const db = getDB((c.env as ContextWithDB).DB)
    const org = await addUsersToOrg(orgId, usersEmail, db)

    return c.json(org)
}

export const handleRemoveUserFromOrg = async (c: Context<{}, any, {}>) => {
    const user = await getUserFromHeader(c)

    const { orgId } = c.req.param()

    const { usersEmail } = await c.req.json<RemoveUserFromOrgRequest>()

    if (!Array.isArray(usersEmail) || usersEmail.length === 0) {
        throw new BadRequestException("Invalid email")
    }

    const isOwner = user.organizations.some(
        (org: any) => org.id == orgId && org.is_owner
    )

    if (!isOwner) {
        throw new ForbiddenException(
            "You are not an owner of this organization"
        )
    }

    if (usersEmail.includes(user.email)) {
        throw new BadRequestException(
            "You can not remove yourself, transfer ownership first"
        )
    }

    const db = getDB((c.env as ContextWithDB).DB)

    const org = await removeUsersFromOrg(orgId, usersEmail, db)

    return c.json(org)
}

export const handleDeteleOrg = async (c: Context<{}, "/:orgId", {}>) => {
    const user = await getUserFromHeader(c)
    const { orgId } = c.req.param()

    const isOwner = user.organizations.some(
        (org: any) => org.id == orgId && org.is_owner
    )

    if (!isOwner) {
        throw new ForbiddenException(
            "You are not an owner of this organization"
        )
    }

    const db = getDB((c.env as ContextWithDB).DB)
    await deleteOrg(orgId, db)

    return c.json({ message: "Organization deleted" })
}


