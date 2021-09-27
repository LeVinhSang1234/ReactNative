import {combineReducers} from 'redux';
import models from './models';

let reducers = {};

for (const model in models) {
  if (!models[model]?.state) {
    console.warn(`should be initialization state (Model ${model})`);
  }
  const initState = models[model].state || {};
  function baseReducer(state = initState, action) {
    let newState = state;
    if (models[model].reducers) {
      for (const key in models[model].reducers) {
        if (action.type === `${model}/${key}`) {
          if (typeof models[model].reducers[key] !== 'function') {
            console.warn(
              `${key} in reducer must be a function (Model ${model})`,
            );
          } else {
            newState = models[model].reducers[key](state, action);
          }
        }
      }
    } else {
      console.warn(`reducers not existed (Model ${model})`);
    }
    return newState;
  }
  reducers[model] = baseReducer;
}

export default combineReducers(reducers);
