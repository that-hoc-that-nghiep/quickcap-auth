import { and, eq, inArray, notInArray } from "drizzle-orm";
import { organizations, userOrganization, users } from "../db/schema";
import { NotFoundException } from "../exception/exception";
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail } from "./users";
import axios from "axios";
import { env } from "hono/adapter";
import { Env } from "../types";

export const getOrg = async (orgId: string, db: any) => {
    const orgData = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .limit(1)
        .run();

    if (!orgData || orgData.results.length === 0) {
        throw new NotFoundException("Organization not found");
    }

    const usersInOrg = await db
        .select({
            user: users,
            is_owner: userOrganization.is_owner,
            is_permission: userOrganization.is_permission
        })
        .from(userOrganization)
        .innerJoin(users, eq(userOrganization.user_id, users.id))
        .where(eq(userOrganization.org_id, orgId))
        .run();

    const usersMapped = usersInOrg.results.map((userData: any) => ({
        ...userData,
        is_owner: Boolean(userData.is_owner),
    }));

    return {
        organization: orgData.results[0],
        users: usersMapped,
    };
};

export const createOrg = async (name: string, userId: number, db: any, quickcapBeUrl: string, token: string) => {
    const orgData = await db
        .insert(organizations)
        .values({
            id: uuidv4(),
            name,
            image: "",
            type: "Organization"
        })
        .returning();

    const orgId = orgData[0].id;

    const res = await axios.post(`${quickcapBeUrl}/category/${orgId}`,
        { name: "Default", },
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        }
    );
    console.log(res.data);

    await db
        .insert(userOrganization)
        .values({
            id: uuidv4(),
            org_id: orgId,
            user_id: userId,
            is_owner: true,
            is_permission: "ALL"
        });

    return await getOrg(orgId, db);
};

export const createPersonalOrg = async (name: string, userId: number, db: any) => {
    const orgData = await db
        .insert(organizations)
        .values({
            id: uuidv4(),
            name: `${name}'s Personal`,
            image: "",
            type: "Personal"
        })
        .returning();

    const orgId = orgData[0].id;
    await db
        .insert(userOrganization)
        .values({
            id: uuidv4(),
            org_id: orgId,
            user_id: userId,
            is_owner: true,
            is_permission: "ALL"
        });

    return await getOrg(orgId, db);
};

export const updateOrg = async (orgId: string, updateName: string, db: any) => {
    const orgData = await db
        .update(organizations)
        .set({ name: updateName })
        .where(eq(organizations.id, orgId))
        .returning();

    return orgData[0];
};

export const addUsersToOrg = async (orgId: string, usersEmail: string[], db: any) => {

    // Get userIds from usersEmail
    const userIds = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.email, usersEmail))
        .run();

    if (!userIds || userIds.results.length === 0) {
        throw new NotFoundException('No users found');
    }

    // Get users that are already in the organization
    const existingUserIds = await db
        .select({ user_id: userOrganization.user_id })
        .from(userOrganization)
        .where(eq(userOrganization.org_id, orgId))
        .run();

    // Filter out users that are already in the organization
    const newUserIds = userIds.results.filter((user: any) => {
        return !existingUserIds.results.some((existingUser: any) => existingUser.user_id === user.id);
    });

    if (newUserIds.length !== 0) {
        await db
            .insert(userOrganization)
            .values(newUserIds.map((user: any) => ({
                id: uuidv4(),
                org_id: orgId,
                user_id: user.id,
                is_owner: false,
                is_permission: "READ"
            })))
            .returning();
    }
    return await getOrg(orgId, db);
};

export const removeUsersFromOrg = async (orgId: string, usersEmail: string[], db: any) => {
    const userIds = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.email, usersEmail))
        .run();

    if (!userIds || userIds.results.length === 0) {
        throw new NotFoundException('No users found');
    }

    await db
        .delete(userOrganization)
        .where(eq(userOrganization.org_id, orgId))
        .where(inArray(userOrganization.user_id, userIds.results.map((user: any) => user.id)))
        .returning();

    return await getOrg(orgId, db);
};

export const deleteOrg = async (orgId: string, db: any) => {
    const orgData = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .limit(1)
        .run();

    if (!orgData || orgData.results.length === 0) {
        throw new NotFoundException("Organization not found");
    }

    if (orgData.results[0].type === "Personal") {
        throw new NotFoundException("Cannot delete personal organization");
    }

    await db
        .update(organizations)
        .set({ isDeleted: 1 })
        .where(eq(organizations.id, orgId))
        .run();

    return true;
};

export const updatePermisstion = async (orgId: string, email: string, permission: string, db: any) => {

    let user = null
    const userId = await getUserByEmail(email, db)

    //Check userId is have in org or not
    const userOrg = await db
        .select()
        .from(userOrganization)
        .where(and(eq(userOrganization.org_id, orgId), eq(userOrganization.user_id, userId.id)))
        .limit(1)
        .run();

    if (!userOrg.results || userOrg.results.length === 0) {
        throw new NotFoundException("User does not belong to the organization");
    }


    if (permission === "READ" || permission === "UPLOAD") {
        user = await db
            .update(userOrganization)
            .set({
                is_permission: permission,
                is_owner: false
            })
            .where(and(eq(userOrganization.org_id, orgId), eq(userOrganization.user_id, userId.id)))
            .returning()
            .run();
    }

    if (permission === "ALL") {
        user = await db
            .update(userOrganization)
            .set({
                is_permission: permission,
                is_owner: true
            })
            .where(and(eq(userOrganization.org_id, orgId), eq(userOrganization.user_id, userId.id)))
            .returning()
            .run();
    }

    return user.results[0];
}