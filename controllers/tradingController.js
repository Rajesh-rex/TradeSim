
const User = require("../models/User");
const Stock = require("../models/Stock");
const Portfolio = require("../models/Portfolio");
const Transaction = require("../models/Transaction");
async function buyStock(req, res) {
    try {
        const { symbol, quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive whole number."
            });
        }

        const stock = await Stock.findOne({
            symbol: symbol?.toUpperCase()
        });

        if (!stock) {
            return res.status(404).json({
                message: "Stock not found."
            });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const totalCost = stock.currentPrice * quantity;

        if (user.balance < totalCost) {
            return res.status(400).json({
                message: "Insufficient virtual balance."
            });
        }

        let holding = await Portfolio.findOne({
            userId: user._id,
            stockId: stock._id
        });

        if (holding) {
            const newQuantity = holding.quantity + quantity;
            holding.averagePrice =
                ((holding.quantity * holding.averagePrice) + totalCost) /
                newQuantity;
            holding.quantity = newQuantity;
        } else {
            holding = new Portfolio({
                userId: user._id,
                stockId: stock._id,
                symbol: stock.symbol,
                quantity,
                averagePrice: stock.currentPrice
            });
        }

        user.balance -= totalCost;

        await holding.save();
        await user.save();
        


        
await Transaction.create({
    userId: req.userId,
    stockId: stock._id,
    symbol: stock.symbol,
    type: "BUY",
    quantity: quantity,
    price: stock.currentPrice,
    totalAmount: Number(
        (stock.currentPrice * quantity).toFixed(2)
    )
});


        res.json({
            message: "Stock purchased successfully!",
            symbol: stock.symbol,
            quantity,
            price: stock.currentPrice,
            totalCost,
            remainingBalance: user.balance
        });
    } catch (error) {
        res.status(500).json({
            message: "Purchase failed.",
            error: error.message
        });
    }
}


async function sellStock(req, res) {
    try {
        const { symbol, quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive whole number."
            });
        }

        const stock = await Stock.findOne({
            symbol: symbol?.toUpperCase()
        });

        if (!stock) {
            return res.status(404).json({
                message: "Stock not found."
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const holding = await Portfolio.findOne({
            userId: user._id,
            stockId: stock._id
        });

        if (!holding || holding.quantity < quantity) {
            return res.status(400).json({
                message: "You don't own enough shares to sell."
            });
        }

        const totalValue = stock.currentPrice * quantity;

        holding.quantity -= quantity;
        user.balance += totalValue;

        if (holding.quantity === 0) {
            await holding.deleteOne();
        } else {
            await holding.save();
        }

        await user.save();
        
await Transaction.create({
    userId: req.userId,
    stockId: stock._id,
    symbol: stock.symbol,
    type: "SELL",
    quantity: quantity,
    price: stock.currentPrice,
    totalAmount: Number(
        (stock.currentPrice * quantity).toFixed(2)
    )
});


        res.json({
            message: "Stock sold successfully!",
            symbol: stock.symbol,
            quantity,
            price: stock.currentPrice,
            totalValue,
            remainingBalance: user.balance
        });
    } catch (error) {
        res.status(500).json({
            message: "Sale failed.",
            error: error.message
        });
    }
}

module.exports = { buyStock, sellStock };
