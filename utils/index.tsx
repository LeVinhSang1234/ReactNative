import {Animated, Platform} from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconSomeWhere from 'react-native-vector-icons/FontAwesome';
import Video from 'react-native-video';
import RNConvertPhAsset from 'react-native-convert-ph-asset';

export {IconIon, IconSomeWhere, Video, RNConvertPhAsset};

export function unMount(paramThis: any) {
  paramThis.setState = () => null;
}
export async function throwException(e: any) {
  console.log(e);
}

export const convertUri = (uri: string) => {
  if (Platform.OS === 'android') {
    return uri;
  }
  return decodeURIComponent(uri.replace('file://', ''));
};

export function animatedSpringLayout(
  animated: any,
  value: any,
  nativeDriver?: boolean,
) {
  return Animated.spring(animated, {
    toValue: value,
    bounciness: 0,
    overshootClamping: true,
    useNativeDriver: !!nativeDriver,
  });
}

export async function promiseSringLayout(
  animated: any,
  value: any,
  nativeDriver?: boolean,
) {
  return new Promise(resolve => {
    Animated.spring(animated, {
      toValue: value,
      bounciness: 0,
      overshootClamping: true,
      useNativeDriver: !!nativeDriver,
    }).start(({finished}) => {
      if (finished) {
        resolve(true);
      }
    });
  });
}

export async function promiseDelayFinished(
  animated: any,
  value: any,
  delay: number = 0,
  nativeDriver?: boolean,
) {
  return new Promise(resolve => {
    Animated.spring(animated, {
      toValue: value,
      bounciness: 0,
      overshootClamping: true,
      useNativeDriver: !!nativeDriver,
    }).start();
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
}

export async function promiseDelayTimingFinished(
  animated: any,
  value: any,
  duration: number = 0,
  nativeDriver?: boolean,
  delay: number = 0,
) {
  return new Promise(resolve => {
    Animated.timing(animated, {
      toValue: value,
      duration,
      useNativeDriver: !!nativeDriver,
    }).start();
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
}

export async function promiseTiming(
  animated: any,
  value: any = 0,
  duration: number = 0,
  nativeDrive?: boolean,
) {
  return new Promise(resolve => {
    Animated.timing(animated, {
      toValue: value,
      useNativeDriver: !!nativeDrive,
      duration: duration,
    }).start(({finished}) => {
      if (finished) {
        resolve(true);
      }
    });
  });
}

export function animatedTimingObject(
  animated: any,
  {
    toValue = 0,
    duration = 0,
    nativeDrive = false,
    easing,
    delay = 0,
  }: {
    toValue: any;
    duration?: number;
    nativeDrive?: boolean;
    easing?: (value: number) => number;
    delay?: number;
  },
) {
  const objectConfig: any = {
    toValue,
    useNativeDriver: nativeDrive,
    duration,
    delay,
  };
  if (easing) {
    objectConfig.easing = easing;
  }
  return Animated.timing(animated, objectConfig);
}

export function animatedTiming(
  animated: any,
  toValue: any = 0,
  duration: number = 0,
  useNativeDriver: boolean = false,
  easing?: (value: number) => number,
  delay: number = 0,
) {
  const objectConfig: any = {
    toValue,
    useNativeDriver,
    duration,
    delay,
  };
  if (easing) {
    objectConfig.easing = easing;
  }
  return Animated.timing(animated, objectConfig);
}
