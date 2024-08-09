// src/store.js
import { createStore } from 'redux';

const initialState = {
  transactions: JSON.parse(localStorage.getItem('transactions')) || [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      const newTransactions = [...state.transactions, action.payload];
      localStorage.setItem('transactions', JSON.stringify(newTransactions));
      return {
        ...state,
        transactions: newTransactions,
      };
    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;
