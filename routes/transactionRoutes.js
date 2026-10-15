
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
    getTransactionHistory
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/", authMiddleware, getTransactionHistory);

module.exports = router;
