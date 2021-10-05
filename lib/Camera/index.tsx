import bar from '@/utils/bar';
import GlobalScreen, {appConnect} from '@/utils/globalScreen';
import {dark} from '@/utils/variables';
import React, {Component, ReactNode} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  GestureResponderEvent,
  StatusBar,
  StyleSheet,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import {CameraType, RNCamera} from 'react-native-camera';

interface IProps {}

interface IState {
  open: boolean;
  typeCamera: keyof CameraType;
  xPoint: number;
  yPoint: number;
  cameraReady: boolean;
}

const backgroundColorPoint = 'yellow';

class Camera extends Component<IProps, IState> {
  animatedOpacity: Animated.Value;
  camera?: RNCamera | null;
  timeout?: NodeJS.Timeout;
  animatedOpacityPoint: Animated.Value;
  animatedOpacityPointXY: Animated.ValueXY;
  constructor(props: IProps) {
    super(props);
    this.animatedOpacity = new Animated.Value(0);
    this.animatedOpacityPoint = new Animated.Value(0);
    this.animatedOpacityPointXY = new Animated.ValueXY({x: 0, y: 0});
    this.state = {
      open: false,
      typeCamera: RNCamera.Constants.Type.back,
      xPoint: 0.5,
      yPoint: 0.5,
      cameraReady: false,
    };
  }

  open = () => {
    StatusBar.setBarStyle('light-content', true);
    this.setState({open: true});
    Animated.spring(this.animatedOpacity, {
      toValue: 1,
      useNativeDriver: false,
      bounciness: 0,
      overshootClamping: true,
    }).start();
  };

  handlePress = ({nativeEvent}: GestureResponderEvent) => {
    const {pageX, pageY} = nativeEvent;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
      const {typeCamera} = this.state;
      if (typeCamera === RNCamera.Constants.Type.back) {
        this.setState({
          typeCamera: RNCamera.Constants.Type.front,
          cameraReady: false,
        });
      } else {
        this.setState({
          typeCamera: RNCamera.Constants.Type.back,
          xPoint: 0.5,
          yPoint: 0.5,
          cameraReady: false,
        });
      }
      return;
    }
    const {typeCamera} = this.state;
    this.timeout = setTimeout(() => {
      this.timeout = undefined;
      if (typeCamera === RNCamera.Constants.Type.front) {
        return;
      }
      const x = pageX - 45 >= 0 ? pageX - 45 : 0;
      const y = pageY - 45 >= 0 ? pageY - 45 : 0;
      Animated.timing(this.animatedOpacityPoint, {
        toValue: 0,
        useNativeDriver: false,
        duration: 0,
      }).start(({finished}) => {
        if (finished) {
          Animated.parallel([
            Animated.timing(this.animatedOpacityPointXY, {
              toValue: {x, y},
              useNativeDriver: false,
              duration: 0,
            }),
            Animated.timing(this.animatedOpacityPoint, {
              toValue: 1,
              duration: 800,
              useNativeDriver: false,
              easing: Easing.elastic(4),
            }),
          ]).start(({finished}) => {
            if (finished) {
              Animated.timing(this.animatedOpacityPoint, {
                toValue: 0,
                useNativeDriver: false,
                duration: 0,
                delay: 1000,
              }).start();
            }
          });
        }
      });

      this.setState({
        xPoint: Number((pageY / Dimensions.get('window').height).toFixed(1)),
        yPoint: 1 - Number((pageX / Dimensions.get('window').width).toFixed(1)),
      });
    }, 250);
  };

  render(): ReactNode {
    const {open, typeCamera, xPoint, yPoint, cameraReady} = this.state;
    if (!open) return <GlobalScreen />;

    const {width, height} = appConnect;
    const scaleXY = this.animatedOpacityPoint.interpolate({
      inputRange: [0, 1],
      outputRange: [1.2, 1],
    });
    return (
      <TouchableNativeFeedback onPress={this.handlePress}>
        <Animated.View
          style={[styles.view, {width, height, opacity: this.animatedOpacity}]}>
          <RNCamera
            autoFocus={RNCamera.Constants.AutoFocus.off}
            autoFocusPointOfInterest={
              typeCamera === RNCamera.Constants.Type.front || !cameraReady
                ? undefined
                : {x: xPoint, y: yPoint}
            }
            style={{width: width, height: height}}
            ref={ref => (this.camera = ref)}
            type={typeCamera}
            flashMode={RNCamera.Constants.FlashMode.on}
            onCameraReady={() => {
              this.setState({cameraReady: true});
            }}
          />
          <Animated.View
            style={[
              styles.viewPointCamera,
              {
                transform: [{scale: scaleXY}],
                opacity: this.animatedOpacityPoint,
              },
              this.animatedOpacityPointXY.getLayout(),
            ]}>
            <View style={styles.relative}>
              <View style={styles.pointLineUp} />
              <View style={styles.pointLineLeft} />
              <View style={styles.pointLineDown} />
              <View style={styles.pointLineRight} />
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableNativeFeedback>
    );
  }
}
const styles = StyleSheet.create({
  view: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: dark,
    flex: 1,
    overflow: 'hidden',
  },
  viewPointCamera: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: backgroundColorPoint,
  },
  relative: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  pointLineUp: {
    position: 'absolute',
    height: 8,
    width: 1,
    backgroundColor: backgroundColorPoint,
    left: '50%',
    top: 0,
  },
  pointLineDown: {
    position: 'absolute',
    height: 8,
    width: 1,
    backgroundColor: backgroundColorPoint,
    left: '50%',
    bottom: 0,
  },
  pointLineLeft: {
    position: 'absolute',
    height: 1,
    width: 8,
    backgroundColor: backgroundColorPoint,
    left: 0,
    top: '50%',
  },
  pointLineRight: {
    position: 'absolute',
    height: 1,
    width: 8,
    backgroundColor: backgroundColorPoint,
    right: 0,
    top: '50%',
  },
});

export default Camera;
