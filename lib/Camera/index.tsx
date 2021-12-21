import {
  animatedTiming,
  animatedTimingObject,
  convertUri,
  promiseTiming,
  throwException,
} from '@/utils';
import bar from '@/utils/bar';
import {appConnect} from '@/App';
import {dark} from '@/utils/variables';
import React, {Component, Fragment, ReactNode} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  GestureResponderEvent,
  LayoutAnimation,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import {CameraType, FlashMode, RNCamera} from 'react-native-camera';
import {SvgXml} from 'react-native-svg';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconSomeWhere from 'react-native-vector-icons/FontAwesome';
import Text from '../Text';
import Zoom from '../ZoomView';
import SvgSend from '@/assets/img/icon_send.svg';
import translate from '@/translate';
import SelectImage from '../SelectImage';
import Image from './Image';

interface IProps {}

interface IState {
  open: boolean;
  typeCamera: keyof CameraType;
  xPoint: number;
  yPoint: number;
  cameraReady: boolean;
  flashMode: keyof FlashMode;
  zoom: number;
  exposure: number;
  image: any;
}

const backgroundColorPoint = 'yellow';
const backgroundButtonCapture = 'rgba(174,174,174,0.8)';

class Camera extends Component<IProps, IState> {
  camera?: RNCamera | null;
  timeout?: NodeJS.Timeout;
  animatedOpacityPoint: Animated.Value;
  animatedOpacityPointXY: Animated.ValueXY;
  isZoom: boolean;
  selectImage?: SelectImage | null;
  imagePreviewCamera?: Image | null;

  constructor(props: IProps) {
    super(props);
    this.animatedOpacityPoint = new Animated.Value(0);
    this.animatedOpacityPointXY = new Animated.ValueXY({x: 0, y: 0});
    this.isZoom = false;
    this.state = {
      open: false,
      typeCamera: RNCamera.Constants.Type.back,
      xPoint: 0.5,
      yPoint: 0.5,
      cameraReady: false,
      flashMode: RNCamera.Constants.FlashMode.auto,
      zoom: 0,
      exposure: -1,
      image: undefined,
    };
  }

  open = () => {
    StatusBar.setHidden(true);
    this.setState({open: true});
  };

  close = () => {
    StatusBar.setHidden(false);
    animatedTiming(this.animatedOpacityPoint, 0, 0).start();
    this.setState({open: false, zoom: 0, image: undefined});
  };

  handleChangeFlash = () => {
    const {flashMode} = this.state;
    let flash;
    if (flashMode === RNCamera.Constants.FlashMode.off) {
      flash = RNCamera.Constants.FlashMode.auto;
    } else if (flashMode === RNCamera.Constants.FlashMode.on) {
      flash = RNCamera.Constants.FlashMode.off;
    } else {
      flash = RNCamera.Constants.FlashMode.on;
    }
    this.setState({flashMode: flash});
  };

  renderNameFlash = () => {
    const {flashMode} = this.state;
    if (flashMode !== RNCamera.Constants.FlashMode.off) {
      return 'ios-flash';
    }
    return 'ios-flash-off';
  };

