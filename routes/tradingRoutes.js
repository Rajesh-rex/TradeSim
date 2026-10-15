
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
    buyStock,
    sellStock
} = require("../controllers/tradingController");

const router = express.Router();

router.post("/buy", authMiddleware, buyStock);
router.post("/sell", authMiddleware, sellStock);

module.exports = router;
