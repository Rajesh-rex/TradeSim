
const Watchlist = require("../models/Watchlist");
const Stock = require("../models/Stock");

async function getWatchlist(req, res) {
    try {
        const items = await Watchlist.find({ userId: req.userId });

        const watchlist = await Promise.all(
            items.map(async (item) => {
                const stock = await Stock.findById(item.stockId);

                if (!stock) return null;

                return {
                    symbol: stock.symbol,
                    companyName: stock.companyName,
                    currentPrice: stock.currentPrice,
                    previousPrice: stock.previousPrice
                };
            })
        );

        res.json({ watchlist: watchlist.filter(Boolean) });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch watchlist.",
            error: error.message
        });
    }
}

async function addToWatchlist(req, res) {
    try {
        const symbol = req.body.symbol?.toUpperCase();

        if (!symbol) {
            return res.status(400).json({
                message: "Stock symbol is required."
            });
        }

        const stock = await Stock.findOne({ symbol });

        if (!stock) {
            return res.status(404).json({
                message: "Stock not found."
            });
        }

        const existing = await Watchlist.findOne({
            userId: req.userId,
            stockId: stock._id
        });

        if (existing) {
            return res.status(409).json({
                message: "Stock is already in your watchlist."
            });
        }

        await Watchlist.create({
            userId: req.userId,
            stockId: stock._id,
            symbol: stock.symbol
        });

        res.status(201).json({
            message: "Stock added to watchlist.",
            symbol: stock.symbol
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add stock to watchlist.",
            error: error.message
        });
    }
}

module.exports = { getWatchlist, addToWatchlist };
