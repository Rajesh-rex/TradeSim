
const Transaction = require("../models/Transaction");

async function getTransactionHistory(req, res) {
    try {
        const transactions = await Transaction.find({
            userId: req.userId
        }).sort({ createdAt: -1 });

        res.json({ transactions });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch transaction history.",
            error: error.message
        });
    }
}

module.exports = { getTransactionHistory };
