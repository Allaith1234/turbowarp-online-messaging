const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("TurboWarp Online Messaging Server is running!");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    socket.username = username;
    io.emit("onlineCount", io.engine.clientsCount);
  });

  socket.on("message", (message) => {
    io.emit("message", {
      username: socket.username || "Guest",
      text: String(message).slice(0, 1000),
      time: Date.now()
    });
  });

  socket.on("disconnect", () => {
    io.emit("onlineCount", io.engine.clientsCount);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
