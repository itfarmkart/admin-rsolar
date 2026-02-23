
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../server/.env' });

async function checkData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [employees] = await connection.query('SELECT * FROM employees');
        const [roles] = await connection.query('SELECT * FROM roles');
        const fs = require('fs');
        fs.writeFileSync('db_results.json', JSON.stringify({ employees, roles }, null, 2));
        console.log('Results written to db_results.json');

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkData();
