let token = sessionStorage.getItem("token");
let stockChartTimer = null;
let portfolioChartTimer = null;
const stockTable = document.getElementById("stockTable");
const statusText = document.getElementById("status");

async function loadStocks() {
    try {
        const response = await fetch("/api/stocks");

        if (!response.ok) {
            throw new Error("Failed to fetch stock data");
        }

        const data = await response.json();

        stockTable.innerHTML = "";

        data.stocks.forEach((stock) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><strong>${stock.symbol}</strong></td>
                <td>${stock.companyName}</td>
                <td>₹${Number(stock.currentPrice).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}</td>
                <td>₹${Number(stock.previousPrice).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}</td>
            `;

            stockTable.appendChild(row);
        });

        statusText.textContent = "Market data loaded successfully.";
    } catch (error) {
        statusText.textContent = "Unable to load market data.";
        console.error(error);
    }
}

loadStocks();

// Refresh prices every 10 seconds
setInterval(loadStocks, 10000);


const authForm = document.getElementById("authForm");
const registerButton = document.getElementById("registerButton");
const authMessage = document.getElementById("authMessage");

let authMode = "login";

registerButton.addEventListener("click", async () => {
    authMode = "register";

    const username = prompt("Choose a username:");

    if (!username || !username.trim()) {
        authMessage.textContent = "Username is required.";
        return;
    }

    await submitAuth("register", username.trim());
});

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitAuth(authMode);
});

async function submitAuth(mode, username = "") {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`/api/auth/${mode}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...(mode === "register" ? { username } : {}),
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Authentication failed.");
        }

        if (mode === "register") {
            authMessage.textContent =
                "Account created. Now log in with your details.";
            authMode = "login";
            return;
        }

        if (!data.token) {
            throw new Error("Login succeeded, but no token was returned.");
        }

        token = data.token;
        sessionStorage.setItem("token", token);

        authMessage.textContent = "Login successful!";
        document.getElementById("authPanel").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("logoutButton").style.display = "inline-block";
        await loadStocks();
        await loadAccount();
        await loadPortfolio();
        await loadTradeStockOptions();
        await loadTransactions();
        updatePortfolioChart();
        await loadWatchlistStockOptions();
        await loadWatchlist();
        await loadChartStockOptions();
        startChartTimers();
    } catch (error) {
        authMessage.textContent = error.message;
    }
}

async function loadAccount() {
    if (!token) return;

    try {
        const response = await fetch("/api/account", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Could not load account balance.");
        }

        const data = await response.json();

        document.getElementById("balance").textContent =
            `₹${Number(data.virtualBalance).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
    } catch (error) {
        console.error("Account error:", error.message);
    }
}

async function loadPortfolio() {
    if (!token) return;

    const portfolioTable = document.getElementById("portfolioTable");

    try {
        const response = await fetch("/api/portfolio", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Could not load portfolio.");
        }

        const data = await response.json();
        const holdings = data.portfolio || [];

        portfolioTable.innerHTML = "";

        let totalValue = 0;
        let totalProfitLoss = 0;

        if (holdings.length === 0) {
            portfolioTable.innerHTML = `
                <tr>
                    <td colspan="5">No stocks in your portfolio yet.</td>
                </tr>
            `;
        }

        holdings.forEach((holding) => {
            totalValue += holding.currentValue;
            totalProfitLoss += holding.profitLoss;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${holding.symbol}</td>
                <td>${holding.quantity}</td>
                <td>₹${Number(holding.averagePrice).toLocaleString("en-IN")}</td>
                <td>₹${Number(holding.currentValue).toLocaleString("en-IN")}</td>
                <td style="color: ${holding.profitLoss >= 0 ? '#4ade80' : '#f87171'}">
                    ₹${Number(holding.profitLoss).toLocaleString("en-IN")}
                </td>
            `;

            portfolioTable.appendChild(row);
        });

        document.getElementById("portfolioValue").textContent =
            `₹${totalValue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        const profitLossElement = document.getElementById("profitLoss");

        profitLossElement.textContent =
            `${totalProfitLoss >= 0 ? "+" : "-"}₹${Math.abs(totalProfitLoss).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        profitLossElement.style.color =
            totalProfitLoss >= 0 ? "#4ade80" : "#f87171";

    } catch (error) {
        console.error("Portfolio error:", error.message);
    }
}


