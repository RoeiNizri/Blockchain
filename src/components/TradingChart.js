import React, {useEffect, memo } from 'react';


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
                    disabled_features: [],
                    enabled_features: [],
                    custom_indicators_getter: function (PineJS) {
                        return Promise.resolve([
                            {
                                name: "Custom Moving Average",
                                metainfo: {
                                    _metainfoVersion: 52,
                                    id: "Custom Moving Average@tv-basicstudies-1",
                                    description: "Custom Moving Average",
                                    shortDescription: "Custom MA",
                                    format: { type: "inherit" },
                                    linkedToSeries: true,
                                    is_price_study: true,
                                    plots: [
                                        { id: "plot_0", type: "line" },
                                        { id: "smoothedMA", type: "line" },
                                    ],
                                    defaults: {
                                        styles: {
                                            plot_0: {
                                                linestyle: 0,
                                                linewidth: 1,
                                                plottype: 0,
                                                trackPrice: false,
                                                transparency: 0,
                                                visible: true,
                                                color: "#2196F3",
                                            },
                                            smoothedMA: {
                                                linestyle: 0,
                                                linewidth: 1,
                                                plottype: 0,
                                                trackPrice: false,
                                                transparency: 0,
                                                visible: true,
                                                color: "#9621F3",
                                            },
                                        },
                                        inputs: {
                                            length: 9,
                                            source: "close",
                                            offset: 0,
                                            smoothingLine: "SMA",
                                            smoothingLength: 9,
                                        },
                                    },
                                    styles: {
                                        plot_0: { title: "Plot", histogramBase: 0, joinPoints: true },
                                        smoothedMA: {
                                            title: "Smoothed MA",
                                            histogramBase: 0,
                                            joinPoints: false,
                                        },
                                    },
                                    inputs: [
                                        {
                                            id: "length",
                                            name: "Length",
                                            defval: 9,
                                            type: "integer",
                                            min: 1,
                                            max: 10000,
                                        },
                                        {
                                            id: "source",
                                            name: "Source",
                                            defval: "close",
                                            type: "source",
                                            options: [
                                                "open",
                                                "high",
                                                "low",
                                                "close",
                                                "hl2",
                                                "hlc3",
                                                "ohlc4",
                                            ],
                                        },
                                        {
                                            id: "offset",
                                            name: "Offset",
                                            defval: 0,
                                            type: "integer",
                                            min: -10000,
                                            max: 10000,
                                        },
                                        {
                                            id: "smoothingLine",
                                            name: "Smoothing Line",
                                            defval: "SMA",
                                            type: "text",
                                            options: ["SMA", "EMA", "WMA"],
                                        },
                                        {
                                            id: "smoothingLength",
                                            name: "Smoothing Length",
                                            defval: 9,
                                            type: "integer",
                                            min: 1,
                                            max: 10000,
                                        },
                                    ],
                                },
                                constructor: function () {
                                    this.init = function (context, input) {
                                        this._context = context;
                                    };

                                    this.main = function (ctx, inputCallback) {
                                        this._context = ctx;
                                        this._input = inputCallback;

                                        var source = PineJS.Std[this._input(1)](this._context);
                                        var length = this._input(0);
                                        var offset = this._input(2);
                                        var smoothingLine = this._input(3);
                                        var smoothingLength = this._input(4);

                                        this._context.setMinimumAdditionalDepth(length + smoothingLength);

                                        var series = this._context.new_var(source);
                                        var sma = PineJS.Std.sma(series, length, this._context);
                                        var sma_series = this._context.new_var(sma);

                                        var smoothedMA;
                                        if (smoothingLine === "EMA") {
                                            smoothedMA = PineJS.Std.ema(
                                                sma_series,
                                                smoothingLength,
                                                this._context
                                            );
                                        } else if (smoothingLine === "WMA") {
                                            smoothedMA = PineJS.Std.wma(
                                                sma_series,
                                                smoothingLength,
                                                this._context
                                            );
                                        } else {
                                            smoothedMA = PineJS.Std.sma(
                                                sma_series,
                                                smoothingLength,
                                                this._context
                                            );
                                        }

                                        return [
                                            { value: sma, offset: offset },
                                            { value: smoothedMA, offset: offset },
                                        ];
                                    };
                                },
                            },
                        ]);
                    },
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
                const annotations = [
                    { text: 'Use this toolbar to change the chart settings.', color: 'blue', daysAgo: 5 },
                    { text: 'Zoom in/out using the scroll wheel.', color: 'green', daysAgo: 3, factor: 1.05 },
                    { text: 'Drag the chart to explore different time periods.', color: 'red', factor: 0.95 },
                ];

                annotations.forEach(({ text, color, daysAgo = 0, factor = 1 }) => {
                    chart.createShape(
                        { time: Date.now() / 1000 - 60 * 60 * 24 * daysAgo, price: chart.getVisiblePriceRange().middle * factor },
                        {
                            shape: 'text',
                            text,
                            color,
                            overrides: {
                                fontSize: 16,
                                fontColor: color,
                                bold: true,
                                placement: 'top',
                            },
                        }
                    );
                });

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
                                },
                            }
                        );
                    });

                console.log('Custom guidance and markers added');
            } catch (error) {
                console.error('Error adding guidance or markers:', error);
            }
        };

        const loadTradingViewScript = () => {
            const scriptId = 'tradingview-script';
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.src = 'https://s3.tradingview.com/tv.js';
                script.async = true;
                script.id = scriptId;
                document.body.appendChild(script);
                script.onload = createWidget;
            } else if (window.TradingView) {
                createWidget();
            }
        };

        loadTradingViewScript();

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
        ></div>
    );
};

export default memo(TradingChart);
