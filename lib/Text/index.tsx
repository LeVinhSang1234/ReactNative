import React, {Component} from 'react';
import {Text as TextLibrary, TextProps} from 'react-native';

class Text extends Component<TextProps> {
  render() {
    return <TextLibrary {...this.props} />;
  }
}

export default Text;
