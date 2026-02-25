const http = require('http');

const data = JSON.stringify({
    email: 'kishore.ad23@bitsathy.ac.in',
    password: '1234'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let body = '';
    res.on('data', d => {
        body += d;
    });
    res.on('end', () => {
        console.log(`Response body: ${body}`);
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
