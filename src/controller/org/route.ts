import { Context, Hono } from "hono"
import {
    handleAddUserToOrg,
    handleCreateOrg,
    handleDeteleOrg,
    handleGetOrg,
    handleLeaveOrg,
    // handleLeaveOrg,
    handleRemoveUserFromOrg,
    // handleTransferOwnership,
    handleUpdateOrg,
    handleUpdatePermission,
} from "./service"
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { createApiResponse } from "../../api-docs/openAPIResponseBuilders"
import { OrgDoc } from "../../model/orgModel"

const org = new Hono()
export const orgRegistry = new OpenAPIRegistry()

org.get("/:orgId", async (c: Context<{}, "/:orgId", {}>) => {
    return await handleGetOrg(c)
})

orgRegistry.registerPath({
    method: "get",
    description: "Get an organization",
    path: "/org/{orgId}",
    tags: ["Org"],
    parameters: [
        {
            name: "orgId",
            in: "path",
            required: true,
            schema: {
                type: "string",
                example: "1",
            },
            description: "Organization ID",
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(OrgDoc, "Success"),
});

org.post("/create", async (c: Context<{}, any, {}>) => {
    return await handleCreateOrg(c)
})

orgRegistry.registerPath({
    method: "post",
    description: "Create an organization",
    path: "/org/create",
    tags: ["Org"],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        name: { type: "string", example: "JS Club" },
                    },
                    required: ["name"],
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(OrgDoc, "Success"),
});

org.put("/:orgId", async (c: Context<{}, "/:orgId", {}>) => {
    return await handleUpdateOrg(c)
})

orgRegistry.registerPath({
    method: "put",
    description: "Update an organization",
    path: "/org/{orgId}",
    tags: ["Org"],
    parameters: [
        {
            name: "orgId",
            in: "path",
            required: true,
            schema: {
                type: "string",
                example: "1",
            },
            description: "Organization ID",
        },
    ],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        name: { type: "string", example: "JS Club" },
                    },
                    required: ["name"],
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(OrgDoc, "Success"),
});


org.put("/:orgId/add", async (c: Context<{}, any, {}>) => {
    return await handleAddUserToOrg(c)
})

orgRegistry.registerPath({
    method: "put",
    description: "Add a user to an organization",
    path: "/org/{orgId}/add",
    tags: ["Org"],
    parameters: [
        {
            name: "orgId",
            in: "path",
            required: true,
            schema: {
                type: "string",
                example: "1",
            },
            description: "Organization ID",
        },
    ],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        usersEmail: { type: "array", example: ["email1@gmail.com", "email2@gmail.com"] },
                    },
                    required: ["usersEmail"],
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(OrgDoc, "Success"),
});


org.put("/:orgId/remove", async (c: Context<{}, any, {}>) => {
    return await handleRemoveUserFromOrg(c)
})

orgRegistry.registerPath({
    method: "put",
    description: "Remove a user from an organization",
    path: "/org/{orgId}/remove",
    tags: ["Org"],
    parameters: [
        {
            name: "orgId",
            in: "path",
            required: true,
            schema: {
                type: "string",
                example: "1",
            },
            description: "Organization ID",
        },
    ],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        email: { type: "string", example: "email1@gmail.com" },
                    },
                    required: ["email"],
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(OrgDoc, "Success"),
});

org.put("/:orgId/permission", async (c: Context<{}, any, {}>) => {
    return await handleUpdatePermission(c)
})

orgRegistry.registerPath({
    method: "put",
    description: "Update a user's permission in an organization",
    path: "/org/{orgId}/permission",
    tags: ["Org"],
    parameters: [
        {
            name: "orgId",
            in: "path",
            required: true,
            schema: {
                type: "string",
                example: "1",
            },
            description: "Organization ID",
        },
    ],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        email: { type: "string", example: "email1@gmail.com" },
                        permission: { type: "string", example: "ALL" },
                    },
                    required: ["gmail", "permission"],
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(OrgDoc, "Success"),
});

org.delete("/:orgId/leave", async (c: Context<{}, any, {}>) => {
    return await handleLeaveOrg(c)
})


orgRegistry.registerPath({
    method: "delete",
    description: "Leave an organization",
    path: "/org/{orgId}/leave",
    tags: ["Org"],
    parameters: [
        {
            name: "orgId",
            in: "path",
            required: true,
            schema: {
                type: "string",
                example: "1",
            },
            description: "Organization ID",
        },
    ],
    requestBody: {
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        email: { type: "string", example: "email1@gmail.com" },
                    },
                    required: ["email"],
                },
            },
        }
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(OrgDoc, "Success"),
});

org.delete("/:orgId", async (c: Context<{}, any, {}>) => {
    return await handleDeteleOrg(c)
})

orgRegistry.registerPath({
    method: "delete",
    description: "Soft delete an organization",
    path: "/org/{orgId}",
    tags: ["Org"],
    parameters: [
        {
            name: "orgId",
            in: "path",
            required: true,
            schema: {
                type: "string",
                example: "1",
            },
            description: "Organization ID",
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(OrgDoc, "Success"),
});

export default org
