import React, { useEffect } from 'react';

const TradingChart = ({ symbol, orders }) => {
    useEffect(() => {
        let chartWidget = null;

        const createWidget = () => {
            const containerId = `tradingview_${symbol}`;
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
                    enable_publishing: false,
                    allow_symbol_change: true,
                    container_id: containerId,
                    withdateranges: true,
                    hide_side_toolbar: false,
                    autosize: true,
                    studies_overrides: {},
                    overrides: {},
                    onChartReady: () => {
                        console.log('Chart is ready');
                        addCustomElements(chartWidget);
                    },
                });
            } else {
                console.error('Container or TradingView is not available');
            }
        };

        const addCustomElements = (widget) => {
            if (!widget || !widget.chart) return;

            const chart = widget.chart();

            try {
                // Adding EMAs with proper periods and colors
                chart.createStudy('Moving Average Exponential', false, true, [9], null, {
                    'plot.color': 'blue',
                    'plot.linewidth': 2,
                });
                chart.createStudy('Moving Average Exponential', false, true, [21], null, {
                    'plot.color': 'red',
                    'plot.linewidth': 2,
                });

                console.log('EMAs added successfully');

                // Add Buy/Sell Markers
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

                console.log('Buy/Sell markers added');
            } catch (error) {
                console.error('Error adding studies or markers:', error);
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
            } else {
                const intervalId = setInterval(() => {
                    if (window.TradingView) {
                        createWidget();
                        clearInterval(intervalId);
                    }
                }, 100);
            }
        }

        return () => {
            if (chartWidget) {
                chartWidget.remove(); // Properly dispose of the widget to prevent memory leaks
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
                margin: '0 auto',
            }}
        >
            <div
                id={`tradingview_${symbol}`}
                style={{
                    height: '100%',
                    width: '100%',
                }}
            ></div>
        </div>
    );
};

export default TradingChart;
