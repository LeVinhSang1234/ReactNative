import {AppRegistry, Platform, UIManager} from 'react-native';
import {name as appName} from './app.json';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import store from './sagas/store';
import App from './App';
import 'react-native-gesture-handler';

const MakeApp = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <App />
      </NavigationContainer>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => MakeApp);
