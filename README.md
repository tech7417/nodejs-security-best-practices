# Node.js Security Best Practices

## 📌 Overview
Security is a critical aspect of any Node.js application. This document outlines **best practices** to protect your application from common vulnerabilities.

---

## **1️⃣ Rate Limiting**
### **🔹 Why?**
- Prevents **brute-force attacks**, **DDoS attacks**, and **API abuse**.
- Ensures **fair usage** by limiting requests per IP.

### **🔹 How?**
- Use `express-rate-limit` for application-level protection.
- Use **Nginx or API Gateway** for large-scale rate limiting.

### **🔹 Implementation**
```js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later."
});

app.use(limiter);
```

---

## **2️⃣ Enhancing Security Through Obscurity**
### **🔹 Concealing Server Information**
ExpressJS, by default, includes server information in HTTP headers, which can be a goldmine for attackers. The `X-Powered-By` header, for instance, reveals that ExpressJS is being used. Hiding this header is a simple yet effective step in obscuring your server details.

```js
var express = require('express');
var app = express();

// Disabling 'X-Powered-By' header
app.disable('x-powered-by');
```

---

## **3️⃣ Countering Brute-Force Attacks**
### **🔹 Implementing Request Limiting**

#### **Installation and Configuration**
```sh
npm install express-limiter --save
```

#### **Implementation**
```js
var express = require('express');
var limiter = require('express-limiter');
var redisClient = require('redis').createClient();
var app = express();

var limits = limiter(app, redisClient);

// Setting up rate limiting
limits({
  path: '/login',
  method: 'all',
  lookup: ['connection.remoteAddress'],
  total: 20,
  expire: 1000 * 60 * 60 // 1 hour
});

app.get('/login', function(req, res) {
  res.status(200).send({'login': 'ok'});
});
```

---

## **4️⃣ Advanced Functionality Control**
### **🔹 Limiting Server Capabilities**

#### **Installation**
```sh
npm install limits --save
```

#### **Use-Cases and Configuration**
Consider disabling file uploads if your application doesn’t require this feature. This prevents attackers from exploiting file upload mechanisms.

```js
var nodeLimits = require('limits');

app.use(nodeLimits({
  file_uploads: false,
  post_max_size: 2000000, // Limit request sizes to 2MB
  inc_req_timeout: 60000 // Set a timeout of 60 seconds
}));
```

---

## **5️⃣ Body-Parser Middleware: Securing Payloads**
### **🔹 Limiting Payload Sizes**
The `body-parser` middleware, essential for processing request bodies, can be a vector for attacks if large payloads are allowed.

#### **Installation**
```sh
npm install body-parser --save
```

#### **Configuration**
Configure body-parser to limit the size of incoming payloads, preventing large request bodies from overloading the server.

```js
var bodyParser = require('body-parser');
app.use(bodyParser.json({
  limit: '1mb' // Limiting JSON body size to 1MB
}));
```

---

## **6️⃣ Password Encryption**
### **🔹 Why?**
- Storing raw passwords is **dangerous**.
- Encrypting passwords prevents **data leaks**.

### **🔹 How?**
- Use `bcryptjs` or `argon2` for hashing passwords before storing them.

### **🔹 Implementation**
```js
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};
```

---

## **7️⃣ JWT Blocklisting**
### **🔹 Why?**
- Prevents **reuse of old JWTs** after logout.
- Adds extra security by revoking tokens.

### **🔹 How?**
- Store **blacklisted JWTs** in Redis.

### **🔹 Implementation**
```js
const redisClient = require("redis").createClient();

const blockJWT = (token, expiryTime) => {
    redisClient.set(token, "blacklisted", "EX", expiryTime);
};
```

---

## **8️⃣ Use Helmet for Security Headers**
### **🔹 Why?**
- Prevents **common web vulnerabilities**.

### **🔹 How?**
- Use `helmet` to enable secure HTTP headers.

### **🔹 Implementation**
```js
const helmet = require("helmet");
app.use(helmet());
```

---

## **9️⃣ Use `.npmignore` to Avoid Publishing Sensitive Files**
### **🔹 Why?**
- Prevents exposing **config files, credentials, and logs**.

### **🔹 How?**
- Create `.npmignore` and add:
```
node_modules/
.env
logs/
debug.log
```

---


