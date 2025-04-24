# Running the Application

1. Install dependencies:

```
   npm i
```

2. Run the database server:

```
   docker compose up postgres -d
```

3. Run the migrations:

```
   npx prisma migrate deploy
```

4. Run the application:

```
   npm run dev-with-ws
```
The application will be available at http://localhost:3000. Feel free to open it in several apps at once to test the real-time communication.

# Architectural choices

Next.js + Prisma for the Backend. Next.js simplifies full-stack development with built-in API routes. Prisma provides a type-safe, developer-friendly way to interact with the PostgreSQL database. I never worked with Prisma before, so it was a great opportunity to get acquinted with it.

React + Tailwind CSS + DaisyUI (Frontend). React - assignment requirement (anyway, it's great). Tailwind CSS enables fast and consistent styling. DaisyUI - easy to use and looks nice.

Anyway, for such a tiny artificial app the choice of the tech stack is not critical, so I could have used anything.

## Real-time Communication
The app uses WebSockets (socket.io) for real-time updates, combined with PostgreSQL's LISTEN/NOTIFY to react to new messages.

When a new message is inserted, a Postgres trigger emits a NOTIFY event. The backend listens for these events and immediately broadcasts the message to all connected clients via WebSocket. It's allows a simple and efficient setup for single instances deployment without external brokers like Redis or Kafka. On the other hand it doesn't scale well across multiple backend instances and has a limit on the payload size (8KB).

# what could be improved

- server side rendering
- chat messages pagination and virtualization. Database indexing is a must.
- multiline message input
- middleware for API endpoints error logging
- coverage by automatic tests
- almost all the code is in the page.tsx file. The file contains ~200 lines of code. In my opinion. It is too small to be splitted into multiple components. When the app grows, it will be a good idea to split the code into multiple components. Message input, message list, user name input are good candidates.
- it is unusual for user to be allowed to change username. It would be a better idea to keep username change logic in the dedicated area outside of the chat page. Profile page is a good candidate.
- I spent quite a lot of time on the app and stopped before implementing docker. As I never did it for nextjs, I suspect it will take me a while to get it working. The take home assignment time budget is exhausted.