const tradeForm = document.getElementById("tradeForm");
const tradeSymbol = document.getElementById("tradeSymbol");
const tradeQuantity = document.getElementById("tradeQuantity");
const tradeMessage = document.getElementById("tradeMessage");
let isTrading = false;
async function loadTradeStockOptions() {
    try {
        const response = await fetch("/api/stocks");
        if (!response.ok) throw new Error("Could not load stocks.");

        const data = await response.json();
        const selectedSymbol = tradeSymbol.value;

        tradeSymbol.innerHTML = "";

        data.stocks.forEach((stock) => {
            const option = document.createElement("option");
            option.value = stock.symbol;
            option.textContent = `${stock.symbol} — ₹${stock.currentPrice}`;
            tradeSymbol.appendChild(option);
        });

        if (data.stocks.some(stock => stock.symbol === selectedSymbol)) {
            tradeSymbol.value = selectedSymbol;
        }
    } catch (error) {
        tradeMessage.textContent = error.message;
    }
}

async function executeTrade(type) {
    if (isTrading) return;
    if (!token) {
        tradeMessage.textContent = "Please log in first.";
        return;
    }

    const quantity = Number(tradeQuantity.value);

    if (!Number.isInteger(quantity) || quantity < 1) {
        tradeMessage.textContent = "Enter a valid whole-number quantity.";
        return;
    }

   

isTrading = true;

const buyButton = document.getElementById("buyButton");
const sellButton = document.getElementById("sellButton");

buyButton.disabled = true;
sellButton.disabled = true;
buyButton.textContent = "Processing...";
sellButton.textContent = "Processing...";

    try {
        const response = await fetch(`/api/trading/${type}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                symbol: tradeSymbol.value,
                quantity
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Trade failed.");
        }

        tradeMessage.textContent =
            `${data.message || "Trade successful!"} ` +
            `Remaining balance: ₹${Number(
                data.remainingBalance
            ).toLocaleString("en-IN")}`;

        await loadAccount();
        await loadPortfolio();
        await loadTransactions();
        await updatePortfolioChart();
    } catch (error) {
        tradeMessage.textContent = error.message;
    }
    finally {
    isTrading = false;
    buyButton.disabled = false;
    sellButton.disabled = false;
    buyButton.textContent = "Buy";
    sellButton.textContent = "Sell";
}
}


tradeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    executeTrade("buy");
});

document.getElementById("sellButton").addEventListener("click", () => {
    executeTrade("sell");
});

async function loadTransactions() {
    if (!token) return;

    const transactionTable = document.getElementById("transactionTable");

    try {
        const response = await fetch("/api/transactions", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Could not load transaction history.");
        }

        const data = await response.json();
        const transactions = data.transactions || [];

        transactionTable.innerHTML = "";

        if (transactions.length === 0) {
            transactionTable.innerHTML = `
                <tr>
                    <td colspan="6">No transactions yet.</td>
                </tr>
            `;
            return;
        }

        transactions.forEach((transaction) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${transaction.symbol}</td>
                <td style="color:${transaction.type === "BUY" ? "#4ade80" : "#f87171"}">
                    ${transaction.type}
                </td>
                <td>${transaction.quantity}</td>
                <td>₹${Number(transaction.price).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}</td>
                <td>₹${Number(transaction.totalAmount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}</td>
                <td>${new Date(transaction.createdAt).toLocaleString("en-IN")}</td>
            `;

            transactionTable.appendChild(row);
        });

    } catch (error) {
        console.error("Transaction history error:", error);
        transactionTable.innerHTML = `
            <tr><td colspan="6">Unable to load transactions.</td></tr>
        `;
    }
}

const watchlistSymbol = document.getElementById("watchlistSymbol");
const watchlistTable = document.getElementById("watchlistTable");
const watchlistMessage = document.getElementById("watchlistMessage");

