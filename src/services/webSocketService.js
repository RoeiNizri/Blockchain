const wsURL = 'wss://mtickers.mtw-testnet.com';
const maxReconnectAttempts = 10; // Maximum number of reconnection attempts

export const connectWebSocket = (onMessage) => {
    let socket;
    let reconnectAttempts = 0;
    let reconnectTimeout;

    const connect = () => {
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

        socket.onclose = (event) => {
            console.log(`WebSocket connection closed (code: ${event.code}, reason: ${event.reason}).`);

            // Handle closure based on whether it was intentional or not
            if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                const reconnectDelay = Math.min(1000 * 2 ** reconnectAttempts, 30000); // Exponential backoff capped at 30 seconds
                console.log(`Reconnecting WebSocket in ${reconnectDelay / 1000} seconds...`);
                reconnectTimeout = setTimeout(connect, reconnectDelay);
            } else if (reconnectAttempts >= maxReconnectAttempts) {
                console.error('Max reconnect attempts reached. No longer attempting to reconnect.');
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    };

    connect();

    return {
        close: () => {
            if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
                socket.close();
            }
            clearTimeout(reconnectTimeout); // Clear any pending reconnection attempts
        },
        disconnect: () => {
            if (socket) {
                socket.close();
            }
            clearTimeout(reconnectTimeout); // Clear any pending reconnection attempts
        },
    };
};

export const fetchSymbols = async (retries = 3) => {
    const controller = new AbortController(); // Create a new AbortController instance
    const signal = controller.signal;

    try {
        const response = await fetch('https://mtickers.mtw-testnet.com/symbols', { signal });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Fetch request was aborted');
        } else {
            console.error('Error fetching symbols:', error);
            if (retries > 0) {
                console.log(`Retrying fetchSymbols... Attempts left: ${retries - 1}`);
                return fetchSymbols(retries - 1); // Retry the fetch with one less retry count
            } else {
                throw error; // Rethrow after exhausting retries
            }
        }
    } finally {
        controller.abort(); // Clean up the controller
    }
};
