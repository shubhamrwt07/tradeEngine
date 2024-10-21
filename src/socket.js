const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const orderSchema = require("../src/modules/orderbook/schema"); // Assuming this is your Mongoose schema

// Create an Express app
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connection
wss.on("connection", (ws) => {
  console.log("A client connected");

  // Send a welcome message when the client connects
  ws.send("Hello, welcome to the WebSocket server!");

  // Send orderbook data every second
  const interval = setInterval(async () => {
    try {
      // Log MongoDB connection
      console.log("Fetching orderbook data...");

      const orderbook = await orderSchema.find();
      console.log("Fetched orderbook:", orderbook); // Check if data is fetched

      if (orderbook.length === 0) {
        console.log("No data in orderbook.");
      }

      // Convert orderbook to JSON string and send it
      ws.send(JSON.stringify({ orderbook }));
    } catch (error) {
      // Log the error with full details
      console.error("Error fetching orderbook:", error.message);
      console.error(error.stack);

      // Send an error message with the details
      ws.send(JSON.stringify({ message: "error", error: error.message }));
    }
  }, 1000);

  // Listen for messages from the client
  ws.on("message", (message) => {
    console.log(`Received from client: ${message}`);

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Cleanup when the client disconnects
  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval); // Stop sending data when the client disconnects
  });
});

// Start the HTTP server and WebSocket server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
