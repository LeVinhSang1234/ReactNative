import React, {Component, ReactNode} from 'react';
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  View,
  ViewProps,
} from 'react-native';

const handleTouchStart = (e: GestureResponderEvent, paramThis: any) => {
  const {nativeEvent} = e;
  const {onTouchStart} = paramThis.props;
  onTouchStart?.(e);
  const {identifier, pageX, pageY} = nativeEvent;
  paramThis.touchZoom[identifier] = {
    pageX,
    pageY,
    start: {pageX, pageY},
  };
};

const handleTouchEnd = (e: GestureResponderEvent, paramThis: any) => {
  const {nativeEvent} = e;
  const {identifier} = nativeEvent;
  delete paramThis.touchZoom[identifier];
  const {onTouchEnd} = paramThis.props;
  onTouchEnd?.(e);
};

const handleTouchMove = (e: GestureResponderEvent, paramThis: any) => {
  const {nativeEvent} = e;
  const {
    onTouchMove,
    speed = 200,
    pointerAvailable = 1,
    allowZoom = 'auto',
  } = paramThis.props;
  onTouchMove?.(e);
  const {identifier, pageX, pageY} = nativeEvent;
  paramThis.touchZoom[identifier] = {
    pageX,
    pageY,
    start: {
      pageX: paramThis.touchZoom[identifier]?.pageX,
      pageY: paramThis.touchZoom[identifier]?.pageY,
    },
  };
  const {onZoom} = paramThis.props;
  const arrayKey = Object.keys(paramThis.touchZoom);
  if (!arrayKey.length || arrayKey.length < pointerAvailable) {
    onZoom?.(0, arrayKey.length);
    return;
  }
  let zoomNow;
  if (arrayKey.length < 2 || pointerAvailable === 1) {
    const keyNow = arrayKey[0];
    const {pageX, pageY, start} = paramThis.touchZoom[keyNow];
    const {pageX: pageXStart, pageY: pageYStart} = start;
    const changeX = Math.abs(pageX - pageXStart);
    const changeY = Math.abs(pageY - pageYStart);
    if ((changeY > changeX && allowZoom !== 'x') || allowZoom === 'y') {
      zoomNow =
        (pageY - pageYStart) / (Dimensions.get('window').height * speed);
    } else {
      zoomNow = (pageX - pageXStart) / (Dimensions.get('window').width * speed);
    }
  } else {
    const key1 = arrayKey[0];
    const key2 = arrayKey[1];
    const page1 = paramThis.touchZoom[key1];
    const {pageX: pageX1, pageY: pageY1, start: start1} = page1;
    const page2 = paramThis.touchZoom[key2];
    const {pageX: pageX2, pageY: pageY2, start: start2} = page2;
    if (!start1.pageX || !start2.pageX) {
      return;
    }
    const changeX = Math.abs(pageX1 - pageX2);
    const changeY = Math.abs(pageY1 - pageY2);
    const {pageX: pageXStart1, pageY: pageYStart1} = start1;
    const {pageX: pageXStart2, pageY: pageYStart2} = start2;
    if ((changeY > changeX && allowZoom !== 'x') || allowZoom === 'y') {
      const initY = Math.abs(pageYStart2 - pageYStart1);
      const nowY = Math.abs(pageY2 - pageY1);
      zoomNow = (nowY - initY) / (Dimensions.get('window').height * speed);
    } else {
      const initX = Math.abs(pageXStart2 - pageXStart1);
      const nowX = Math.abs(pageX2 - pageX1);
      zoomNow = (nowX - initX) / (Dimensions.get('window').width * speed);
    }
  }
  let zoomChange = paramThis.zoomPre + zoomNow;
  if (zoomChange < 0) {
    zoomChange = 0;
  }
  if (paramThis.zoomPre + zoomNow > 1) {
    zoomChange = 1;
  }
  if (paramThis.zoomPre !== zoomChange) {
    paramThis.zoomPre = zoomChange;
    onZoom?.(paramThis.zoomPre, arrayKey.length);
  }
};

interface IProps {
  onZoom?: (zoom: number, touchs: number) => any;
  speed?: number;
  pointerAvailable?: number;
  allowZoom?: 'auto' | 'x' | 'y';
  children: any;
}

interface ITouchZoom {
  [key: number | string]: {
    pageX: number;
    pageY: number;
    start: {pageX: number; pageY: number};
  };
}

class ZoomViewAnimated extends Component<
  IProps & Animated.WithAnimatedValue<ViewProps>
> {
  touchZoom: ITouchZoom;
  zoomPre: number;

  constructor(props: IProps & Animated.WithAnimatedValue<ViewProps>) {
    super(props);
    this.touchZoom = {};
    this.zoomPre = 0;
  }

  shouldComponentUpdate(nProps: IProps) {
    const {children} = this.props;
    return nProps.children !== children;
  }

  render(): ReactNode {
    const {children, ...props} = this.props;
    return (
      <Animated.View
        {...props}
        onTouchMove={e => handleTouchMove(e, this)}
        onTouchStart={e => handleTouchStart(e, this)}
        onTouchEnd={e => handleTouchEnd(e, this)}>
        {children}
      </Animated.View>
    );
  }
}

class ZoomView extends Component<IProps & ViewProps> {
  touchZoom: ITouchZoom;
  zoomPre: number;
  constructor(props: IProps & ViewProps) {
    super(props);
    this.touchZoom = {};
    this.zoomPre = 0;
  }

  shouldComponentUpdate(nProps: IProps) {
    const {children} = this.props;
    return nProps.children !== children;
  }

  render(): ReactNode {
    const {children, ...props} = this.props;
    return (
      <View
        {...props}
        onTouchMove={e => handleTouchMove(e, this)}
        onTouchStart={e => handleTouchStart(e, this)}
        onTouchEnd={e => handleTouchEnd(e, this)}>
        {children}
      </View>
    );
  }
}

const Zoom = {
  Animated: ZoomViewAnimated,
  View: ZoomView,
};

export default Zoom;
