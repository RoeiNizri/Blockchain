import React from 'react';

const walletIcons = {
    USDT: '💵',
    BTC: '₿',
    ETH: 'Ξ',
    // Add more symbols as needed
};

const Wallet = ({ wallet, resetWallet }) => {
    return (
        <div className="wallet-container">
            <h2>Wallet Balance</h2>
            <ul className="wallet-list">
                {Object.keys(wallet).map(key => (
                    <li key={key} className="wallet-item">
                        <span className="wallet-icon">{walletIcons[key] || '💰'}</span>
                        <span className="wallet-amount">
                            {key}: {key === 'USDT' ? `$${wallet[key].toLocaleString()}` : `${wallet[key]} ${key}`}
                        </span>
                    </li>
                ))}
            </ul>
            <button onClick={resetWallet} className="reset-button">Reset Wallet</button>
        </div>
    );
};

export default Wallet;
