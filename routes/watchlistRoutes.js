
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
    getWatchlist,
    addToWatchlist
} = require("../controllers/WatchlistController");

const router = express.Router();

router.get("/", authMiddleware, getWatchlist);
router.post("/", authMiddleware, addToWatchlist);

module.exports = router;
