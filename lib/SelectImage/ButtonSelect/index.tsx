import {appConnect} from '@/App';
import Text from '@/lib/Text';
import translate from '@/translate';
import {animatedSpringLayout} from '@/utils';
import bar from '@/utils/bar';
import {backgroundIconChat} from '@/utils/variables';
import React, {Component} from 'react';
import {Animated, StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

interface IProps {
  onSubmit?: (i: any[]) => any;
}

interface IState {
  images: any[];
  hidden: boolean;
}

class ButtonSelect extends Component<IProps, IState> {
  animatedView: Animated.Value | any;
  constructor(props: IProps) {
    super(props);
    this.animatedView = new Animated.Value(0);
    this.state = {images: [], hidden: true};
  }

  shouldComponentUpdate(_nProps: IProps, nState: IState) {
    const {hidden, images} = this.state;
    return hidden !== nState.hidden || images !== nState.images;
  }

  setImage = (image: any, callback?: any) => {
    const {images} = this.state;
    this.setState(
      {
        images: [...images, {image, index: images.length, callback}],
        hidden: false,
      },
      () => {
        callback?.(images.length + 1);
      },
    );
    if (!images.length) {
      animatedSpringLayout(this.animatedView, 1).start();
    }
  };

  removeImage = (image: any, callback?: any) => {
    const {images} = this.state;
    let index = 1;

    const newImage = images.reduce((current: any[], im: any) => {
      if (im.image?.localIdentifier !== image.localIdentifier) {
        im.callback?.(index);
        current.push({...im, index});
        index++;
      }
      return current;
    }, []);
    this.setState({images: newImage}, () => callback?.(undefined));
    if (!newImage.length) {
      animatedSpringLayout(this.animatedView, 0).start(({finished}) => {
        if (finished) {
          this.setState({hidden: true});
        }
      });
    }
  };

  resetImage = () => {
    const {images} = this.state;
    this.setState({hidden: true, images: []});
    const promise = images.map(async image => image.callback?.(undefined));
    Promise.all(promise);
    this.animatedView._value = 0;
  };

  onSubmit = () => {
    const {images} = this.state;
    const {onSubmit} = this.props;
    const newImages = images.map(i => {
      i.callback?.(undefined);
      return i.image;
    });
    this.setState({images: [], hidden: true});
    onSubmit?.(newImages);
  };

  render() {
    const {images, hidden} = this.state;
    if (hidden) {
      return null;
    }
    const {width} = appConnect;
    const translateY = this.animatedView.interpolate({
      inputRange: [0, 1],
      outputRange: [-46 - bar.navbarHeight, 20],
    });

    return (
      <Animated.View
        style={[
          styles.viewButtonSelect,
          {
            width,
            opacity: this.animatedView,
            bottom: translateY,
          },
        ]}>
        <TouchableOpacity
          onPress={this.onSubmit}
          style={[styles.buttonSelect, {width: width - 32}]}
          activeOpacity={0.9}>
          <Text style={styles.textSelect}>
            {translate({
              id: 'screen.list_image.button_select_image',
              defaultValue: 'Chọn {{file_number}} tệp',
              values: {file_number: images.length},
            })}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  viewButtonSelect: {
    position: 'absolute',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSelect: {
    backgroundColor: backgroundIconChat,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  textSelect: {
    fontWeight: '600',
    fontSize: 17,
    color: '#fff',
  },
});

export default ButtonSelect;
