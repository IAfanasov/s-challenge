import { createServer } from "http";
import next from "next";
import pg from "pg";
import { Server } from "socket.io";
import { parse } from "url";
import * as dotenv from "dotenv";

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const pgClient = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

app.prepare().then(async () => {
  try {
    await pgClient.connect();
    console.log("Connected to PostgreSQL for notifications");

    await pgClient.query("LISTEN new_message");

    pgClient.on("notification", (notification) => {
      try {
        const message = JSON.parse(notification.payload);
        const messageWithNormalizedDate = {
          ...message,
          createdAt: `${message.createdAt}Z`, // TODO: reuse generic prisma's approach instead of this hack
        };
        console.log("Received message notification:", messageWithNormalizedDate);
        io.emit("receive-message", messageWithNormalizedDate);
      } catch (error) {
        console.error("Error processing notification:", error);
      }
    });
  } catch (error) {
    console.error("Error connecting to PostgreSQL for notifications:", error);
  }

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  // Use port 3001 for the WebSocket server
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, (err) => {
    if (err) {
      throw err;
    }
    console.log(`> WebSocket server ready on http://localhost:${PORT}`);
  });
});
