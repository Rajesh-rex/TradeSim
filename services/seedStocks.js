
const Stock = require("../models/Stock");

const stocks = [
    {
        symbol: "RELIANCE",
        companyName: "Reliance Industries",
        currentPrice: 1450,
        previousPrice: 1450
    },
    {
        symbol: "TCS",
        companyName: "Tata Consultancy Services",
        currentPrice: 3200,
        previousPrice: 3200
    },
    {
        symbol: "INFY",
        companyName: "Infosys",
        currentPrice: 1800,
        previousPrice: 1800
    },
    {
        symbol: "HDFCBANK",
        companyName: "HDFC Bank",
        currentPrice: 1700,
        previousPrice: 1700
    },
    {
        symbol: "TATAMOTORS",
        companyName: "Tata Motors",
        currentPrice: 700,
        previousPrice: 700
    }
];

async function seedStocks() {
    for (const stock of stocks) {
        await Stock.updateOne(
            { symbol: stock.symbol },
            { $setOnInsert: stock },
            { upsert: true }
        );
    }

    console.log("Stock seed completed successfully!");
}

module.exports = seedStocks;
