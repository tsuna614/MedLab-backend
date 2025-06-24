const WebSocket = require("ws");
const { Message, messageItemSchema } = require("../models/message.model");
const messageController = require("../controllers/message.controller");
const url = require("url");

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    const query = url.parse(req.url, true).query;
    const currentUserId = query.id;
    const isAdmin = query.isAdmin === "true";

    if (!currentUserId) {
      ws.close(1008, "User ID is required");
      return;
    }

    ws.userId = currentUserId;
    ws.isAdmin = isAdmin;
    console.log(`User ${currentUserId} connected, Admin: ${isAdmin}`);

    ws.on("message", async (data) => {
      const { message, userId } = JSON.parse(data); // userId trong day dong vai tro nhu la conversationId
      const newMessage = {
        message,
        senderType: isAdmin ? "admin" : "user",
        userId: userId,
      };

      try {
        const response = await messageController.postMessage(newMessage);
        if (response.status === 200) {
          console.log("Message sent successfully:", response);

          wss.clients.forEach((client) => {
            if (
              client.readyState === WebSocket.OPEN &&
              client.userId === userId
            ) {
              client.send(JSON.stringify(newMessage));
            }
          });
        } else {
          console.error("Error sending message:", response);
        }
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  return wss;
}

module.exports = setupWebSocket;
