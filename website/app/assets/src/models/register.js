import { register } from "../services/user";

export default {
  namespace: "register",

  state: {
    status: undefined,
  },

  effects: {
    *register({ payload }, { call }) {
      const response = yield call(register, payload);
      if (payload.callback) {
        yield call(payload.callback, {
          payload,
          success: response.success,
        });
      }
    },
  },

  reducers: {
  },
};
