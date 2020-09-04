export default {
  namespace: "global",

  state: {
    collapsed: false,
    notices: [],
  },

  effects: {
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: "saveClearedNotices",
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: "user/changeNotifyCount",
        payload: count,
      });
    },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
  },
};
