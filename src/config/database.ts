import { Pool } from 'pg';

const pool = new Pool({
    host: 'dpg-d4hakh2li9vc73e37ng0-a',
    user: 'clothes_db_15cc_user',
    password: 'grLMi8t67ntE6JC4w8eyMCOVBs58I4vi',
    database: 'clothes_db_15cc',
    port: 5432
});

export default pool;