async function loadWatchlistStockOptions() {
    try {
        const response = await fetch("/api/stocks");
        if (!response.ok) throw new Error("Could not load stocks.");

        const data = await response.json();
        watchlistSymbol.innerHTML = "";

        data.stocks.forEach((stock) => {
            const option = document.createElement("option");
            option.value = stock.symbol;
            option.textContent = `${stock.symbol} — ${stock.companyName}`;
            watchlistSymbol.appendChild(option);
        });
    } catch (error) {
        watchlistMessage.textContent = error.message;
    }
}

async function loadWatchlist() {
    if (!token) return;

    try {
        const response = await fetch("/api/watchlist", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Could not load watchlist.");

        const data = await response.json();
        const items = data.watchlist || [];

        watchlistTable.innerHTML = "";

        if (items.length === 0) {
            watchlistTable.innerHTML =
                '<tr><td colspan="3">Your watchlist is empty.</td></tr>';
            return;
        }

        const stocksResponse = await fetch("/api/stocks");
        const stocksData = await stocksResponse.json();

        items.forEach((item) => {
            const stock = stocksData.stocks.find(
                (entry) => entry.symbol === item.symbol
            );

            const row = document.createElement("tr");
            const symbolCell = document.createElement("td");
            const companyCell = document.createElement("td");
            const priceCell = document.createElement("td");

            symbolCell.textContent = item.symbol;
            companyCell.textContent = stock ? stock.companyName : "—";
            priceCell.textContent = stock
                ? `₹${Number(stock.currentPrice).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`
                : "—";

            row.append(symbolCell, companyCell, priceCell);
            watchlistTable.appendChild(row);
        });
    } catch (error) {
        console.error("Watchlist error:", error);
        watchlistMessage.textContent = error.message;
    }
}

document.getElementById("addWatchlistButton").addEventListener("click", async () => {
    if (!token) {
        watchlistMessage.textContent = "Please log in first.";
        return;
    }

    try {
        const response = await fetch("/api/watchlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                symbol: watchlistSymbol.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not add stock.");
        }

        watchlistMessage.textContent = data.message || "Stock added to watchlist.";
        await loadWatchlist();
    } catch (error) {
        watchlistMessage.textContent = error.message;
    }
});


const chartSymbol = document.getElementById("chartSymbol");
const chartMessage = document.getElementById("chartMessage");

let stockChart = null;
let chartHistory = [];

async function loadChartStockOptions() {
    try {
        const response = await fetch("/api/stocks");
        if (!response.ok) throw new Error("Could not load stocks.");

        const data = await response.json();
        const previousSelection = chartSymbol.value;

        chartSymbol.innerHTML = "";

        data.stocks.forEach((stock) => {
            const option = document.createElement("option");
            option.value = stock.symbol;
            option.textContent = stock.symbol;
            chartSymbol.appendChild(option);
        });

        if (data.stocks.some(stock => stock.symbol === previousSelection)) {
            chartSymbol.value = previousSelection;
        }

        await updateStockChart();
    } catch (error) {
        chartMessage.textContent = error.message;
    }
}

