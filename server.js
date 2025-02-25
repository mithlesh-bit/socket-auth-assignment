require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

const authRoutes = require("./auth");
const userRoutes = require("./users");

app.use("/api", authRoutes);
app.use("/api", userRoutes);

// Create HTTP server for WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let activeUsers = 0;

wss.on("connection", (ws) => {
  activeUsers++;
  console.log(`New user connected. Active users: ${activeUsers}`);

  wss.clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify({ activeUsers }));
    }
  });

  ws.on("close", () => {
    activeUsers--;
    console.log(`User disconnected. Active users: ${activeUsers}`);

    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify({ activeUsers }));
      }
    });
  });
});




// this is how you can use the count active user  method//////////////////////////////////////////

{/* <h1>Active Users: <span id="count">0</span></h1>

<script>
  const socket = new WebSocket("ws://localhost:3000");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    document.getElementById("count").innerText = data.activeUsers;
  };
</script> */}





server.listen(3000, () => console.log("Server running on port 3000"));
