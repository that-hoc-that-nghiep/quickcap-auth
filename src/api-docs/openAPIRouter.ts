import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { generateOpenAPIDocument } from "./openAPIDocumentGenerator";

const openAPIHono = new OpenAPIHono();

const openAPIDocument = generateOpenAPIDocument()

openAPIHono.get('/swagger.json', (c) => {
    c.header('Content-Type', 'application/json');
    return c.json(openAPIDocument);
});

// Serve Swagger UI
openAPIHono.use('/swagger-ui', swaggerUI({ url: '/api/swagger.json' }));

export default openAPIHono;