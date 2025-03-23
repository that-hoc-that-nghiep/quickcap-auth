import { Context } from "hono"
import { getTokenFromHeader, getUserFromHeader } from "../../utils"
import { ContextWithDB, getDB } from "../../db/connectdb"
import { AddUserToOrgRequest, CreateOrgRequest, RemoveUserFromOrgRequest, UpdateOrgRequest, UpdatePermissionInOrgRequest } from "./dto"
import { BadRequestException, ForbiddenException } from "../../exception/exception"
import { addUsersToOrg, createOrg, deleteOrg, getOrg, removeUsersFromOrg, updateOrg, updatePermisstion } from "../../repository/orgs"
import { env } from "hono/adapter"
import { Env } from "../../types"
import { supabase } from "../../utils/supabase"
import { createOrgSupabase } from "../../repository/orgsSupabase"

export const handleGetOrg = async (c: Context<{}, "/:orgId", {}>) => {
    const user = await getUserFromHeader(c)
    const { orgId } = c.req.param()

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

    const token = getTokenFromHeader(c)

    if (!token) {
        throw new BadRequestException("Invalid token")
    }

    if (!name || name.trim() === "") {
        throw new BadRequestException("Invalid name")
    }

    const { QUICKCAP_BE_URL, SUPABASE_URL, SUPABASE_KEY } = env<typeof Env>(c)

    const sp = supabase(SUPABASE_URL, SUPABASE_KEY)

    const db = getDB((c.env as ContextWithDB).DB)

    const newOrg = await createOrg(name, user.id, db, QUICKCAP_BE_URL, token)

    await createOrgSupabase(name, user.id, sp)

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
    const user = await getUserFromHeader(c);
    const { orgId } = c.req.param();
    const { email } = await c.req.json<RemoveUserFromOrgRequest>();

    const isOwner = user.organizations.some(
        (org: any) => org.id == orgId && org.is_owner
    );

    if (!isOwner) {
        throw new ForbiddenException(
            "You are not an owner of this organization"
        );
    }

    if (user.email === email) {
        throw new BadRequestException(
            "You can not remove yourself, transfer ownership first"
        );
    }

    const db = getDB((c.env as ContextWithDB).DB);

    const org = await removeUsersFromOrg(orgId, [email], db);

    return c.json(org);
};

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

export const handleUpdatePermission = async (c: Context<{}, any, {}>) => {
    const user = await getUserFromHeader(c)

    const { orgId } = c.req.param()

    const { email, permission } = await c.req.json<UpdatePermissionInOrgRequest>()

    const isOwner = user.organizations.some(
        (org: any) => org.id == orgId && org.is_owner
    )

    if (!isOwner) {
        throw new ForbiddenException(
            "You are not an owner of this organization"
        )
    }

    const db = getDB((c.env as ContextWithDB).DB)

    const org = await updatePermisstion(orgId, email, permission, db)

    return c.json(org)
}

export const handleLeaveOrg = async (c: Context<{}, any, {}>) => {
    const user = await getUserFromHeader(c)

    const { orgId } = c.req.param()

    const isOwner = user.organizations.some(
        (org: any) => org.id === orgId && org.is_owner
    )

    if (isOwner) {
        throw new BadRequestException(
            "You can not leave organization, transfer ownership first"
        )
    }

    const isBelongsToOrg = user.organizations.some((org: any) => org.id === orgId)

    if (!isBelongsToOrg) {
        throw new ForbiddenException(
            "You are not a member of this organization"
        )
    }

    const db = getDB((c.env as ContextWithDB).DB)

    await removeUsersFromOrg(orgId, [user.email], db)

    return c.json({ message: "You have left the organization" })
}

