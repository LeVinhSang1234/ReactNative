import React, {Component, ReactNode, FC} from 'react';
import {
  TextInput,
  Animated,
  StyleSheet,
  NativeEventEmitter,
} from 'react-native';
import {connect} from 'react-redux';
import {translateText} from '../../translate';

const InputAnimated = Animated.createAnimatedComponent(TextInput);

export interface IProps {
  onChange?: (v?: any) => any;
  value?: any;
  placeholder?: string;
  error?: string | FC | ReactNode;
  height?: number | string;
  width?: number | string;
  onChangeText?: (v?: any) => any;
  type?: string;
  locale?: string;
  placeholderKeyTranslate?: string;
  defaultMessageTranslate?: string;
  onFocus?: (e: NativeEventEmitter) => any;
  onBlur?: (e: NativeEventEmitter) => any;
  disabled?: boolean;
}

interface IState {
  valueState?: string;
}

class Input extends Component<IProps, IState> {
  animated: Animated.Value;
  constructor(props: IProps) {
    super(props);
    this.animated = new Animated.Value(0);
    this.state = {valueState: undefined};
  }

  handleChange = (v: string) => {
    const {onChangeText, onChange, disabled} = this.props;
    if (disabled) return;
    this.setState({valueState: v});
    if (onChangeText) onChangeText(v);
    if (onChange) onChange(v);
  };

  handleFocus = (e: any) => {
    const {disabled} = this.props;
    Animated.timing(this.animated, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    const {onFocus} = this.props;
    if (typeof onFocus === 'function') {
      onFocus(e);
    }
  };

  handleBlur = (e: any) => {
    Animated.timing(this.animated, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    const {onBlur} = this.props;
    if (typeof onBlur === 'function') {
      onBlur(e);
    }
  };

  renderPlaceholder = (): string => {
    const {
      locale = '',
      placeholderKeyTranslate,
      defaultMessageTranslate = '',
    } = this.props;
    if (!placeholderKeyTranslate) return '';
    return translateText({
      id: placeholderKeyTranslate,
      defaultMessage: defaultMessageTranslate,
      locale,
    });
  };

  render() {
    const {error, height = 40, width = '100%', type, disabled} = this.props;
    const {valueState} = this.state;
    const placeholder = this.renderPlaceholder();
    let borderColor: any = '#ff4d4f';
    if (!error) {
      borderColor = this.animated.interpolate({
        inputRange: [0, 1],
        outputRange: ['#E1E1E1', '#21C0F6'],
      });
    }
    return (
      <InputAnimated
        editable={disabled}
        inputAccessoryViewID="nativeId"
        secureTextEntry={type === 'password'}
        onBlur={this.handleBlur}
        onChangeText={this.handleChange}
        value={valueState}
        placeholder={placeholder}
        onFocus={this.handleFocus}
        style={{...styles.input, height, width, borderColor}}
      />
    );
  }
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    paddingRight: 11,
    paddingLeft: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default connect(({language}: {language: {lang: string}}) => ({
  locale: language.lang,
}))(Input);
