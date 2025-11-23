import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool(
    isProduction
        ? {
            connectionString: process.env.DATABASE_URL, // Render dùng cái này
            ssl: { rejectUnauthorized: false },         // Render bắt buộc
        }
        : {
            host: process.env.PG_HOST,
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DATABASE,
            port: Number(process.env.PG_PORT),
        }
);

export default pool;
