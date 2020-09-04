import { queryTransactions } from "../services/transaction";

export default {
  namespace: "transaction",

  state: {
    transactions: [],
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryTransactions, window.id);
      yield put({
        type: "setTransactions",
        payload: response.data,
      });
    },
  },

  reducers: {
    setTransactions(state, action) {
      const { sellerOrders, buyerOrders } = action.payload;
      return {
        ...state,
        transactions: action.payload,
      }
    },
  },
};
