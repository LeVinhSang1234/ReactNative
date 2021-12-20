import deviceInfoModule from 'react-native-device-info';
import {Platform, StatusBar} from 'react-native';

const height = Platform.select({
  ios: deviceInfoModule.hasNotch() ? 35 : 20,
  android: StatusBar.currentHeight,
  default: 0,
});
const navbarHeight = deviceInfoModule.hasNotch() ? 15 : Platform.isPad ? 10 : 0;
export default {
  height,
  navbarHeight,
  windowHeight: height + navbarHeight,
  concatHeight: h => height + h,
  isPad: Platform.isPad,
  isTouch: deviceInfoModule.hasNotch(),
};
