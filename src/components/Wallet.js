import React from 'react';

const walletIcons = {
    USDT: '💵',
    BTC: '₿',
    ETH: 'Ξ',
    // Add more symbols as needed
};

const Wallet = ({ wallet, resetWallet, totalBalance }) => {
    return (
        <div className="wallet-container">
            <h2>Wallet Balance</h2>
            <ul className="wallet-list">
                {Object.keys(wallet).map(key => (
                    <li key={key} className="wallet-item">
                        <span className="wallet-icon">{walletIcons[key] || '💰'}</span>
                        <span className="wallet-amount">
                            {key}: {key === 'USDT' ? `$${wallet[key].toString()}` : `${wallet[key]} ${key}`}
                        </span>
                    </li>
                ))}
            </ul>
            <h3>Total Balance: ${totalBalance.toFixed(2)}</h3> {/* Added total balance display */}
            <button onClick={resetWallet} className="reset-button">Reset Wallet</button>
        </div>
    );
};

export default Wallet;