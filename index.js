import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import Message from './lib/Message';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {Provider} from 'react-redux';
import store from './sagas/store';
// import KeyboardManager from 'react-native-keyboard-manager';

// if (Platform.OS === 'ios') {
// KeyboardManager.setEnable(true);
// KeyboardManager.setEnableDebugging(false);
// KeyboardManager.setKeyboardDistanceFromTextField(10);
// KeyboardManager.setLayoutIfNeededOnUpdate(true);
// KeyboardManager.setEnableAutoToolbar(true);
// KeyboardManager.setToolbarDoneBarButtonItemText('Done');
// KeyboardManager.setToolbarManageBehaviourBy('subviews'); // "subviews" | "tag" | "position"
// KeyboardManager.setToolbarPreviousNextButtonEnable(false);
// KeyboardManager.setToolbarTintColor('#0000FF'); // Only #000000 format is supported
// KeyboardManager.setToolbarBarTintColor('#FFFFFF'); // Only #000000 format is supported
// KeyboardManager.setShouldShowToolbarPlaceholder(true);
// KeyboardManager.setOverrideKeyboardAppearance(false);
// KeyboardManager.setKeyboardAppearance('default'); // "default" | "light" | "dark"
// KeyboardManager.setShouldResignOnTouchOutside(true);
// KeyboardManager.setShouldPlayInputClicks(true);
// KeyboardManager.resignFirstResponder();
// KeyboardManager.isKeyboardShowing().then(isShowing => {
//   // ...
// });
// }

const MakeApp = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <App />
        <Message />
      </NavigationContainer>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => MakeApp);
