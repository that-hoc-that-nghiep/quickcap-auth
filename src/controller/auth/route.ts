import { Context, Hono } from 'hono';
import {
	handleLogin,
	handleGoogleCallback,
	handleVerifyToken,
	handleLogout,
	handleGetUser,
	handleUpdateSubscription,
	handleGetAllUser,
} from './service';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { createApiResponse } from '../../api-docs/openAPIResponseBuilders';
import { AuthDoc } from '../../model/authModel';

const auth = new Hono();
export const authRegistry = new OpenAPIRegistry();

auth.post('/login', async (c: Context<{}, any, {}>) => {
	return await handleLogin(c);
});

authRegistry.registerPath({
	method: 'post',
	description: 'Login with a provider',
	path: '/auth/login',
	tags: ['Auth'],
	requestBody: {
		content: {
			'application/json': {
				schema: {
					type: 'object',
					properties: {
						provider: { type: 'string', example: 'google' },
						redirectAfterLogin: { type: 'string', example: 'https://kungfutech.edu.vn/khoa-hoc/javascript' },
					},
					required: ['provider', 'redirectAfterLogin'],
				},
			},
		},
	},
	responses: createApiResponse(AuthDoc, 'Success'),
});

auth.get('/callback', async (c: Context<{}, any, {}>) => {
	return await handleGoogleCallback(c);
});

authRegistry.registerPath({
	method: 'get',
	description: 'Callback from Google',
	path: '/auth/callback',
	tags: ['Auth'],
	responses: createApiResponse(AuthDoc, 'Success'),
});

auth.get('/verify/:token', async (c: Context<{}, '/:token', {}>) => {
	return await handleVerifyToken(c);
});

authRegistry.registerPath({
	method: 'get',
	description: 'Verify token',
	path: '/auth/verify/{token}',
	tags: ['Auth'],
	parameters: [
		{
			name: 'token',
			in: 'path',
			required: true,
			schema: {
				type: 'string',
				example: '',
			},
			description: 'JWT token to verify',
		},
	],
	responses: createApiResponse(AuthDoc, 'Success'),
});

auth.get('/logout', async (c: Context<{}, any, {}>) => {
	return await handleLogout(c);
});

authRegistry.registerPath({
	method: 'get',
	description: 'Logout',
	path: '/auth/logout',
	tags: ['Auth'],
	responses: createApiResponse(AuthDoc, 'Success'),
});

auth.get('/user/all', async (c: Context<{}, any, {}>) => {
	return await handleGetAllUser(c);
});

authRegistry.registerPath({
	method: 'get',
	description: 'Get all users',
	path: '/auth/user/all',
	tags: ['Auth'],
	responses: createApiResponse(AuthDoc, 'Success'),
});


//Get user by id
auth.get('/user/:id', async (c: Context<{}, '/:id', {}>) => {
	return await handleGetUser(c);
});

authRegistry.registerPath({
	method: 'get',
	description: 'Get user by id',
	path: '/auth/user/{id}',
	tags: ['Auth'],
	parameters: [
		{
			name: 'id',
			in: 'path',
			required: true,
			schema: {
				type: 'string',
				example: '1',
			},
			description: 'User ID',
		},
	],
	responses: createApiResponse(AuthDoc, 'Success'),
});

//Update subscription
auth.put('/subscription', async (c: Context<{}, '/subscription', {}>) => {
	return await handleUpdateSubscription(c);
});

authRegistry.registerPath({
	method: 'put',
	description: 'Update subscription',
	path: '/auth/subscription',
	tags: ['Auth'],
	requestBody: {
		content: {
			'application/json': {
				schema: {
					type: 'object',
					properties: {
						subscription: { type: 'string', example: 'PREMIUM' },
					},
					required: ['subscription'],
				},
			},
		},
	},
	security: [{ bearerAuth: [] }],
	responses: createApiResponse(AuthDoc, 'Success'),
});

export default auth;
