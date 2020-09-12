import { queryCurrent, queryUsers } from "../services/user";

export default {
  namespace: "user",

  state: {
    list: [],
    currentUser: {},
    userList: [],
  },

  effects: {
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: "saveCurrentUser",
        payload: response,
      });
    },
    *list(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: "setUserList",
        payload: response.data,
      });
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
    setUserList(state, action) {
      return {
        ...state,
        userList: action.payload,
      }
    },
  },
};
