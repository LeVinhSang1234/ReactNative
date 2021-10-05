import {CallEffect} from '@redux-saga/core/effects';
import {Dimensions} from 'react-native';

export interface IScreen {
  loading: boolean;
  screen: {
    width: number;
    height: number;
  };
}

export default {
  namespace: 'screen',
  state: {
    loading: true,
    screen: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
  },

  effects: {
    *change(
      {payload, callback}: {payload: any; callback?: any},
      {put}: {call: CallEffect; put: any},
    ) {
      yield put({
        type: 'screen/save',
        payload,
      });
      if (callback) {
        callback();
      }
    },
  },
  reducers: {
    save(state: IScreen, action: any) {
      return {...state, ...action.payload};
    },
  },
};
