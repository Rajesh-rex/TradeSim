
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getAccount } = require("../controllers/accountController");

const router = express.Router();

router.get("/", authMiddleware, getAccount);

module.exports = router;
