import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { log } from './config/logger';
import { cors } from 'hono/cors'
import auth from './controller/auth/route';
import org from './controller/org/route';

const app = new Hono();

app.use(logger(log))

app.use('/*', cors())

app.get('/', (c) => c.text('Welcome to Hono with Cloudflare!'));

app.route("/auth", auth)

app.route("/org", org)

app.route('/api', openAPIHono)

app.notFound((c) => {
    return c.json({
        error: "Not Found",
        message: "The requested URL was not found on this server."
    }, 404);
});




export default app;   