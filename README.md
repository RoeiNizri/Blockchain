# BTS - Demo Crypto Trading System

**Project Description:**

The BTS (Blockchain Trading System) - Demo Crypto Trading System is a web-based application designed to simulate cryptocurrency trading. It aims to provide an accessible platform for newcomers to experience and understand cryptocurrency trading while allowing experienced traders to improve their strategies, conduct tests, and experiment with trading programs in a risk-free environment.

**Features:**

- **Graph Display:** The system integrates TradingView to display real-time price charts for selected cryptocurrencies, specifically BTC/USDT, ETH/USDT, SOL/USDT, BNB/USDT, and PEPE/USDT.
- **Trade Execution:** Users can execute buy and sell orders (Market & Limit). All transactions are saved on the client side using IndexedDB.
- **Portfolio Management:** Each user has a virtual wallet containing 1 million USDT for trading.
- **Transaction History:** The system records all approved and pending transactions, with approved transactions marked in green and pending transactions in red.
- **AI Chat Assistance:** A new AI-powered chat feature allows users to ask questions and receive real-time assistance regarding cryptocurrency trading, market trends, and system functionalities.
- **Responsiveness:** The project is fully responsive and compatible with various devices, including smartphones and tablets.

**Getting Started:**

To run this project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RoeiNizri/Blockchain.git
   cd Blockchain
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm start
   ```

4. **Visit the application:**
   Open your web browser and go to `http://localhost:3000` to see the application in action.

**Deployment:**

The project is deployed and can be accessed at [BTS - Demo Crypto Trading System](https://roeinizri.com/BTS/)

**Project Structure:**

```
- public/
- src/
  - components/
  - services/
  - styles/
  - App.js
  - index.js
- .gitignore
- package.json
- README.md
```

**Technologies Used:**

- **React.js** for building the user interface
- **TradingView** for displaying cryptocurrency charts
- **IndexedDB** for client-side storage
- **Node.js** and **npm** for managing dependencies

**Contributing:**

Feel free to fork this repository and make your contributions. You can submit pull requests, and they will be reviewed promptly.

**License:**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Contact:**

For any questions or feedback, please contact Roei Nizri at [roeinizri1@gmail.com](mailto:roeinizri1@gmail.com).
