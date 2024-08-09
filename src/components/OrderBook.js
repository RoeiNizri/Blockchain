import React from 'react';

const OrderBook = ({ orders }) => {
    return (
        <div className="order-book-container">
            <h2>Order Book</h2>
            <ul className="order-book-list">
                {orders.map((order, index) => (
                    <li key={index} className="order-book-item">
                        <span>{order.orderType.toUpperCase()}</span> - <span>{order.type.toUpperCase()}</span> {order.symbol} at ${order.price.toFixed(2)} - {order.amount} units
                        <br />
                        <span>{new Date(order.time).toLocaleString()}</span>
                        <span style={{ marginLeft: '10px', color: order.status === 'APPROVED' ? 'green' : 'gray' }}>
                            {order.status === 'APPROVED' ? '✔ APPROVED' : 'PENDING'}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderBook;
