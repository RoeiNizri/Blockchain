import React, { useEffect, memo } from 'react';

const TradingChart = ({ symbol, orders }) => {
    useEffect(() => {
        let chartWidget = null;

        const createWidget = () => {
            const containerId = `tradingview_container_${symbol}`;
            const container = document.getElementById(containerId);
            if (container && window.TradingView) {
                chartWidget = new window.TradingView.widget({
                    symbol: symbol,
                    interval: 'D',
                    timezone: 'Asia/Jerusalem',
                    theme: 'dark',
                    style: '1',
                    locale: 'en',
                    toolbar_bg: '#f1f3f6',
                    container_id: containerId,
                    withdateranges: true,
                    hide_side_toolbar: false,
                    details: true,
                    studies: ["STD:MA%Ribbon"],
                    enable_publishing: false,
                    allow_symbol_change: true,
                    autosize: true,
                    onChartReady: () => {
                        console.log('Chart is ready');
                        addCustomGuidance(chartWidget);
                    },
                });
            } else {
                console.error('Container or TradingView is not available');
            }
        };

        const addCustomGuidance = (widget) => {
            if (!widget || typeof widget.chart !== 'function') return;

            const chart = widget.chart();

            try {
                // Example: Add text annotations to guide the user
                chart.createShape(
                    { time: Date.now() / 1000 - 60 * 60 * 24 * 5, price: chart.getVisiblePriceRange().middle }, // Adjust coordinates as necessary
                    {
                        shape: 'text',
                        text: 'Use this toolbar to change the chart settings.',
                        color: 'blue',
                        overrides: {
                            fontSize: 16,
                            fontColor: 'blue',
                            bold: true,
                            placement: 'top',
                        }
                    }
                );

                chart.createShape(
                    { time: Date.now() / 1000 - 60 * 60 * 24 * 3, price: chart.getVisiblePriceRange().middle * 1.05 },
                    {
                        shape: 'text',
                        text: 'Zoom in/out using the scroll wheel.',
                        color: 'green',
                        overrides: {
                            fontSize: 16,
                            fontColor: 'green',
                            bold: true,
                            placement: 'top',
                        }
                    }
                );

                chart.createShape(
                    { time: Date.now() / 1000, price: chart.getVisiblePriceRange().middle * 0.95 },
                    {
                        shape: 'text',
                        text: 'Drag the chart to explore different time periods.',
                        color: 'red',
                        overrides: {
                            fontSize: 16,
                            fontColor: 'red',
                            bold: true,
                            placement: 'top',
                        }
                    }
                );

                // Add Buy/Sell Markers based on orders
                orders
                    .filter(order => order.status === 'APPROVED')
                    .forEach(order => {
                        chart.createShape(
                            { time: new Date(order.time).getTime() / 1000, price: order.price },
                            {
                                shape: order.type === 'buy' ? 'arrow_up' : 'arrow_down',
                                text: `${order.orderType.toUpperCase()} ${order.type.toUpperCase()}`,
                                color: order.type === 'buy' ? 'green' : 'red',
                                overrides: {
                                    backgroundColor: 'transparent',
                                    fontSize: 14,
                                    fontColor: order.type === 'buy' ? 'green' : 'red',
                                    bold: true,
                                }
                            }
                        );
                    });

                console.log('Custom guidance and markers added');
            } catch (error) {
                console.error('Error adding guidance or markers:', error);
            }
        };

        const scriptId = 'tradingview-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.id = scriptId;
            document.body.appendChild(script);

            script.onload = () => {
                createWidget();
            };
        } else {
            if (window.TradingView) {
                createWidget();
            } 
        }

        return () => {
            if (chartWidget) {
                chartWidget.remove();
                chartWidget = null;
            }
        };
    }, [symbol, orders]);

    return (
        <div
            id={`tradingview_container_${symbol}`}
            style={{
                height: '610px',
                width: '980px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '20px auto',
                padding: '20px',
            }}
        >
            <div
                id={`tradingview_container_${symbol}`}
                style={{
                    height: '100%',
                    width: '100%',
                }}
            ></div>
        </div>
    );
};

export default memo(TradingChart);
