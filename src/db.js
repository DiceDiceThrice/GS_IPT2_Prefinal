import 'dotenv/config';
import mysql from 'mysql2/promise';
export const pool = mysql.createPool({ host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'kens_marketing', waitForConnections: true, connectionLimit: 10, decimalNumbers: true });
export async function query(sql, params = []) { const [rows] = await pool.execute(sql, params); return rows; }
export async function transaction(work) {
  const db = await pool.getConnection();
  try { await db.beginTransaction(); const result = await work(db); await db.commit(); return result; }
  catch (error) { await db.rollback(); throw error; }
  finally { db.release(); }
}
