import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { readFile } from 'node:fs/promises';
const name = process.env.DB_NAME || 'kens_marketing';
if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error('Invalid database name');
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 8) throw new Error('Set ADMIN_PASSWORD with at least 8 characters');
const db = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', multipleStatements: true });
try {
  await db.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await db.query(`USE \`${name}\``);
  await db.query(await readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8'));
  await db.execute('INSERT IGNORE INTO users(name,email,password_hash,role) VALUES(?,?,?,?)', ["Ken's Marketing Admin", process.env.ADMIN_EMAIL || 'admin@kens.local', await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), 'admin']);
  await db.query("INSERT IGNORE INTO categories(name) VALUES ('Sofas'),('Tables'),('Chairs'),('Beds'),('Cabinets')");
  console.log('Database ready. Initial admin created if the email did not already exist.');
} finally { await db.end(); }
