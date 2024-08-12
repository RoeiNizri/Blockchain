import React, { useEffect, memo } from 'react';

const TradingChart = ({ symbol, orders }) => {
    useEffect(() => {
        let chartWidget = null;
        let retryCount = 0;
        const maxRetries = 3;

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
                    enable_publishing: false,
                    allow_symbol_change: true,
                    autosize: true,
                    studies: ['Moving Average', 'Volume','MA Cross' ], 
                    onChartReady: () => {
                        console.log('Chart is ready');
                        addStudies(chartWidget);
                    },
                });
            } else {
                console.error('Container or TradingView is not available');
                retryCreateWidget();
            }
        };

        const addStudies = (widget) => {
            if (!widget || typeof widget.chart !== 'function') return;

            const chart = widget.chart();

            chart.createStudy('Moving Average', false, false, [5, 10, 15], null, {
                'Plot.color': 'blue',
            });
            chart.createStudy('Volume', false, false, null, null, {
                'Plot.color': 'red',
            });
            chart.createStudy('MA Cross', false, false, [9, 21], null, {
                'Plot.linewidth': 2,
                'Plot.color': 'green',
            });
        };

        const retryCreateWidget = () => {
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                    console.log(`Retrying to create widget... Attempt ${retryCount}`);
                    createWidget();
                }, 1000); // Retry after 1 second
            } else {
                console.error('Max retries reached. Widget could not be created.');
            }
        };

        const loadScriptAndCreateWidget = () => {
            const scriptId = 'tradingview-script';
            const existingScript = document.getElementById(scriptId);

            if (!existingScript) {
                const script = document.createElement('script');
                script.src = 'https://s3.tradingview.com/tv.js';
                script.async = true;
                script.id = scriptId;
                document.body.appendChild(script);

                script.onload = () => {
                    console.log('TradingView script loaded');
                    createWidget();
                };

                script.onerror = () => {
                    console.error('Failed to load TradingView script');
                    retryCreateWidget();
                };
            } else {
                if (window.TradingView) {
                    createWidget();
                } else {
                    existingScript.onload = () => {
                        createWidget();
                    };
                }
            }
        };

        loadScriptAndCreateWidget();

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
