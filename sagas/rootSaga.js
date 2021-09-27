import {takeLatest, call, put} from 'redux-saga/effects';
import models from './models';

export default function* watchPushDataToStore() {
  for (const element in models) {
    if (!element) {
      return;
    }
    const {effects} = models[element];
    if (!effects) {
      console.warn(`effects not existed (Model ${element})`);
    } else {
      for (const effect in effects) {
        if (typeof effects[effect] !== 'function') {
          console.warn(
            `${effect} in effects must be a function (Model ${element})`,
          );
        } else {
          yield takeLatest(`${element}/${effect}`, function (action) {
            return effects[effect](action, {call, put});
          });
        }
      }
    }
  }
}
