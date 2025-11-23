import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";

const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: Number(process.env.PG_PORT),
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;