  handleChangeType = () => {
    const {typeCamera} = this.state;
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        260,
        Platform.OS === 'ios'
          ? LayoutAnimation.Types.keyboard
          : LayoutAnimation.Types.linear,
        LayoutAnimation.Properties.scaleXY,
      ),
    );
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
  };

  handlePress = async ({nativeEvent}: GestureResponderEvent) => {
    if (this.isZoom) {
      this.isZoom = false;
      return;
    }
    const {pageX, pageY} = nativeEvent;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
      return this.handleChangeType();
    }
    const {typeCamera} = this.state;
    this.timeout = setTimeout(async () => {
      this.timeout = undefined;
      if (typeCamera === RNCamera.Constants.Type.front) {
        return;
      }
      const x = pageX - 45 >= 0 ? pageX - 45 : 0;
      const y = pageY - 45 >= 0 ? pageY - 45 : 0;
      await promiseTiming(this.animatedOpacityPoint, 0, 0, false);
      Animated.parallel([
        animatedTiming(this.animatedOpacityPointXY, {x, y}, 0),
        animatedTimingObject(this.animatedOpacityPoint, {
          toValue: 1,
          duration: 800,
          easing: Easing.elastic(4),
        }),
      ]).start(({finished}) => {
        if (finished) {
          animatedTimingObject(this.animatedOpacityPoint, {
            toValue: 0,
            delay: 1000,
          }).start();
        }
      });
      this.setState({
        xPoint: Number((pageY / Dimensions.get('window').height).toFixed(1)),
        yPoint: 1 - Number((pageX / Dimensions.get('window').width).toFixed(1)),
        exposure: -1,
      });
    }, 250);
  };

  handleZoom = (zoom: number, _touchs: number) => {
    this.isZoom = true;
    const {zoom: zoomState} = this.state;
    if (zoom !== zoomState) {
      this.setState({zoom});
    }
  };

  rotateImage = (exifOrientation: number) => {
    let degRotation;
    switch (exifOrientation) {
      case 3:
        degRotation = '360deg';
        break;
      case 4:
        degRotation = '360deg';
        break;
      case 5:
        degRotation = '90deg';
        break;
      case 6:
        degRotation = '90deg';
        break;
      case 7:
        degRotation = '270deg';
        break;
      case 8:
        degRotation = '270deg';
        break;
      default:
        degRotation = '0deg';
    }
    return degRotation;
  };

  takePicture = async () => {
    if (this.camera) {
      try {
        const data = await this.camera.takePictureAsync({
          quality: 0,
          imageType: 'jpeg',
        });
        this.setState({image: data});
      } catch (e) {
        throwException(e);
      }
    }
  };

  handleSelectImage = () => {
    this.selectImage?.open?.();
  };

  handleSetInitImage = (image: any) => {
    this.imagePreviewCamera?.setImage?.(image);
  };

  render(): ReactNode {
    const {
      open,
      typeCamera,
      xPoint,
      yPoint,
      cameraReady,
      flashMode,
      zoom,
      exposure,
      image,
    } = this.state;
    if (!open) {
      return null;
    }
    const {width, height} = appConnect;
    const scaleXY = this.animatedOpacityPoint.interpolate({
      inputRange: [0, 1],
      outputRange: [1.2, 1],
    });
    const checkFront = typeCamera === RNCamera.Constants.Type.front;
    const left = width / 2 - (checkFront ? 15 : 40);
    if (image) {
      return (
        <View style={[styles.view, {width, height}]}>
          <View style={styles.viewImage}>
            <Image
              style={[
                {
                  width,
                  height,
                  transform: [
                    {rotate: this.rotateImage(image.deviceOrientation)},
                  ],
                },
              ]}
              source={{uri: convertUri(image.uri)}}
              resizeMode="contain"
            />
          </View>
          <TouchableNativeFeedback
            onPress={() => {
              this.setState({image: undefined});
            }}>
            <View style={styles.iconClose}>
              <IconIon name="chevron-back" size={30} color="#fff" />
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <View style={styles.buttonSave}>
              <View style={styles.flexCenter}>
                <IconSomeWhere size={16} name="long-arrow-down" color="#fff" />
              </View>
              <View style={styles.flexCenter}>
                <View style={styles.viewLineDown} />
              </View>
              <Text style={styles.textSave}>
                {translate({
                  id: 'camera.button.save_image',
                  defaultValue: 'Lưu',
                })}
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <View style={styles.buttonSend}>
              <Text style={styles.textSend}>
                {translate({
                  id: 'camera.button.send_image',
                  defaultValue: 'Gửi',
                })}
              </Text>
              <SvgXml width={20} height={20} xml={SvgSend} fill="#fff" />
            </View>
          </TouchableNativeFeedback>
        </View>
      );
    }

    return (
      <Fragment>
        <TouchableNativeFeedback onPress={this.handlePress}>
          <Zoom.Animated
            pointerAvailable={2}
            onZoom={this.handleZoom}
            style={[styles.view, {width, height}]}>
            <RNCamera
              exposure={exposure}
              zoom={zoom}
              autoFocus={RNCamera.Constants.AutoFocus.off}
              autoFocusPointOfInterest={
                checkFront || !cameraReady ? undefined : {x: xPoint, y: yPoint}
              }
              style={{width: width, height: height}}
              ref={ref => (this.camera = ref)}
              type={typeCamera}
              flashMode={flashMode}
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
            <TouchableNativeFeedback onPress={this.close}>
              <View style={styles.iconClose}>
                <IconIon name="ios-close" size={30} color="#fff" />
              </View>
            </TouchableNativeFeedback>
            <View style={[styles.iconChangeCamera, {left}]}>
              <View style={styles.flash}>
                <Pressable onPress={this.handleChangeType}>
                  <View style={styles.viewCameraReverse}>
                    <IconIon name="ios-camera-reverse" size={30} color="#fff" />
                  </View>
                </Pressable>
                {checkFront ? null : (
                  <Pressable onPress={this.handleChangeFlash}>
                    <View style={styles.viewCameraReverse}>
                      <View style={[styles.mt2]}>
                        <IconIon
                          name={this.renderNameFlash()}
                          size={24}
                          color="#fff"
                        />
                      </View>
                      {flashMode === RNCamera.Constants.FlashMode.auto ? (
                        <Text style={styles.textAFlash}>A</Text>
                      ) : null}
                    </View>
                  </Pressable>
                )}
              </View>
            </View>
            <View style={[styles.previewImage]}>
              <TouchableNativeFeedback onPress={this.handleSelectImage}>
                <View>
                  <Image
                    style={styles.image}
                    ref={ref => (this.imagePreviewCamera = ref)}
                  />
                </View>
              </TouchableNativeFeedback>
            </View>
            <Pressable onPress={this.takePicture}>
              <View style={[styles.capture, {left: width / 2 - 33}]}>
                <View style={styles.captureWhite} />
              </View>
            </Pressable>
          </Zoom.Animated>
        </TouchableNativeFeedback>
        <SelectImage
          onLoadWillMount={this.handleSetInitImage}
          fullScreen
          ref={ref => (this.selectImage = ref)}
        />
      </Fragment>
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
    zIndex: 1,
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
  iconClose: {
    position: 'absolute',
    top: bar.isTouch ? bar.concatHeight(10) : 10,
    left: 15,
    zIndex: 2,
    width: 30,
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2.5,
  },
  iconChangeCamera: {
    position: 'absolute',
    top: bar.isTouch ? bar.concatHeight(10) : 13,
    zIndex: 2,
    width: 100,
    height: 30,
    flexDirection: 'row',
  },
  flash: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    position: 'relative',
  },
  textAFlash: {
    position: 'absolute',
    bottom: 4,
    right: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  viewCameraReverse: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 40,
    height: 40,
  },
  mt2: {
    marginTop: 2,
  },
  capture: {
    backgroundColor: backgroundButtonCapture,
    width: 70,
    height: 70,
    borderRadius: 50,
    zIndex: 1,
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: bar.navbarHeight + 30,
  },
  captureWhite: {
    width: 55,
    height: 55,
    borderRadius: 50,
    backgroundColor: '#ffffff',
  },
  previewImage: {
    width: 35,
    height: 35,
    borderRadius: 8,
    position: 'absolute',
    bottom: bar.navbarHeight + 48,
    left: 30,
  },
  viewImage: {},
  buttonSend: {
    position: 'absolute',
    bottom: bar.navbarHeight + 28,
    right: 20,
    backgroundColor: '#4a87ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  textSend: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  textSave: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonSave: {
    position: 'absolute',
    bottom: bar.navbarHeight + 18,
    left: 30,
  },
  flexCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  viewLineDown: {
    backgroundColor: '#fff',
    height: 2,
    width: 17,
    marginTop: 3,
    marginBottom: 10,
    marginRight: 1,
  },
  image: {
    width: 35,
    height: 35,
    borderRadius: 8,
  },
});

export default Camera;
