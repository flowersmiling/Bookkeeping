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
    
