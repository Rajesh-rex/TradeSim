const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const router = express.Router();

router.get("/check", (req, res) => {
    res.send("Auth routes are working!");
});

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;