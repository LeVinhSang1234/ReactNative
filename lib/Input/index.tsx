import translate from '@/translate';
import {animatedTiming} from '@/utils';
import React, {Component, ReactNode, FC} from 'react';
import {TextInput, Animated, StyleSheet, TextInputProps} from 'react-native';
import {connect} from 'react-redux';

const InputAnimated = Animated.createAnimatedComponent(TextInput);

export interface IProps extends TextInputProps {
  error?: string | FC | ReactNode;
  height?: number | string;
  width?: number | string;
  locale?: string;
  placeholderKeyTranslate?: string;
  defaultMessageTranslate?: string;
  disabled?: boolean;
}

interface IState {}

class Input extends Component<IProps, IState> {
  animated: Animated.Value;
  constructor(props: IProps) {
    super(props);
    this.animated = new Animated.Value(0);
  }

  shouldComponentUpdate(nProps: IProps) {
    const {value, error} = this.props;
    return value !== nProps.value || error !== nProps.error;
  }

  handleChange = (v: string) => {
    const {onChangeText, disabled} = this.props;
    if (disabled) {
      return;
    }
    onChangeText?.(v);
  };

  handleFocus = (e: any) => {
    const {disabled, error} = this.props;
    if (disabled) {
      return;
    }
    if (!error) {
      animatedTiming(this.animated, 1, 200).start();
    }
    const {onFocus} = this.props;
    if (typeof onFocus === 'function') {
      onFocus(e);
    }
  };

  handleBlur = (e: any) => {
    const {disabled, error} = this.props;
    if (disabled) {
      return;
    }
    if (!error) {
      animatedTiming(this.animated, 0, 200).start();
    }
    const {onBlur} = this.props;
    if (typeof onBlur === 'function') {
      onBlur(e);
    }
  };

  renderPlaceholder = (): string => {
    const {placeholderKeyTranslate, defaultMessageTranslate = ''} = this.props;
    if (!placeholderKeyTranslate) {
      return '';
    }
    return translate({
      id: placeholderKeyTranslate,
      defaultValue: defaultMessageTranslate,
    });
  };

  render() {
    const {
      height = 40,
      width = '100%',
      disabled,
      error,
      value,
      defaultValue,
      style,
      ...props
    } = this.props;
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
        importantForAutofill="no"
        autoCorrect={false}
        autoCapitalize="none"
        autoCompleteType="off"
        editable={disabled}
        {...props}
        onBlur={this.handleBlur}
        onChangeText={this.handleChange}
        onChange={() => null}
        value={value || defaultValue}
        placeholder={placeholder}
        onFocus={this.handleFocus}
        style={[styles.input, style, {height, width, borderColor}]}
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
