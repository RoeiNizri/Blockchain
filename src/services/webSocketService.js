const wsURL = 'wss://mtickers.mtw-testnet.com';

export const connectWebSocket = (onMessage) => {
    let socket;

    const connect = () => {
        socket = new WebSocket(wsURL);

        socket.onopen = () => {
            console.log('WebSocket connection established');
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
            console.log('WebSocket connection closed:', event);

            // Handle closure based on whether it was intentional or not
            if (!event.wasClean) {
                // Attempt to reconnect after a delay
                setTimeout(() => {
                    console.log('Reconnecting WebSocket...');
                    connect();
                }, 5000); // Reconnect after 5 seconds
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    };

    connect();

    return {
        close: () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
            } else if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.CLOSING)) {
                // Ensure the WebSocket is properly closed
                socket.addEventListener('close', () => {
                    console.log('WebSocket closed successfully.');
                });
            }
        },
    };
};

export const fetchSymbols = async () => {
    try {
        const response = await fetch('https://mtickers.mtw-testnet.com/symbols');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching symbols:', error);
        throw error; // Rethrow to handle it in the calling code if necessary
    }
};
