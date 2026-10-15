import 'dotenv/config';
import { createApp } from './app.js';
import { pool } from './db.js';
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32 || secret.startsWith('replace-with')) throw new Error('Set JWT_SECRET to a random secret of at least 32 characters');
await pool.query('SELECT 1');
const server = createApp(secret).listen(Number(process.env.PORT || 4000), () => console.log("Ken's Marketing API listening on port " + (process.env.PORT || 4000)));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { server.close(async () => { await pool.end(); process.exit(0); }); });
