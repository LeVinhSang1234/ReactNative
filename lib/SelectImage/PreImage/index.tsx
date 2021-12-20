import React, {Component} from 'react';
import {appConnect} from '@/App';

import {Animated, Image, Pressable, StyleSheet, View} from 'react-native';
import Text from '@/lib/Text';
import IconIon from 'react-native-vector-icons/Ionicons';

interface IProps {
  image: any;
  onSelect?: (image: any) => any;
}

interface IState {}

class PreImage extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  shouldComponentUpdate(nProps: IProps, nState: IState) {
    const {image} = this.props;
    return image.localIdentifier !== nProps.image.localIdentifier;
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
    onSelect?.(image);
  };

  handlePreviewImage = () => {};

  render() {
    const {image} = this.props;
    let time;
    if (image._assetObj.duration) {
      time = this.convertMinsToTime(image._assetObj.duration);
    }
    const {width} = appConnect;
    return (
      <Pressable
        delayLongPress={1000}
        onLongPress={this.handlePreviewImage}
        onPress={this.handleSelect}>
        <Animated.View
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
        </Animated.View>
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
});

export default PreImage;
