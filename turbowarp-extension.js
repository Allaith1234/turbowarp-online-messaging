(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("This extension requires unsandboxed mode.");
  }

  const SERVER =
    "https://turbowarp-online-messaging.onrender.com";

  let socket = null;
  let username = "Guest";
  let lastMessage = "";
  let lastSender = "";
  let onlineCount = 0;
  let connected = false;

  function loadSocketIO() {
    return new Promise((resolve, reject) => {
      if (window.io) {
        resolve(window.io);
        return;
      }

      const script = document.createElement("script");
      script.src = SERVER + "/socket.io/socket.io.js";

      script.onload = () => {
        if (window.io) resolve(window.io);
        else reject(new Error("Socket.IO failed to load"));
      };

      script.onerror = () =>
        reject(new Error("Could not load Socket.IO client"));

      document.head.appendChild(script);
    });
  }

  class TurboWarpMessaging {
    getInfo() {
      return {
        id: "allaithmessaging",
        name: "Online Messaging",
        color1: "#1687ff",
        color2: "#0864c7",
        blocks: [
          {
            opcode: "connect",
            blockType: Scratch.BlockType.COMMAND,
            text: "connect to messaging server"
          },
          {
            opcode: "setUsername",
            blockType: Scratch.BlockType.COMMAND,
            text: "set username to [NAME]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Laith"
              }
            }
          },
          {
            opcode: "sendMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "send message [TEXT]",
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Hello!"
              }
            }
          },
          {
            opcode: "lastMessage",
            blockType: Scratch.BlockType.REPORTER,
            text: "last received message"
          },
          {
            opcode: "lastSender",
            blockType: Scratch.BlockType.REPORTER,
            text: "last message sender"
          },
          {
            opcode: "onlineCount",
            blockType: Scratch.BlockType.REPORTER,
            text: "online users"
          },
          {
            opcode: "isConnected",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "connected to server?"
          }
        ]
      };
    }

    async connect() {
      try {
        const io = await loadSocketIO();

        if (socket) socket.disconnect();

        socket = io(SERVER, {
          transports: ["websocket", "polling"]
        });

        socket.on("connect", () => {
          connected = true;
          socket.emit("join", username);
        });

        socket.on("disconnect", () => {
          connected = false;
        });

        socket.on("message", (data) => {
          lastSender = String(data.username || "Guest");
          lastMessage = String(data.text || "");
        });

        socket.on("onlineCount", (count) => {
          onlineCount = Number(count) || 0;
        });
      } catch (error) {
        console.error("Messaging connection failed:", error);
        connected = false;
      }
    }

    setUsername(args) {
      username = String(args.NAME || "Guest").slice(0, 30);

      if (socket && socket.connected) {
        socket.emit("join", username);
      }
    }

    sendMessage(args) {
      if (socket && socket.connected) {
        socket.emit(
          "message",
          String(args.TEXT || "").slice(0, 1000)
        );
      }
    }

    lastMessage() {
      return lastMessage;
    }

    lastSender() {
      return lastSender;
    }

    onlineCount() {
      return onlineCount;
    }

    isConnected() {
      return connected;
    }
  }

  Scratch.extensions.register(new TurboWarpMessaging());
})(Scratch);
