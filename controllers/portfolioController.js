
const Portfolio = require("../models/Portfolio");
const Stock = require("../models/Stock");

async function getPortfolio(req, res) {
    try {
        const holdings = await Portfolio.find({
            userId: req.userId
        });

        const portfolio = await Promise.all(
            holdings.map(async (holding) => {
                const stock = await Stock.findById(holding.stockId);

                if (!stock) return null;

                const currentValue =
                    stock.currentPrice * holding.quantity;

                const investedValue =
                    holding.averagePrice * holding.quantity;

                return {
                    symbol: holding.symbol,
                    quantity: holding.quantity,
                    averagePrice: holding.averagePrice,
                    currentPrice: stock.currentPrice,
                    investedValue: Number(investedValue.toFixed(2)),
                    currentValue: Number(currentValue.toFixed(2)),
                    profitLoss: Number(
                        (currentValue - investedValue).toFixed(2)
                    )
                };
            })
        );

        res.json({
            portfolio: portfolio.filter(Boolean)
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch portfolio.",
            error: error.message
        });
    }
}

module.exports = { getPortfolio };
