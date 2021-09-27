import React, {useEffect, useMemo, useState} from 'react';
import {Component} from 'react';
import {Text, Animated, StyleSheet, View, ViewStyle} from 'react-native';
import {SvgXml} from 'react-native-svg';
import IconMessageSuccess from '../../assets/img/icon_success_message.svg';
import IconMessageError from '../../assets/img/icon_error_message.svg';
import IconMessageWarning from '../../assets/img/icon_warning_message.svg';
import IconMessageInfo from '../../assets/img/icon_info_message.svg';

export interface IMessage {
  maxCount?: number;
  success: (
    props: {content: string | any; style?: ViewStyle},
    duration?: number,
  ) => any;
  warning: (
    props: {content: string | any; style?: ViewStyle},
    duration?: number,
  ) => any;
  error: (
    props: {content: string | any; style?: ViewStyle},
    duration?: number,
  ) => any;
  info: (
    props: {content: string | any; style?: ViewStyle},
    duration?: number,
  ) => any;
  startMessage?: number;
}

let message: IMessage = {
  success: () => {},
  warning: () => {},
  error: () => {},
  info: () => {},
  startMessage: 31,
};
let timeout: any = {};
let setDrw: (v: any) => any = () => {};

class Message extends Component<any, any> {
  static useMessage: () => IMessage;
  static create: () => (WrapComponent: any) => (props: any) => JSX.Element;
  constructor(props: any) {
    super(props);
    this.state = {messages: []};
    message = {
      ...message,
      success: this.addSuccess,
      warning: this.addWarning,
      error: this.addError,
      info: this.addInfo,
      maxCount: undefined,
    };
    setDrw(message);
  }

  addMessage = (
    props: {content: string | any; style: ViewStyle | any},
    duration: number,
    type: string,
  ) => {
    const {messages} = this.state;
    const {content = '', style} = props;
    const fadeAnim = new Animated.Value(0);
    const id = random(40);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    const newMessage = {
      id,
      content,
      style,
      animated: fadeAnim,
      type,
    };
    if (message.maxCount && messages.length >= message.maxCount) {
      const message = messages.shift();
      if (timeout[message.id]) {
        clearTimeout(timeout[message.id]);
        delete timeout[message.id];
      }
      this.setState({messages: [...messages, newMessage]});
    } else {
      this.setState({messages: [...messages, newMessage]});
    }
    timeout[id] = setTimeout(() => {
      const {messages: messagesState} = this.state;
      let newMess = messagesState.filter((el: any) => el.id !== id);
      this.setState({messages: newMess});
      timeout[id] = null;
    }, duration);
  };

  addSuccess = (props: any, duration = 3000) => {
    this.addMessage(props, duration, 'success');
  };

  addWarning = (props: any, duration = 3000) => {
    this.addMessage(props, duration, 'warning');
  };

  addError = (props: any, duration = 3000) => {
    this.addMessage(props, duration, 'error');
  };

  addInfo = (props: any, duration = 3000) => {
    this.addMessage(props, duration, 'info');
  };

  render() {
    const {messages} = this.state;
    return messages.map((el: any, index: number) => {
      const top = el.animated.interpolate({
        inputRange: [0, 1],
        outputRange: [
          index * 61 + (message.startMessage || 0),
          (index + 1) * 38 + index * 20 + (message.startMessage || 0),
        ],
      });
      let icon = IconMessageSuccess;
      if (el.type === 'warning') {
        icon = IconMessageWarning;
      } else if (el.type === 'error') {
        icon = IconMessageError;
      } else if (el.type === 'info') {
        icon = IconMessageInfo;
      }
      return (
        <Animated.View key={el.id} style={{...styles.message, top}}>
          <View
            style={{
              ...styles.viewContent,
              ...el.style,
            }}>
            <SvgXml width={16} height={16} xml={icon} />
            <Text
              numberOfLines={1}
              style={{marginLeft: 10, flexDirection: 'row'}}>
              {el.content}
            </Text>
          </View>
        </Animated.View>
      );
    });
  }
}

const styles = StyleSheet.create({
  message: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 0,
    overflow: 'visible',
    zIndex: 10000,
  },
  viewContent: {
    overflow: 'visible',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    height: 38,
    borderRadius: 4,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 10,
    paddingRight: 16,
    paddingLeft: 16,
    maxWidth: '90%',
    zIndex: 1,
  },
});

Message.create = () => {
  return (WrapComponent: any) => (props: any) => {
    const [drw, set] = useState(message);
    useMemo(() => {
      setDrw = set;
    }, []);
    useEffect(() => {
      return () => {
        setDrw = () => {};
      };
    }, []);
    return <WrapComponent {...props} message={drw} />;
  };
};

Message.useMessage = () => message;

export default Message;

function random(length: number) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
