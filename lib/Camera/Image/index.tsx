import React, {Component} from 'react';
import {ImageResizeMode, ImageStyle, StyleProp} from 'react-native';
import {Image as ImageLibrary, ImageSourcePropType} from 'react-native';

interface IState {
  image: any;
}

interface IProps {
  source?: ImageSourcePropType;
  style?: StyleProp<ImageStyle> | undefined;
  resizeMode?: ImageResizeMode | undefined;
  borderRadius?: number;
}

class ImageCamera extends Component<IProps, IState> {
  state = {image: undefined};

  shouldComponentUpdate(_nProps: IProps, nState: IState) {
    const {image} = this.state;
    return image !== nState.image;
  }

  setImage = (image: any) => {
    this.setState({image});
  };

  render() {
    const {image: imageState} = this.state;
    if (!imageState) {
      return null;
    }
    const {image, _imageRef} = imageState;
    return <ImageLibrary source={image || _imageRef} {...this.props} />;
  }
}

export default ImageCamera;
