
const User = require("../models/User");

async function getAccount(req, res) {
    try {
        const user = await User.findById(req.userId).select(
            "username email balance"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json({
            username: user.username,
            email: user.email,
            virtualBalance: user.balance
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch account details.",
            error: error.message
        });
    }
}

module.exports = { getAccount };
