# Introduction

The property rental bookkeeping system was designed for property rental business. The users(Agent or Realtor) use the system to manage their properties including property management, maintenance management, monthly worksheet, monthly & yearly billing report, user management etc. It's also a multiple roles system, the pre-setting roles including administrator, accountant, agent. Implemented approval authority hierarchy and data independence, enhanced the business control environment, streamlined approval and statement processes, and reduced management spending.

## Functionality Pages
Pages | Functionality
--- | ---
Login Page | user login
Forget password Page | password find back
Account Setting Page | change password or role
Monthly Worksheet Page | monthly rental fee management
Property management page | create, update, inactive properties
Admin monthly report page | monthly rental fee aggregate for Accountant
Landlord billing report page | monthly and yearly reports of each property
Contract page | view/download contracts
User Management page | user managing

## Tech Stack

🌐 MERN Stack: MongoDB, Expressjs, React/Redux, Nextjs

## Clone or Download
```terminal
$ git clone https://github.com/flowersmiling/Bookkeeping.git
$ npm update -g pnpm  // update pnpm from 7.x to 8.x in case of (ERR_INVALID_THIS) errors
```
## Project Structure
```terminal
apps/
  server/
    src/
      services/
        database.service.ts (check [Prepare your database connection string])
    package.json
    .env (to create .env, check [prepare your secret session])
  web/
    package.json
    .env.development (to create .env.development, check [Prepare your API_URL])
package.json
...
```

# Usage (run project on your machine)

## Prerequisites
- [MongoDB](https://github.com/mongodb/node-mongodb-native)
- [Next](https://nextjs.org) 
- [Turbo](https://turbo.build/repo)
- [pnpm](https://pnpm.io/installation)

Notice, you need client(web) and server runs concurrently, in order to make them talk to each other

## Client-side (PORT: 4000)

### Prepare your API_URL

run the script at the first level:

(You need to add a NEXT_PUBLIC_API_URL in .env.development to consume the REST API)

```terminal
// in the root level
$ cd apps/web
$ echo "NEXT_PUBLIC_API_URL=YOUR NEXT_PUBLIC_API_URL" >> .env.development
```

## Server-side (PORT: 8000)

### Prepare your database

You should deploy your MongoDB database locally or on Azure virtual machine firstly. Contact me for getting the database model.

### Prepare your secret session

run the script at the first level:

(You need to add a JWT_SECRET in .env to connect to MongoDB)

```terminal
// in the root level
$ cd apps/server
$ echo "JWT_SECRET=YOUR JWT_SECRET" >> .env
```

### Prepare your database connection string

(You should replace the database connection string with your own string in database.service.ts)

"mongodb://[Your Database_Connection_String]"

## Start

```terminal
// in the root level
$ npm update -g pnpm  // update pnpm from 7.x to 8.x
$ pnpm install        // install dependencies
$ pnpm build          // build project
$ pnpm dev            // run project both server-side and web-side parallelly 
```

# Dependencies
Client-side | Server-side
--- | ---
"@date-io/date-fns": "1.3.13" | "@types/multer": "^1.4.7"
"@emotion/react": "^11.10.5" | "bcryptjs": "^2.4.3"
"@emotion/styled": "^11.10.5" | "cors": "^2.8.5"
"@mui/icons-material": "^5.10.16" | "dotenv": "^16.0.3"
"@mui/material": "^5.10.16" | "express": "^4.18.2"
"@mui/x-data-grid": "^5.17.16" | "express-async-handler": "^1.2.0"
"@mui/x-date-pickers": "^5.0.16" | "jsonwebtoken": "^9.0.0"
"@types/downloadjs": "^1.4.3" | "mongodb": "^4.12.1"
"@types/lodash": "^4.14.191" | "mongoose": "^6.8.3"
"@types/react-input-mask": "^3.0.2" | "multer": "1.4.5-lts.1"
"ag-grid-community": "^29.3.5" | "rimraf": "^4.4.1"
"ag-grid-enterprise": "^29.3.5"
"ag-grid-react": "^29.3.5"
"axios": "^1.3.2"
"date-fns": "^2.29.3"
"dayjs": "^1.11.7"
"downloadjs": "^1.4.7"
"env-cmd": "^10.1.0"
"html2canvas": "^1.4.1"
"jspdf": "^2.5.1"
"lodash": "^4.17.21"
"next": "^13.1.5"
"react": "18.2.0"
"react-dom": "18.2.0"
"react-hot-toast": "^2.4.1"
"react-input-mask": "^2.0.4"
"react-number-format": "^5.1.3"
"react-query": "^3.39.2"
"ui": "workspace:*"
"uuidv4": "^6.2.13"

# BUGs or comments

[Create new Issues](https://github.com/flowersmiling/Bookkeeping/issues)

Email Me: chaolinglu@gmail.com

