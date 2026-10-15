
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const seedStocks = require("./services/seedStocks");
const updateStockPrices = require("./services/marketEngine");
const tradingRoutes = require("./routes/tradingRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const accountRoutes = require("./routes/accountRoutes");
const watchlistRoutes = require("./routes/WatchlistRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const stockRoutes = require("./routes/stockRoutes");
const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/trading", tradingRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/stocks", stockRoutes);


// Test routes


app.get("/debug", (req, res) => {
    res.send("Correct TradeSim server is running");
});

// Frontend files
app.use(express.static("public"));

// Connect to MongoDB, seed stocks, and start server
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log("MongoDB connected successfully!");
setInterval(() => {
    updateStockPrices().catch((error) => {
        console.error("Market update failed:", error.message);
    });
}, 10000);
        await seedStocks();

        app.listen(PORT, () => {
            console.log(`TradeSim server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Startup failed:", error.message);
        process.exitCode = 1;
    });
