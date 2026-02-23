
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query("SHOW CREATE TABLE roles");
        console.log('--- Roles Table Schema ---');
        console.log(rows[0]['Create Table']);

        const [empRows] = await connection.query("SHOW CREATE TABLE employees");
        console.log('\n--- Employees Table Schema ---');
        console.log(empRows[0]['Create Table']);

        const [tables] = await connection.query("SHOW TABLES");
        console.log('\n--- Existing Tables ---');
        console.log(tables);

        await connection.end();
    } catch (err) {
        console.error('Schema check failed:', err);
    }
}

checkSchema();
