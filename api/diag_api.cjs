
const http = require('http');

http.get('http://localhost:5002/api/employees', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('--- API Response Check ---');
        console.log('Status Code:', res.statusCode);
        try {
            const parsed = JSON.parse(data);
            console.log('Count:', Array.isArray(parsed) ? parsed.length : 'Not an array');
            console.log('First 2 Items:', JSON.stringify(parsed.slice(0, 2), null, 2));
        } catch (e) {
            console.log('Raw Data (First 200 chars):', data.substring(0, 200));
        }
    });
}).on('error', (err) => {
    console.error('API Fetch Failed:', err.message);
});
