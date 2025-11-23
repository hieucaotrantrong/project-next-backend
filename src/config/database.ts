import dotenv from "dotenv";
dotenv.config();   // ĐẢM BẢO .env load TRƯỚC

import { Pool } from "pg";

const pool = new Pool({
    host: process.env.PG_HOST || "localhost",
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "",
    database: process.env.PG_DATABASE || "clothes_db",
    port: Number(process.env.PG_PORT) || 5432,
    ssl: false
});

export default pool;
