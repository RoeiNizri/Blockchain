const wsURL = 'wss://mtickers.mtw-testnet.com';
const maxReconnectAttempts = 10; // Maximum number of reconnection attempts

export const connectWebSocket = (onMessage) => {
    let socket;
    let reconnectAttempts = 0;
    let reconnectTimeout;
    let manualClose = false;

    const connect = () => {
        if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
            console.log("WebSocket already open or in the process of opening.");
            return;
        }

        socket = new WebSocket(wsURL);

        socket.onopen = () => {
            console.log('WebSocket connection established');
            reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = (event) => {
            console.log(`WebSocket connection closed (code: ${event.code}, reason: ${event.reason}).`);

            if (!manualClose && reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                const reconnectDelay = Math.min(1000 * 2 ** reconnectAttempts, 30000); // Exponential backoff capped at 30 seconds
                console.log(`Reconnecting WebSocket in ${reconnectDelay / 1000} seconds...`);
                reconnectTimeout = setTimeout(connect, reconnectDelay);
            } else if (reconnectAttempts >= maxReconnectAttempts) {
                console.error('Max reconnect attempts reached. No longer attempting to reconnect.');
            }
        };
    };

    // Add a small initial delay before the first connection attempt
    setTimeout(connect, 500);

    return {
        close: () => {
            manualClose = true;
            if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
                socket.close();
            }
            clearTimeout(reconnectTimeout); // Clear any pending reconnection attempts
        },
        disconnect: () => {
            manualClose = true;
            if (socket) {
                socket.close();
            }
            clearTimeout(reconnectTimeout); // Clear any pending reconnection attempts
        },
    };
};
