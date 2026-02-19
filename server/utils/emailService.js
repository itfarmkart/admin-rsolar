
const nodemailer = require('nodemailer');
const path = require('path');

// Configure transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send a welcome email to a new employee.
 * @param {Object} employee - The employee object (should contain email, fullName, role, permissions).
 */
const sendWelcomeEmail = async (employee) => {
    // If no credentials, log simulated email
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('---------------------------------------------------');
        console.log('Simulating Welcome Email (No SMTP Credentials Set)');
        console.log(`To: ${employee.email}`);
        console.log(`Subject: Welcome to r-solar!`);
        console.log(`Body: Hello ${employee.fullName}, welcome to the team...`);
        console.log('---------------------------------------------------');
        return;
    }

    const { id, fullName, email, role, permissions } = employee;

    // Generate Permissions List
    const permissionItems = [];
    if (permissions?.crm?.enabled) permissionItems.push('<li><strong>CRM Access</strong> - <a href="https://crm.myrsolar.com/" style="color: #72bf44; text-decoration: none;">https://crm.myrsolar.com/</a> - Customer & Operations Management</li>');
    if (permissions?.missionControl?.enabled) permissionItems.push('<li><strong>Mission Control</strong> - <a href="https://missioncontrol.myrsolar.com/" style="color: #72bf44; text-decoration: none;">https://missioncontrol.myrsolar.com/</a> - Project Pipeline Tracking</li>');
    if (permissions?.adminPanel?.enabled) permissionItems.push('<li><strong>Admin Panel</strong> - <a href="https://admin.myrsolar.com/" style="color: #72bf44; text-decoration: none;">https://admin.myrsolar.com/</a> - System Configuration & User Management</li>');

    // Default if no specific modules enabled
    if (permissionItems.length === 0) {
        permissionItems.push('<li><strong>Employee Portal</strong> - Basic account access</li>');
    }

    const permissionListHtml = `<ul>${permissionItems.join('')}</ul>`;
    const permissionListText = permissionItems.map(item => item.replace(/<[^>]*>/g, '')).join('\n- ');

    const mailOptions = {
        from: `"r-solar Admin" <${process.env.SMTP_USER}>`,
        to: email,
        cc: 'akshayp@farmkart.com',
        subject: `${id} - ${fullName} - r-solar OS`,
        text: `Hello ${fullName},\n\nWelcome to r-solar! We are excited to have you on board as a ${role}.\n\nYour account has been created with access to:\n${permissionListText}\n\nBest regards,\nr-solar IT Team`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #72bf44;">Welcome to r-solar!</h2>
                <p>Hello <strong>${fullName}</strong>,</p>
                <p>We are excited to have you on board as a <strong>${role}</strong>.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <h3>Your Access Permissions:</h3>
                ${permissionListHtml}
                <br />
                <p>Best regards,<br /><strong>r-solar IT Team</strong></p>
                <br />
                <img src="cid:rsolarlogo" alt="r-solar logo" style="width: 150px; height: auto;" />
            </div>
        `,
        attachments: [
            {
                filename: 'r-solar-logo.png',
                path: path.join(__dirname, '../../src/assets/r-solar-logo.png'),
                cid: 'rsolarlogo'
            }
        ]
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

module.exports = { sendWelcomeEmail };
