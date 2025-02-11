import { eq, inArray, notInArray } from "drizzle-orm";
import { organizations, userOrganization, users } from "../db/schema";
import { NotFoundException } from "../exception/exception";

export const getOrg = async (orgId: number, db: any) => {
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
        is_owner: userData.is_owner,
        is_permission: userData.is_permission
    }));

    return {
        organization: orgData.results[0],
        users: usersMapped,
    };
};

export const createOrg = async (name: string, userId: number, db: any) => {
    const orgData = await db
        .insert(organizations)
        .values({
            name,
            image: "",
            type: "Organization"
        })
        .returning();

    const orgId = orgData[0].id;

    await db
        .insert(userOrganization)
        .values({
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
            name: `${name}'s Personal`,
            image: "",
            type: "Personal"
        })
        .returning();

    const orgId = orgData[0].id;

    await db
        .insert(userOrganization)
        .values({
            org_id: orgId,
            user_id: userId,
            is_owner: true,
            is_permission: "ALL"
        });

    return await getOrg(orgId, db);
};



export const updateOrg = async (orgId: number, updateName: string, db: any) => {
    const orgData = await db
        .update(organizations)
        .set({ name: updateName })
        .where(eq(organizations.id, orgId))
        .returning();

    return orgData[0];
};

export const addUsersToOrg = async (orgId: number, usersEmail: string[], db: any) => {
    const userIds = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.email, usersEmail))
        .run();

    if (!userIds || userIds.results.length === 0) {
        throw new NotFoundException('No users found');
    }

    const newUsers = await db
        .select()
        .from(users)
        .where(inArray(users.id, userIds.results.map((user: any) => user.id)))
        .where(notInArray(users.id,
            db.select({ user_id: userOrganization.user_id })
                .from(userOrganization)
                .where(eq(userOrganization.org_id, orgId))
        ))
        .run();

    if (newUsers.results.length !== 0) {
        await db
            .insert(userOrganization)
            .values(newUsers.results.map((user: any) => ({
                org_id: orgId,
                user_id: user.id,
                is_owner: false,
                is_permission: "READ"
            })))
            .returning();
    }
    return await getOrg(orgId, db);
};

export const removeUsersFromOrg = async (orgId: number, usersEmail: string[], db: any) => {
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

export const deleteOrg = async (orgId: number, db: any) => {
    await db
        .delete(organizations)
        .where(eq(organizations.id, orgId))
        .run();

    return true;
}