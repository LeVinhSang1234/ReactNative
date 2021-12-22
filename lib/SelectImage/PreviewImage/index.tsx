import {appConnect} from '@/App';
import {
  animatedSpringLayout,
  animatedTiming,
  IconIon,
  IconSomeWhere,
  promiseDelayTimingFinished,
  RNConvertPhAsset,
  Video,
} from '@/utils';
import React, {Component, Fragment} from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import {StatusBar} from 'react-native';
import bar from '@/utils/bar';
import {SvgXml} from 'react-native-svg';
import SvgSend from '@/assets/img/icon_send.svg';
import translate from '@/translate';
import {BlurView} from '@react-native-community/blur';
import Spin from '@/lib/Spin';

interface IProps {}

interface IState {
  dataPreview?: {
    image: any;
    location: {pageX: number; pageY: number};
    size: number;
  };
  start: boolean;
  ori: number;
  loadingVideo: boolean;
  video: any;
}

class PreviewImage extends Component<IProps, IState> {
  animated: Animated.Value;
  animatedOpacityOption: Animated.Value | any;
  player: any;
  constructor(props: IProps) {
    super(props);
    this.state = {
      dataPreview: undefined,
      start: false,
      ori: 1,
      loadingVideo: true,
      video: undefined,
    };
    this.animated = new Animated.Value(0);
    this.animatedOpacityOption = new Animated.Value(0);
  }

  componentWillUnmount() {
    StatusBar.setHidden(false, 'fade');
  }

  close = async () => {
    StatusBar.setHidden(false, 'fade');
    const toValue = this.animatedOpacityOption._value;
    if (!toValue) {
      return this.handlePress();
    }
    animatedTiming(this.animatedOpacityOption, 0).start();
    await promiseDelayTimingFinished(this.animated, 0, 200, false, 180);
    this.setState({
      dataPreview: undefined,
      loadingVideo: true,
      video: undefined,
    });
  };

  handlePreview = async (
    image: any,
    location: {pageX: number; pageY: number},
    size: number,
  ) => {
    StatusBar.setHidden(true);
    const {mediaType, localIdentifier} = image;
    this.setState({dataPreview: {image, location, size}}, () => {
      animatedSpringLayout(this.animated, 1).start();
    });
    animatedTiming(this.animatedOpacityOption, 1, 500).start();
    if (mediaType === 'video') {
      const data = await RNConvertPhAsset.convertVideoFromId({
        id: localIdentifier,
        convertTo: 'mov',
        quality: 'high',
      });
      this.setState({video: data});
    }
  };

  handlePress = () => {
    const toValue = this.animatedOpacityOption._value ? 0 : 1;
    animatedTiming(this.animatedOpacityOption, toValue, 500).start();
  };

  render() {
    const {dataPreview, loadingVideo, video} = this.state;
    if (!dataPreview) {
      return null;
    }
    const {image: imageData, size, location} = dataPreview;
    const {_imageRef, image} = imageData;
    const {width, height} = appConnect;
    const {pageX, pageY} = location;
    const scaleX = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [size / width, 1],
    });
    const scaleY = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [size / height, 1],
    });
    const left = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [pageX - 4 - 1.5 * size, 0],
    });
    const scale = (height / size - 1) / 2;
    const top = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [pageY - scale * size, 0],
    });

    return (
      <Fragment>
        <BlurView
          blurAmount={0}
          blurType="light"
          style={[styles.blurType, {width, height}]}
        />
        <Animated.View
          style={[
            styles.viewPreview,
            {
              width: width,
              height: height,
              transform: [{scaleX}, {scaleY}],
              left,
              top,
            },
          ]}>
          <Pressable onPress={this.handlePress}>
            <Image
              source={image || _imageRef}
              style={{width: width, height: height}}
              resizeMode="contain"
            />
            {video ? (
              <Spin
                spinning={loadingVideo}
                style={[styles.video, {width: width, height: height}]}
                backgroundColor="rgba(255,255,255,0.2)"
                backgroundColorImage="rgba(255,255,255,0)">
                <Video
                  onLoad={() => this.setState({loadingVideo: false})}
                  source={{uri: video.path}}
                  style={{width: width, height: height}}
                  resizeMode="contain"
                  ref={(ref: any) => (this.player = ref)}
                />
              </Spin>
            ) : null}
          </Pressable>
        </Animated.View>
        <Animated.View
          style={[
            styles.viewClose,
            {width, opacity: this.animatedOpacityOption},
          ]}>
          <Pressable onPress={this.handlePress}>
            <Pressable style={styles.iconClose} onPress={this.close}>
              <IconIon name="chevron-back-outline" size={24} color="#fff" />
            </Pressable>
          </Pressable>
        </Animated.View>
        <Animated.View
          style={[
            styles.buttonBottom,
            {opacity: this.animatedOpacityOption, width},
          ]}>
          <TouchableNativeFeedback>
            <Animated.View
              style={[
                styles.buttonSave,
                {opacity: this.animatedOpacityOption},
              ]}>
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
            </Animated.View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <Animated.View
              style={[
                styles.buttonSend,
                {opacity: this.animatedOpacityOption},
              ]}>
              <Text style={styles.textSend}>
                {translate({
                  id: 'camera.button.send_image',
                  defaultValue: 'Gửi',
                })}
              </Text>
              <SvgXml width={20} height={20} xml={SvgSend} fill="#fff" />
            </Animated.View>
          </TouchableNativeFeedback>
        </Animated.View>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  viewPreview: {
    position: 'absolute',
    backgroundColor: '#000',
  },
  blurType: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  iconClose: {
    width: 30,
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewClose: {
    top: 0,
    left: 0,
    position: 'absolute',
    height: 30 + (bar.isTouch ? bar.concatHeight(10) : 10),
    paddingTop: bar.isTouch ? bar.concatHeight(5) : 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingLeft: 15,
  },
  buttonSend: {
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
  buttonSave: {},
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
  buttonBottom: {
    position: 'absolute',
    height: 70 + bar.navbarHeight,
    backgroundColor: 'rgba(0,0,0,0.3)',
    bottom: -bar.navbarHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: bar.navbarHeight + 15,
    paddingLeft: 30,
    paddingRight: 16,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default PreviewImage;
