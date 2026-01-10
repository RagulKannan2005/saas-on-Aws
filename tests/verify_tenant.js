const http = require('http');

const data = JSON.stringify({
  companyName: "TestCompanySchemaJs",
  email: "schema.test.js@example.com",
  password: "password123"
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  
  console.log(`Status Code: ${res.statusCode}`);

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:', body);
    if (res.statusCode === 201) {
        console.log("SUCCESS: User registered and tenant created.");
    } else {
        console.log("FAILED: Unexpected status code.");
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
