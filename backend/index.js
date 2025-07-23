const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB (local or Atlas from .env)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ Define Mongoose Schemas
const FoodItem = mongoose.model(
  "FoodItem",
  new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
  })
);

const Order = mongoose.model(
  "Order",
  new mongoose.Schema({
    items: [
      {
        foodId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
      },
    ],
    createdAt: { type: Date, default: Date.now },
  })
);

// ✅ Seed initial food items
app.get("/api/seed", async (req, res) => {
  await FoodItem.deleteMany();
  await FoodItem.insertMany([
    { name: "Pizza", price: 12, image: "https://i.imgur.com/eTmWoAN.png" },
    { name: "Burger", price: 8, image: "https://i.imgur.com/0umadnY.jpg" },
    { name: "Sushi", price: 15, image: "https://i.imgur.com/UPrs1EW.jpg" },
    { name: "Pasta", price: 10, image: "https://i.imgur.com/MABUbpDl.jpg" },
    { name: "Salad", price: 7, image: "https://i.imgur.com/DupGBz5.jpg" },
  ]);
  res.send("✅ Food items seeded successfully!");
});

// ✅ Get all food items
app.get("/api/food", async (req, res) => {
  const food = await FoodItem.find();
  res.json(food);
});

// ✅ Submit order
app.post("/api/order", async (req, res) => {
  const orderData = req.body;
  if (!orderData.items || orderData.items.length === 0) {
    return res.status(400).json({ error: "Order must include items" });
  }

  const newOrder = new Order({ items: orderData.items });
  await newOrder.save();
  res.json({ message: "✅ Order placed successfully!", orderId: newOrder._id });
});

// ✅ Get all saved orders
app.get("/api/orders", async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("items.foodId");
  res.json(orders);
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
