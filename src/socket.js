const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const orderSchema = require("../src/modules/orderbook/schema");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on("connection", (ws) => {
  console.log("A Client Connected");
  ws.send("Welcome To The WebSocket Server!");
  const interval = setInterval(async () => {
    try {
      const lastBuyOrders = await orderSchema
        .find({ orderType: "buy" })
        .sort({ createdAt: -1 })
        .limit(10);
      const lastSellOrders = await orderSchema
        .find({ orderType: "sell" })
        .sort({ createdAt: -1 })
        .limit(10);
      ws.send(
        JSON.stringify({
          lastBuyOrders,
          lastSellOrders,
        })
      );
      console.log("lastBuyOrders===", lastBuyOrders);
      console.log("lastSellOrders===", lastSellOrders);
    } catch (error) {
      console.error("Error fetching Orders:", error.message);
      ws.send(JSON.stringify({ message: "Error", error: error.message }));
    }
  }, 1000);
  ws.on("message", (message) => {
    console.log(`Received From Client: ${message}`);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  ws.on("close", () => {
    console.log("Client Disconnected");
    clearInterval(interval);
  });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
