
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        stockId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stock",
            required: true
        },
        symbol: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["BUY", "SELL"],
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0.01
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0.01
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
