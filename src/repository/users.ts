import { User } from "../controller/auth/dto"
import { organizations, userOrganization, users } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { BadRequestException, NotFoundException } from "../exception/exception";

export const getUser = async (email: string, db: any) => {
    const user = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
        .run();

    if (!user.results[0]) {
        return false;
    }

    const userData = user.results[0];

    const organizationsData = await db
        .select({
            organization: organizations,
            is_owner: userOrganization.is_owner,
            is_permission: userOrganization.is_permission
        })
        .from(userOrganization)
        .innerJoin(organizations, eq(userOrganization.org_id, organizations.id))
        .where(eq(userOrganization.user_id, userData.id))
        .run();

    const organizationsMapped = organizationsData.results.map((orgData: any) => ({
        ...orgData,
        is_owner: Boolean(orgData.is_owner),
        is_permission: orgData.is_permission
    }));

    return {
        ...userData,
        organizations: organizationsMapped,
    };

};

export const createUser = async (user: User, db: any) => {
    const { email, family_name, given_name, name, picture, verified_email } = user;
    const id = uuidv4();

    const newUser = await db.insert(users)
        .values({
            id,
            email,
            family_name,
            verified_email,
            given_name,
            name,
            picture,
            locale: "en",
            subscription: "FREE"
        })
        .returning();

    if (!newUser) {
        throw new BadRequestException("Failed to create user");
    }

    return newUser[0];
};

export const getUserById = async (id: string, db: any) => {
    const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1)
        .run();

    if (!user.results[0]) {
        throw new NotFoundException("User not found");
    }

    return user.results[0];
};

export const updateSubscription = async (id: string, db: any) => {
    const user = await db
        .update(users)
        .set({ subscription: "PREMIUM" })
        .where(eq(users.id, id))
        .returning()
        .run();

    if (!user) {
        throw new NotFoundException("User not found");
    }
    return user.results[0];
};
