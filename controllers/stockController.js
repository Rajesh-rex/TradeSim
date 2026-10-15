
const Stock = require("../models/Stock");

async function getStocks(req, res) {
    try {
        const stocks = await Stock.find().select(
            "symbol companyName currentPrice previousPrice"
        );

        res.json({ stocks });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch stocks.",
            error: error.message
        });
    }
}

module.exports = { getStocks };
