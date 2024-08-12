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
                    enable_publishing: false,
                    allow_symbol_change: true,
                    autosize: true, 
                    onChartReady: () => {
                        console.log('Chart is ready');
                    },
                });
            } else {
                console.error('Container or TradingView is not available');
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
