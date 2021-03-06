import {CallEffect} from '@redux-saga/core/effects';

export interface Lang {
  lang: string;
}

export default {
  namespace: 'language',
  state: {
    lang: 'vi',
  },

  effects: {
    *change(
      {payload, callback}: {payload: any; callback?: any},
      {put}: {call: CallEffect; put: any},
    ) {
      yield put({
        type: 'language/save',
        payload,
      });
      if (callback) {
        callback();
      }
    },
  },
  reducers: {
    save(state: Lang, action: any) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
