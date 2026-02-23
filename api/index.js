
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Global DB Connection
let dbConnection;

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

async function initializeDatabase() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        console.log(`Database ${process.env.DB_NAME} checked/created.`);
        await connection.changeUser({ database: process.env.DB_NAME });

        // Employees Table
        const createEmployeesQuery = `
            CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullName VARCHAR(255) NOT NULL,
                employeeId VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                departmentId INT,
                roleId INT,
                status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createEmployeesQuery);

        // Migration: Add departmentId if missing
        try {
            await connection.query("ALTER TABLE employees ADD COLUMN departmentId INT");
            console.log("Added departmentId column.");
        } catch (err) { }

        // Migration: Drop legacy department column if exists
        try {
            await connection.query("ALTER TABLE employees DROP COLUMN department");
            console.log("Dropped legacy 'department' column.");
        } catch (err) {
            // Ignore if column doesn't exist
        }

        // Migration: Add mobile column if missing
        try {
            await connection.query("ALTER TABLE employees ADD COLUMN mobile VARCHAR(15)");
            console.log("Added mobile column.");
        } catch (err) { }

        // Migration: Add roleId column and migrate data
        try {
            const [columns] = await connection.query("SHOW COLUMNS FROM employees LIKE 'roleId'");
            if (columns.length === 0) {
                await connection.query("ALTER TABLE employees ADD COLUMN roleId INT");
                console.log("Added roleId column.");
            }

            // Migrate data if legacy 'role' column exists
            const [oldColumns] = await connection.query("SHOW COLUMNS FROM employees LIKE 'role'");
            if (oldColumns.length > 0) {
                // Update roleId based on role name matching
                await connection.query(`
                    UPDATE employees e
                    JOIN roles r ON e.role = r.name
                    SET e.roleId = r.id
                    WHERE e.roleId IS NULL
                `);
                console.log("Migrated data from 'role' to 'roleId'.");

                // Now drop the legacy column
                await connection.query("ALTER TABLE employees DROP COLUMN role");
                console.log("Dropped legacy 'role' column.");
            }
        } catch (err) {
            console.error("Migration error (roleId):", err);
        }

        // Migration: Drop legacy permission columns
        const legacyColumns = ['crmAccess', 'missionControl', 'adminPanel'];
        for (const col of legacyColumns) {
            try {
                await connection.query(`ALTER TABLE employees DROP COLUMN ${col}`);
                console.log(`Dropped legacy column '${col}'.`);
            } catch (err) { }
        }

        console.log('Employees table checked/created.');

        // Department Table
        try {
            const [tables] = await connection.query("SHOW TABLES LIKE 'departments'");
            if (tables.length > 0) {
                await connection.query("RENAME TABLE departments TO department");
                console.log("Renamed 'departments' table to 'department'.");
            }
        } catch (err) {
            console.error("Migration error (rename departments):", err);
        }

        const createDepartmentQuery = `
            CREATE TABLE IF NOT EXISTS department (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            )
        `;
        await connection.query(createDepartmentQuery);
        console.log('Department table checked/created.');

        // Seed Departments
        const [deptRows] = await connection.query('SELECT COUNT(*) as count FROM department');
        if (deptRows[0].count === 0) {
            const defaultDepartments = ['Operations', 'Sales', 'Engineering', 'HR', 'Finance', 'Marketing'];
            const values = defaultDepartments.map(d => `('${d}')`).join(',');
            await connection.query(`INSERT INTO department (name) VALUES ${values}`);
            console.log('Default departments seeded.');
        }

        // Roles Table
        const createRolesQuery = `
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                departmentId INT,
                permissions JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (departmentId) REFERENCES department(id)
            )
        `;
        await connection.query(createRolesQuery);
        console.log('Roles table checked/created.');

        dbConnection = connection;
        console.log('Database initialized and connected.');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

// Routes
app.get('/health', (req, res) => {
    res.send('OK');
});

// API Endpoint to Get Employees
app.get('/api/employees', async (req, res) => {
    if (!dbConnection) return res.status(503).json({ error: 'Database not ready' });
    try {
        // updated query to join departments and get the name
        const query = `
            SELECT e.*, d.name as departmentName, r.name as roleName, r.permissions as rolePermissions
            FROM employees e 
            LEFT JOIN department d ON e.departmentId = d.id 
            LEFT JOIN roles r ON e.roleId = r.id
            ORDER BY e.created_at DESC
        `;
        const [rows] = await dbConnection.execute(query);

        // Parse rolePermissions JSON
        const employees = rows.map(emp => {
            try {
                // DEBUG LOGGING
                console.log(`Processing emp ${emp.id}: rolePermissions type=${typeof emp.rolePermissions}, value=${emp.rolePermissions}`);

                let parsedPermissions = {};
                if (typeof emp.rolePermissions === 'string') {
                    parsedPermissions = JSON.parse(emp.rolePermissions || '{}');
                } else if (emp.rolePermissions && typeof emp.rolePermissions === 'object') {
                    parsedPermissions = emp.rolePermissions;
                }

                return {
                    ...emp,
                    rolePermissions: parsedPermissions
                };
            } catch (e) {
                console.error(`Error parsing permissions for emp ${emp.id}:`, e);
                return { ...emp, rolePermissions: {} };
            }
        });

        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error.message, error.stack);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// API Endpoint to Get Department List
app.get('/api/department', async (req, res) => {
    if (!dbConnection) return res.status(503).json({ error: 'Database not ready' });
    try {
        const [rows] = await dbConnection.execute('SELECT * FROM department ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to Create Role
app.post('/api/roles', async (req, res) => {
    if (!dbConnection) return res.status(503).json({ error: 'Database not ready' });
    try {
        const { name, departmentId, permissions } = req.body;

        if (!name || !departmentId) {
            return res.status(400).json({ error: 'Role name and department are required' });
        }

        const query = `
            INSERT INTO roles (name, departmentId, permissions)
            VALUES (?, ?, ?)
        `;

        // Store permissions as JSON string
        const permissionsJson = JSON.stringify(permissions);

        const [result] = await dbConnection.execute(query, [name, departmentId, permissionsJson]);

        res.status(201).json({ message: 'Role template created successfully', roleId: result.insertId });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to Get Roles
app.get('/api/roles', async (req, res) => {
    if (!dbConnection) return res.status(503).json({ error: 'Database not ready' });
    try {
        const query = `
            SELECT r.*, d.name as departmentName, COUNT(e.id) as employeeCount
            FROM roles r
            LEFT JOIN department d ON r.departmentId = d.id
            LEFT JOIN employees e ON r.id = e.roleId
            GROUP BY r.id
            ORDER BY r.created_at DESC
        `;
        const [rows] = await dbConnection.execute(query);

        // Parse permissions JSON
        const roles = rows.map(role => ({
            ...role,
            permissions: typeof role.permissions === 'string' ? JSON.parse(role.permissions || '{}') : role.permissions
        }));

        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to Get Single Role
app.get('/api/roles/:id', async (req, res) => {
    const { id } = req.params;
    if (!dbConnection) return res.status(503).json({ error: 'Database not ready' });
    try {
        const query = `
            SELECT r.*, d.name as departmentName 
            FROM roles r
            LEFT JOIN department d ON r.departmentId = d.id
            WHERE r.id = ?
        `;
        const [rows] = await dbConnection.execute(query, [id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Role not found' });

        const role = rows[0];
        role.permissions = typeof role.permissions === 'string' ? JSON.parse(role.permissions || '{}') : role.permissions;

        res.json(role);
    } catch (error) {
        console.error('Error fetching role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to Update Role
app.put('/api/roles/:id', async (req, res) => {
    const { id } = req.params;
    if (!dbConnection) return res.status(503).json({ error: 'Database not ready' });
    try {
        const { name, departmentId, permissions } = req.body;

        const query = `
            UPDATE roles 
            SET name = ?, departmentId = ?, permissions = ?
            WHERE id = ?
        `;

        const permissionsJson = JSON.stringify(permissions);

        const [result] = await dbConnection.execute(query, [name, departmentId, permissionsJson, id]);

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Role not found' });

        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const { sendWelcomeEmail } = require('./utils/emailService.js');

// API Endpoint to Create Employee
app.post('/api/employees', async (req, res) => {
    if (!dbConnection) return res.status(503).json({ error: 'Database not ready' });
    try {
        const { fullName, email, departmentId, roleId, mobile } = req.body;

        if (!fullName || !email || !departmentId || !roleId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate Employee ID (e.g., EMP-1001)
        const [rows] = await dbConnection.query('SELECT COUNT(*) as count FROM employees');
        const employeeId = `EMP-${1000 + rows[0].count + 1}`;

        const query = `
            INSERT INTO employees (fullName, employeeId, email, departmentId, roleId, mobile)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await dbConnection.execute(query, [
            fullName, employeeId, email, departmentId, roleId, mobile || null
        ]);

        // Send Welcome Email (Non-blocking)
        // Fetch role name and permissions for email
        const [roleRows] = await dbConnection.query('SELECT name, permissions FROM roles WHERE id = ?', [roleId]);
        const roleName = roleRows[0]?.name || 'Employee';
        const rolePermissions = roleRows[0]?.permissions
            ? (typeof roleRows[0].permissions === 'string' ? JSON.parse(roleRows[0].permissions) : roleRows[0].permissions)
            : {};

        sendWelcomeEmail({ id: employeeId, fullName, email, role: roleName, permissions: rolePermissions });

        res.status(201).json({ message: 'Employee created successfully', employeeId });
    } catch (error) {
        console.error('Error creating employee:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to Get Single Employee
app.get('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    if (!dbConnection) return res.status(503).json({ error: 'Database not ready' });
    try {
        const query = `
            SELECT e.*, d.name as departmentName, r.name as roleName
            FROM employees e
            LEFT JOIN department d ON e.departmentId = d.id
            LEFT JOIN roles r ON e.roleId = r.id
            WHERE e.id = ?
        `;
        const [rows] = await dbConnection.execute(query, [id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to Update Employee
app.put('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    if (!dbConnection) return res.status(503).json({ error: 'Database not ready' });
    try {
        const { fullName, email, departmentId, roleId, status, mobile } = req.body;

        const query = `
            UPDATE employees 
            SET fullName = ?, email = ?, departmentId = ?, roleId = ?, status = ?, mobile = ?
            WHERE id = ?
        `;

        await dbConnection.execute(query, [
            fullName, email, departmentId || null, roleId, status, mobile, id
        ]);

        res.json({ message: 'Employee updated successfully' });
    } catch (error) {
        console.error('Error updating employee:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint for Login (Verify Admin Access)
app.post('/api/login', async (req, res) => {
    if (!dbConnection) return res.status(503).json({ error: 'Database not ready' });
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const query = `
            SELECT e.*, r.name as roleName, r.permissions 
            FROM employees e
            LEFT JOIN roles r ON e.roleId = r.id
            WHERE e.email = ?
        `;
        const [rows] = await dbConnection.execute(query, [email]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const employee = rows[0];

        if (employee.status !== 'Active') {
            return res.status(403).json({ error: 'Access denied: Account is inactive' });
        }

        // Parse permissions safely
        let permissions = {};
        try {
            permissions = typeof employee.permissions === 'string'
                ? JSON.parse(employee.permissions || '{}')
                : (employee.permissions || {});
        } catch (e) {
            console.error(`Error parsing permissions for user ${email}:`, e);
            permissions = {};
        }

        if (!permissions?.adminPanel?.enabled) {
            return res.status(403).json({ error: 'Access denied: Admin Panel permission required' });
        }

        // Return user data with parsed permissions
        res.json({
            message: 'Login successful',
            user: {
                ...employee,
                permissions
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start Server
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        // Initialize DB after server starts (non-blocking)
        initializeDatabase();
    });
} else {
    // In serverless, database might need to be initialized differently or on-demand
    // For Vercel, we export the app
    initializeDatabase();
}

module.exports = app;
