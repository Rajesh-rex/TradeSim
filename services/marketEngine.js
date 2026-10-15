
const Stock = require("../models/Stock");

async function updateStockPrices() {
    const stocks = await Stock.find();

    for (const stock of stocks) {
        stock.previousPrice = stock.currentPrice;

        // Simulate a random price movement between -2% and +2%
        const change = (Math.random() * 0.04) - 0.02;

        stock.currentPrice = Math.max(
            0.01,
            Number((stock.currentPrice * (1 + change)).toFixed(2))
        );

        await stock.save();
    }

    console.log("Simulated stock prices updated!");
}

module.exports = updateStockPrices;
