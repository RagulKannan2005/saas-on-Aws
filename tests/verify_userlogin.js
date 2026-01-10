const http = require("http");

const data = JSON.stringify({
  email: "schema.test.js@example.com",
  password: "password123",
});

const options = {
  hostname: "localhost",
  port: 5001,
  path: "/api/auth/login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = http.request(options, (res) => {
  let chunks = "";
  res.on("data", (chunk) => {
    chunks += chunk;
  });
  res.on("end", () => {
    const data = JSON.parse(chunks);
    console.log(data);
  });
});

req.write(data);
req.end();
