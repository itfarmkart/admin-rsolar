
const http = require('http');

const req = http.get('http://localhost:5002/api/employees', (res) => {
    console.log('--- API Diagnostic ---');
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        console.log('Body:', body);
    });
});

req.on('error', e => console.error('Connection Error:', e.message));
