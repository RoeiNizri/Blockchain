import axios from 'axios';

const API_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_URL = `${API_URL}/simple/price`;

export const getCryptoPrice = async (ids, vsCurrencies, signal) => {
    try {
        const response = await axios.get(COINGECKO_API_URL, {
            params: {
                ids: ids.join(','),
                vs_currencies: vsCurrencies.join(',')
            },
            signal, // Pass the signal to axios
        });
        return response.data;
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('Request canceled', error.message);
        } else {
            console.error('Error fetching crypto prices:', error);
            throw error;
        }
    }
};

export const getCryptoData = async (cryptoId, signal) => {
    try {
        const response = await axios.get(`${API_URL}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                ids: cryptoId,
            },
            signal, // Pass the signal to axios
        });
        return response.data;
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('Request canceled', error.message);
        } else {
            console.error('Error fetching cryptocurrency data:', error);
            throw error;
        }
    }
};
