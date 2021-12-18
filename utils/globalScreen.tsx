import {useMemo} from 'react';
import {Dimensions} from 'react-native';
import {useSelector} from 'react-redux';

let appConnect: {width: number; height: number} = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

const GlobalScreen = () => {
  const {screen: screenD} = useSelector(({screen}: any) => ({screen}));
  const {screen: screenS} = screenD;
  appConnect = useMemo(() => screenS, [screenS]);

  return null;
};

export {appConnect};
export default GlobalScreen;
