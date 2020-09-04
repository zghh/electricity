import { queryCurrentOrders, queryMyOrders, newOrder, queryOrderInfo } from "../services/order";

export default {
  namespace: "order",

  state: {
    sellerOrders: [],
    buyerOrders: [],
    myOrders: [],
    orderInfo: {},
    transactions: [],
  },

  effects: {
    *fetchCurrentOrders(_, { call, put }) {
      const response = yield call(queryCurrentOrders);
      yield put({
        type: "setCurrentOrders",
        payload: response.data,
      });
    },
    *fetchMyOrders(_, { call, put }) {
      const response = yield call(queryMyOrders, window.id);
      yield put({
        type: "setMyOrders",
        payload: response.data,
      });
    },
    *new({ payload }, { call }) {
      const response = yield call(newOrder, payload);
      if (payload.callback) {
        yield call(payload.callback, {
          payload,
          success: response.success,
        });
      }
    },
    *fetchDetail(payload, { call, put }) {
      const response = yield call(queryOrderInfo, payload.payload.id);
      yield put({
        type: "setOrderInfo",
        payload: response.data,
      });
    },
  },

  reducers: {
    setCurrentOrders(state, action) {
      const { sellerOrders, buyerOrders } = action.payload;
      return {
        ...state,
        sellerOrders: sellerOrders,
        buyerOrders: buyerOrders,
      }
    },
    setMyOrders(state, action) {
      return {
        ...state,
        myOrders: action.payload,
      }
    },
    setOrderInfo(state, action) {
      const { orderInfo, transactions } = action.payload;
      return {
        ...state,
        orderInfo: orderInfo,
        transactions: transactions,
      }
    },
  },
};