async function updateStockChart() {
    try {
        const response = await fetch("/api/stocks");
        if (!response.ok) throw new Error("Could not fetch stock prices.");

        const data = await response.json();
        const stock = data.stocks.find(
            item => item.symbol === chartSymbol.value
        );

        if (!stock) return;

        chartHistory.push({
            time: new Date().toLocaleTimeString("en-IN"),
            price: Number(stock.currentPrice)
        });

        // Keep the latest 20 observations.
        chartHistory = chartHistory.slice(-20);

        const context = document.getElementById("stockChart").getContext("2d");

        if (!stockChart) {
            stockChart = new Chart(context, {
                type: "line",
                data: {
                    labels: chartHistory.map(point => point.time),
                    datasets: [{
                        label: `${stock.symbol} simulated price (₹)`,
                        data: chartHistory.map(point => point.price),
                        borderColor: "#38bdf8",
                        backgroundColor: "rgba(56, 189, 248, 0.12)",
                        fill: true,
                        tension: 0.25
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    scales: {
                        y: {
                            ticks: {
                                color: "#cbd5e1"
                            }
                        },
                        x: {
                            ticks: {
                                color: "#cbd5e1",
                                maxTicksLimit: 8
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: "#e2e8f0"
                            }
                        }
                    }
                }
            });
        } else {
            stockChart.data.labels = chartHistory.map(point => point.time);
            stockChart.data.datasets[0].label =
                `${stock.symbol} simulated price (₹)`;
            stockChart.data.datasets[0].data =
                chartHistory.map(point => point.price);
            stockChart.update();
        }

        chartMessage.textContent =
            `${stock.symbol}: ₹${stock.currentPrice} — simulated prices update every 10 seconds.`;
    } catch (error) {
        chartMessage.textContent = error.message;
    }
}

chartSymbol.addEventListener("change", () => {
    chartHistory = [];
    updateStockChart();
});

const portfolioChartMessage = document.getElementById("portfolioChartMessage");

let portfolioChart = null;
let portfolioHistory = [];

async function updatePortfolioChart() {
    if (!token) return;

    try {
        const response = await fetch("/api/portfolio", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Could not load portfolio performance.");
        }

        const data = await response.json();
        const holdings = data.portfolio || [];

        const totalValue = holdings.reduce(
            (total, holding) => total + Number(holding.currentValue || 0),
            0
        );

        portfolioHistory.push({
            time: new Date().toLocaleTimeString("en-IN"),
            value: Number(totalValue.toFixed(2))
        });

        portfolioHistory = portfolioHistory.slice(-20);

        const context = document
            .getElementById("portfolioChart")
            .getContext("2d");

        if (!portfolioChart) {
            portfolioChart = new Chart(context, {
                type: "line",
                data: {
                    labels: portfolioHistory.map(point => point.time),
                    datasets: [{
                        label: "Portfolio Value (₹)",
                        data: portfolioHistory.map(point => point.value),
                        borderColor: "#a78bfa",
                        backgroundColor: "rgba(167, 139, 250, 0.12)",
                        fill: true,
                        tension: 0.25
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    scales: {
                        x: {
                            ticks: {
                                color: "#cbd5e1",
                                maxTicksLimit: 8
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: "#cbd5e1",
                                callback: value =>
                                    "₹" + Number(value).toLocaleString("en-IN")
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: "#e2e8f0"
                            }
                        }
                    }
                }
            });
        } else {
            portfolioChart.data.labels =
                portfolioHistory.map(point => point.time);
            portfolioChart.data.datasets[0].data =
                portfolioHistory.map(point => point.value);
            portfolioChart.update();
        }

        portfolioChartMessage.textContent =
            `Current portfolio value: ₹${totalValue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
    } catch (error) {
        console.error("Portfolio chart error:", error);
        portfolioChartMessage.textContent = error.message;
    }
}

const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("token");
    token = null;
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("authPanel").style.display = "block";
    logoutButton.style.display = "none";

    document.getElementById("authForm").reset();
    authMessage.textContent = "You have been logged out.";

    document.getElementById("balance").textContent = "₹0";
    document.getElementById("portfolioValue").textContent = "₹0";
    document.getElementById("profitLoss").textContent = "₹0";

    document.getElementById("portfolioTable").innerHTML = "";
    document.getElementById("transactionTable").innerHTML = "";
    document.getElementById("watchlistTable").innerHTML = "";

    tradeMessage.textContent = "";
    watchlistMessage.textContent = "";
});
function startChartTimers() {
    if (stockChartTimer === null) {
        stockChartTimer = setInterval(updateStockChart, 10000);
    }

    if (portfolioChartTimer === null) {
        portfolioChartTimer = setInterval(updatePortfolioChart, 10000);
    }
}
async function restoreSession() {
    if (!token) {
        document.getElementById("authPanel").style.display = "block";
        document.getElementById("dashboard").style.display = "none";
        return;
    }

    try {
        const response = await fetch("/api/protected-test", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Session expired");
        }

        document.getElementById("authPanel").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("logoutButton").style.display = "inline-block";

        await loadStocks();
        await loadAccount();
        await loadPortfolio();
        await loadTradeStockOptions();
        await loadTransactions();
        await loadWatchlistStockOptions();
        await loadWatchlist();
        await loadChartStockOptions();
        await updatePortfolioChart();
        startChartTimers();

    } catch (error) {
        sessionStorage.removeItem("token");
        token = null;

        document.getElementById("authPanel").style.display = "block";
        document.getElementById("dashboard").style.display = "none";
        document.getElementById("logoutButton").style.display = "none";
    }
}

restoreSession();