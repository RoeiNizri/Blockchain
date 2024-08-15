import React, { useState, useEffect, useCallback } from 'react';
import TradingChart from './components/TradingChart';
import OrderBook from './components/OrderBook';
import Wallet from './components/Wallet';
import { getCryptoPrice, getCryptoData } from './services/cryptoService';
import { connectWebSocket } from './services/webSocketService';
import { saveOrder, getOrders, deleteAllOrders, saveWallet, getWallet, deleteWallet } from './services/indexedDBService';
import './App.css';

const App = () => {
    const [wallet, setWallet] = useState({ USDT: 1000000, BTC: 0, ETH: 0 });
    const [orders, setOrders] = useState([]);
    const [price, setPrice] = useState({ BTC: 0, ETH: 0 });
    const [limitPrice, setLimitPrice] = useState({ BTC: 0, ETH: 0 });
    const [amount, setAmount] = useState(0);
    const [orderType, setOrderType] = useState('market');
    const [selectedSymbol, setSelectedSymbol] = useState('BTC');
    const [recommendation, setRecommendation] = useState('');
    const [totalBalance, setTotalBalance] = useState(0);
    const [showOrderPopup, setShowOrderPopup] = useState(false);
    const [orderMessage, setOrderMessage] = useState('');

    const calculateTotalBalance = useCallback(() => {
        const btcValueInUSDT = (wallet.BTC || 0) * (price.BTC || 0);
        const ethValueInUSDT = (wallet.ETH || 0) * (price.ETH || 0);
        const total = (wallet.USDT || 0) + btcValueInUSDT + ethValueInUSDT;
        setTotalBalance(total);
    }, [wallet, price]);

    useEffect(() => {
        const loadWallet = async () => {
            const savedWallet = await getWallet();
            if (!savedWallet || Object.keys(savedWallet).every(key => savedWallet[key] === 0)) {
                setWallet(currentWallet => {
                    saveWallet(currentWallet);
                    return currentWallet;
                });
            } else {
                setWallet(savedWallet);
            }
        };
        loadWallet();
    }, []);

    useEffect(() => {
        const saveWalletData = async () => {
            await saveWallet(wallet);
        };
        saveWalletData();
    }, [wallet]);

    useEffect(() => {
        const loadOrders = async () => {
            const savedOrders = await getOrders();
            setOrders(savedOrders);
        };
        loadOrders();
    }, []);

    useEffect(() => {
        if (price.BTC !== 0 && price.ETH !== 0) {
            calculateTotalBalance();
        }
    }, [wallet, price, calculateTotalBalance]);

    useEffect(() => {
        const saveOrders = async () => {
            await deleteAllOrders();
            for (const order of orders) {
                await saveOrder(order);
            }
        };
        saveOrders();
    }, [orders]);

    const analyzeCryptoData = (data) => {
        const volumeMultiplier = data.total_volume / data.prev_24h_volume;
        const shortTermMA = data.short_term_moving_average;
        const longTermMA = data.long_term_moving_average;
        const rsi = data.relative_strength_index;
        const macd = data.macd;
        const signalLine = data.signal_line;
        
        // Ensure bollinger_bands is defined and has the necessary elements
        const bollingerBands = Array.isArray(data.bollinger_bands) && data.bollinger_bands.length === 3 
            ? data.bollinger_bands 
            : [0, 0, 0]; // Default to [0, 0, 0] if not defined or insufficient length
    
        const stochasticK = data.stochastic_k;
        const stochasticD = data.stochastic_d;
    
        const reasons = [];
    
        const pastVolumes = Array.isArray(data.past_volumes) ? data.past_volumes : [];
    
        const highBuyVolumeStreak = pastVolumes.reduce((streak, volume) => {
            console.log(`Buy Volume: ${volume.buyVolume}, Streak: ${streak}`);
            return volume.buyVolume >= 5000 ? streak + 1 : 0;
        }, 0);
    
        const highSellVolumeStreak = pastVolumes.reduce((streak, volume) => {
            console.log(`Sell Volume: ${volume.sellVolume}, Streak: ${streak}`);
            return volume.sellVolume >= 5000 ? streak + 1 : 0;
        }, 0);
    
        if (highBuyVolumeStreak >= 4 && rsi >= 70) {
            reasons.push('High buy volume for four consecutive days', 'RSI indicates overbought conditions');
            return `STRONG SELL - ${reasons.join(', ')}`;
        } 
        if (highSellVolumeStreak >= 4 && rsi <= 30) {
            reasons.push('High sell volume for four consecutive days', 'RSI indicates oversold conditions');
            return `STRONG BUY - ${reasons.join(', ')}`;
        }
    
        if (volumeMultiplier >= 5) reasons.push('High volume spike detected');
        if (shortTermMA > longTermMA) reasons.push('Golden Cross detected');
        else if (shortTermMA < longTermMA) reasons.push('Death Cross detected');
        if (rsi >= 70) reasons.push('RSI indicates overbought conditions');
        else if (rsi <= 30) reasons.push('RSI indicates oversold conditions');
        if (data.price_change_percentage_24h >= 5) reasons.push('Price increased by 5% or more in the last 24 hours');
        else if (data.price_change_percentage_24h <= -5) reasons.push('Price decreased by 5% or more in the last 24 hours');
        if (data.price > data.resistance_level) reasons.push('Price broke above resistance level');
        else if (data.price < data.support_level) reasons.push('Price dropped below support level');
    
        if (macd > signalLine) reasons.push('MACD is above the signal line (Bullish)');
        else if (macd < signalLine) reasons.push('MACD is below the signal line (Bearish)');
    
        if (data.price > bollingerBands[2]) reasons.push('Price is above upper Bollinger Band (Overbought)');
        else if (data.price < bollingerBands[0]) reasons.push('Price is below lower Bollinger Band (Oversold)');
    
        if (stochasticK > 80 && stochasticD > 80) reasons.push('Stochastic indicates overbought conditions');
        else if (stochasticK < 20 && stochasticD < 20) reasons.push('Stochastic indicates oversold conditions');
    
        if ((reasons.includes('Golden Cross detected') ||
             reasons.includes('Price increased by 5% or more in the last 24 hours') ||
             reasons.includes('High volume spike detected') ||
             reasons.includes('Price broke above resistance level') ||
             reasons.includes('MACD is above the signal line (Bullish)')) &&
            !reasons.includes('Price is above upper Bollinger Band (Overbought)')) {
            return `Be ready to SELL - ${reasons.join(', ')}`;
        } else if ((reasons.includes('Death Cross detected') ||
                    reasons.includes('Price decreased by 5% or more in the last 24 hours') ||
                    reasons.includes('RSI indicates oversold conditions') ||
                    reasons.includes('Price dropped below support level') ||
                    reasons.includes('MACD is below the signal line (Bearish)')) &&
                   !reasons.includes('Price is below lower Bollinger Band (Oversold)')) {
            return `Be ready to BUY - ${reasons.join(', ')}`;
        } else {
            return `HOLD - ${reasons.length > 0 ? reasons.join(', ') : 'No significant signals detected'}`;
        }
    };    
    

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
    
        const fetchInitialPrices = async () => {
            try {
                const prices = await getCryptoPrice(['bitcoin', 'ethereum'], ['usd'], signal);
                setPrice({
                    BTC: prices.bitcoin.usd,
                    ETH: prices.ethereum.usd
                });
    
                const cryptoData = await getCryptoData(selectedSymbol === 'BTC' ? 'bitcoin' : 'ethereum', signal);
                if (cryptoData && cryptoData[0]) {
                    setRecommendation(analyzeCryptoData(cryptoData[0]));
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching initial prices or recommendation data:', error);
                }
            }
        };
    
        fetchInitialPrices();
    
        return () => {
            controller.abort(); // Abort the request when the component unmounts or dependencies change
        };
    }, [selectedSymbol]);    

    const resetWallet = () => {
        const initialWallet = { USDT: 1000000, BTC: 0, ETH: 0 };
        setWallet(initialWallet);
        setOrders([]);
        deleteAllOrders();
        deleteWallet();
    };

    const checkLimitOrders = useCallback((currentPrices) => {
        let ordersChanged = false;
        const newWallet = { ...wallet };
        const updatedOrders = orders.map((order) => {
            if (order.orderType === 'limit' && order.status === 'PENDING') {
                const symbol = order.symbol.split('/')[0];
                const currentPrice = currentPrices[symbol];
                const total = order.price * order.amount;

                if (order.type === 'buy' && currentPrice <= order.price && newWallet.USDT >= total) {
                    newWallet.USDT -= total;
                    newWallet[symbol] += order.amount;
                    ordersChanged = true;
                    return { ...order, status: 'APPROVED' };
                } else if (order.type === 'sell' && currentPrice >= order.price && newWallet[symbol] >= order.amount) {
                    newWallet.USDT += total;
                    newWallet[symbol] -= order.amount;
                    ordersChanged = true;
                    return { ...order, status: 'APPROVED' };
                }
            }
            return order;
        });

        if (ordersChanged) {
            setWallet(newWallet);
            setOrders(updatedOrders);
        }
    }, [wallet, orders]);

    useEffect(() => {
        let socket;

        const connectSocket = () => {
            if (!socket || socket.readyState === WebSocket.CLOSED) {
                socket = connectWebSocket((data) => {
                    const symbolData = data[selectedSymbol];
                    if (symbolData) {
                        const currentPrice = parseFloat(symbolData.p).toFixed(2);
                        setPrice((prevPrice) => ({
                            ...prevPrice,
                            [selectedSymbol]: currentPrice
                        }));

                        checkLimitOrders({ [selectedSymbol]: parseFloat(currentPrice) });
                    }
                });
            }
        };

        connectSocket();

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [selectedSymbol, checkLimitOrders]);

    const handleOrder = (type) => {
        const orderPrice = parseFloat(orderType === 'market' ? price[selectedSymbol] : limitPrice[selectedSymbol] || 0);
        const total = orderPrice * amount;

        if (amount <= 0) {
            alert('Amount must be positive and greater than zero!');
            return;
        }

        if (orderPrice <= 0) {
            alert('Price must be positive and greater than zero!');
            return;
        }

        const newWallet = { ...wallet };
        const newOrder = {
            type,
            symbol: `${selectedSymbol}/USDT`,
            price: orderPrice,
            amount,
            time: new Date().toISOString(),
            orderType,
            status: 'PENDING'
        };

        if (orderType === 'market') {
            if (type === 'buy' && newWallet.USDT >= total) {
                newWallet.USDT -= total;
                newWallet[selectedSymbol] += amount;
                newOrder.status = 'APPROVED';
            } else if (type === 'sell' && newWallet[selectedSymbol] >= amount) {
                newWallet.USDT += total;
                newWallet[selectedSymbol] -= amount;
                newOrder.status = 'APPROVED';
            } else {
                alert('Insufficient funds!');
                return;
            }
        } else if (orderType === 'limit') {
            if ((type === 'buy' && newWallet.USDT < total) || (type === 'sell' && newWallet[selectedSymbol] < amount)) {
                alert('Insufficient funds for limit order!');
                return;
            }
        }

        setWallet(newWallet);
        setOrders([...orders, newOrder]);
        setOrderMessage(`Order ${newOrder.status} - ${type.toUpperCase()} ${newOrder.amount} ${newOrder.symbol} at ${newOrder.price} USDT`);
        setShowOrderPopup(true);

        setTimeout(() => {
            setShowOrderPopup(false);
        }, 3000);
    };

    return (
        <div className="App">
            <h1>Blockchain Trading System</h1>
            <div className="main-content">
                <Wallet wallet={wallet} resetWallet={resetWallet} totalBalance={totalBalance} />
                <div className="order-form">
                    <h2>Place Order</h2>
                    <label>
                        Order Type:
                        <select value={orderType} onChange={e => setOrderType(e.target.value)}>
                            <option value="market">Market</option>
                            <option value="limit">Limit</option>
                        </select>
                    </label>
                    <label>
                        Cryptocurrency:
                        <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)}>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                        </select>
                    </label>
                    <label>
                        Price:
                        <input
                            type="number"
                            value={orderType === 'market' ? price[selectedSymbol] : limitPrice[selectedSymbol] || price[selectedSymbol]}
                            onChange={e => {
                                if (orderType === 'limit') {
                                    setLimitPrice({ ...limitPrice, [selectedSymbol]: Number(e.target.value) });
                                }
                            }}
                            disabled={orderType === 'market'}
                        />
                    </label>
                    <label>
                        Amount:
                        <input
                            type="number"
                            value={amount === 0 ? '' : amount}
                            onChange={e => {
                                const value = e.target.value;
                                if (value === '') {
                                    setAmount('');
                                } else {
                                    const parsedValue = parseFloat(value);
                                    if (!isNaN(parsedValue) && parsedValue > 0) {
                                        setAmount(parsedValue);
                                    } else {
                                        setAmount(0);
                                    }
                                }
                            }}
                            placeholder="0.0"
                        />
                    </label>

                    <label>
                        Total:
                        <input
                            type="text"
                            value={(((limitPrice[selectedSymbol] || price[selectedSymbol]) || 0) * amount).toLocaleString()}
                            readOnly
                        />
                    </label>
                    <div className="order-buttons">
                        <button className="buy-button" onClick={() => handleOrder('buy')}>Buy {selectedSymbol}</button>
                        <button className="sell-button" onClick={() => handleOrder('sell')}>Sell {selectedSymbol}</button>
                    </div>
                </div>
                {recommendation && (
                    <div className={`recommendation ${recommendation.startsWith('BUY') ? 'recommendation-buy' : recommendation.startsWith('SELL') ? 'recommendation-sell' : 'recommendation-hold'}`}>
                        <h3>{recommendation.split(' - ')[0]}</h3>
                        <div>
                            {recommendation.split(' - ')[1]?.split(', ').map((reason, index) => (
                                <div key={index}>{`${index + 1}. ${reason}`}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <TradingChart symbol={`BINANCE:${selectedSymbol}USDT`} orders={orders} />
            <OrderBook orders={orders} prices={price} />

            {showOrderPopup && (
                <div className="order-popup">
                    <p>{orderMessage}</p>
                </div>
            )}
        </div>
    );
};

export default App;
