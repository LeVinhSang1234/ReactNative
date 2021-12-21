import React, {Component} from 'react';
import {appConnect} from '@/App';

import {Animated, Image, Pressable, StyleSheet, View} from 'react-native';
import Text from '@/lib/Text';
import IconIon from 'react-native-vector-icons/Ionicons';
import {backgroundIconChat} from '@/utils/variables';
import {animatedTiming} from '@/utils';
import {BlurView} from '@react-native-community/blur';

const AnimatedBlur = Animated.createAnimatedComponent(BlurView);

interface IProps {
  image: any;
  onSelect?: (image: any, callback?: any, type?: 'add' | 'remove') => any;
  handlePreview?: (
    image: any,
    location: {pageX: number; pageY: number},
    size: number,
  ) => any;
}

interface IState {
  indexSelect?: number;
  isSelect: boolean;
}

class PreImage extends Component<IProps, IState> {
  animated: Animated.Value;
  location: any;
  view?: View | null;
  constructor(props: IProps) {
    super(props);
    this.state = {isSelect: false};
    this.animated = new Animated.Value(0);
  }

  shouldComponentUpdate(nProps: IProps, nState: IState) {
    const {image} = this.props;
    const {indexSelect} = this.state;
    return (
      image.localIdentifier !== nProps.image.localIdentifier ||
      indexSelect !== nState.indexSelect
    );
  }

  convertMinsToTime = (mins: number) => {
    let hours = Math.floor(mins / 60);
    let minutes: any = mins % 60;

    let number = Number(minutes.toFixed(0));
    if (number % 10 === 0) {
      number = number / 10;
    }
    minutes = minutes < 10 ? '0' + number : minutes.toFixed(0);
    return `${hours}:${minutes}`;
  };

  handleSelect = () => {
    const {image, onSelect} = this.props;
    const {indexSelect} = this.state;
    onSelect?.(
      image,
      (i?: number) => {
        animatedTiming(this.animated, i ? 1 : 0, 50).start();
        this.setState({indexSelect: i});
      },
      indexSelect !== undefined ? 'remove' : 'add',
    );
  };

  handlePreviewImage = () => {
    const {handlePreview, image} = this.props;
    this.view?.measure((_fx, _fy, _width, _height, px, py) => {
      this.location = {pageX: px, pageY: py};
      const {width} = appConnect;
      handlePreview?.(image, this.location, width / 4 - 2);
    });
  };

  handleLayout = () => {};

  render() {
    const {image} = this.props;
    const {indexSelect} = this.state;
    let time;
    if (image._assetObj.duration) {
      time = this.convertMinsToTime(image._assetObj.duration);
    }
    const {width} = appConnect;
    return (
      <Pressable
        delayLongPress={500}
        onLongPress={this.handlePreviewImage}
        onPress={this.handleSelect}>
        <View
          ref={ref => (this.view = ref)}
          style={[styles.view, {width: width / 4 - 2, height: width / 4 - 2}]}>
          <Image
            style={{width: width / 4 - 2, height: width / 4 - 2}}
            source={image.image}
          />
          {time ? (
            <View style={[styles.viewTime, {width: width / 4 - 2}]}>
              <IconIon name="videocam-outline" color="#fff" size={20} />
              <Text style={styles.colorTime}>{time}</Text>
            </View>
          ) : null}
          <AnimatedBlur
            blurType="light"
            blurAmount={1}
            style={[
              styles.viewSelect,
              {
                width: width / 4 - 2,
                height: width / 4 - 2,
                opacity: this.animated,
              },
            ]}>
            <View style={styles.viewIndex}>
              <Text style={styles.textSelect}>{indexSelect}</Text>
            </View>
          </AnimatedBlur>
        </View>
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    position: 'relative',
    margin: 1,
  },
  viewTime: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  colorTime: {
    color: '#fff',
    fontWeight: '600',
  },
  textSelect: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  viewSelect: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewIndex: {
    backgroundColor: backgroundIconChat,
    width: 30,
    height: 30,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PreImage;
