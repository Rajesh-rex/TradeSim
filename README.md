# TradeSim — Paper Trading Simulator

A web-based paper trading simulator built with Node.js and Express.js that allows users to practice stock trading using virtual money, track their portfolios, and monitor simulated market movements without risking real capital.

## Features

- **User Authentication** — Register and log in securely with password hashing.
- **Virtual Balance** — Start with ₹1,00,000 in virtual funds.
- **Simulated Market** — View stock prices that update periodically.
- **Buy & Sell Stocks** — Execute simulated trades with input validation and balance checks.
- **Portfolio Management** — Track holdings, average purchase prices, and profit or loss.
- **Transaction History** — Review previous buy and sell transactions.
- **Watchlist** — Keep track of selected stocks.
- **Interactive Charts** — Visualize stock prices and portfolio performance.
- **User Data Isolation** — Keep account data separate between authenticated users.
- **Dark Dashboard** — A clean interface for monitoring trading activity.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend web framework |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| HTML, CSS & JavaScript | Frontend |
| Chart.js | Interactive charts |
| bcrypt | Password hashing |
| JWT | Authentication tokens |

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB Atlas account or another compatible MongoDB deployment
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Rajesh-rex/TradeSim.git
cd TradeSim
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add the environment variables required by your application.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
PORT=3000
```

Use the exact variable names expected by your application. Never commit your `.env` file or expose database credentials and secret keys.

### 4. Start the application

For development:

```bash
npm run dev
```

For normal startup:

```bash
npm start
```

Open `http://localhost:3000` in your browser.

## How It Works

1. Create an account and log in.
2. Explore the available stocks and their simulated prices.
3. Buy or sell shares using virtual funds.
4. Monitor holdings, available balance, and profit or loss.
5. Review transaction history and track stocks using the watchlist.
6. Use the charts to observe price and portfolio movements.

## Project Structure

```text
TradeSim/
├── controllers/       # Request handling and business logic
├── middleware/        # Authentication middleware
├── models/            # MongoDB data models
├── routes/            # API routes
├── services/          # Market simulation and stock seeding
├── public/            # Frontend files
│   ├── index.html
│   └── script.js
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

## Security

- Passwords are hashed before storage.
- Protected API routes require authentication.
- User-specific data is isolated by account.
- Environment variables are used for sensitive configuration.
- Database network access should be restricted to trusted IP addresses or approved hosting infrastructure.

## Important Disclaimer

TradeSim is an educational project for learning and practicing stock trading. It uses simulated prices and virtual money. It does not execute real trades, provide investment advice, or guarantee that simulated prices reflect actual market prices.

## Future Improvements

- Deploy the application for public access.
- Add automated tests for authentication and trading operations.
- Improve trade consistency and error handling.
- Add performance metrics and additional portfolio analytics.
- Enhance responsive design and accessibility.

## Author

**Rajeshwar Reddy**

GitHub: [@Rajesh-rex](https://github.com/Rajesh-rex)

---

*Built as a hands-on project to explore backend development, authentication, database integration, and interactive web applications.*