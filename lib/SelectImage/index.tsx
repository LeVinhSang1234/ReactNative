import bar from '@/utils/bar';
import {appConnect} from '@/utils/globalScreen';
import React, {Component, Fragment} from 'react';
import {ScrollView, TouchableNativeFeedback, View} from 'react-native';
import {Animated, KeyboardEvent, StyleSheet} from 'react-native';
import RNPhotosFramework from 'rn-photos-framework';
import KeyboardListener from '../KeyboardListener';
import Text from '../Text';
import ViewMove from '../ViewMove';

interface IState {
  permission: boolean;
  loading: boolean;
  heightInit: number;
}

interface IProps {
  toggleKeyboard?: (h?: number, animated?: boolean) => any;
  openWhenShowKeyboard?: boolean;
  fullScreen?: boolean;
}

const initHeight = 260 + bar.navbarHeight;

class SelectImage extends Component<IProps, IState> {
  dataTracking: any;
  animatedBackdropOpacity: Animated.Value;
  animatedBackdropHeight: Animated.Value;
  animatedHeight: Animated.Value | any;
  opacityChild: Animated.Value;
  heightDrag: Animated.Value;
  isOpen: boolean;
  isUpMove: boolean;
  maxHeightModal: number;
  scrollYNow: number;
  scrollEnd: boolean;
  forceDrag: boolean;
  detectMove: boolean;

  constructor(props: IProps) {
    super(props);
    const {fullScreen} = props;
    const {height} = appConnect;
    this.state = {
      loading: true,
      permission: false,
      heightInit: 0,
    };
    this.animatedBackdropOpacity = new Animated.Value(0);
    this.animatedBackdropHeight = new Animated.Value(0);
    this.animatedHeight = new Animated.Value(0);
    this.opacityChild = new Animated.Value(0);
    this.heightDrag = new Animated.Value(13);
    this.isOpen = false;
    this.isUpMove = false;
    this.maxHeightModal = height - (fullScreen ? 0 : 90);
    this.scrollYNow = 0;
    this.scrollEnd = false;
    this.forceDrag = false;
    this.detectMove = false;
  }

  async UNSAFE_componentWillMount() {
    const {isAuthorized} = await RNPhotosFramework.authorizationStatus();
    this.setState({permission: isAuthorized});
    // try {
    //   const permission = await RNPhotosFramework.requestAuthorization();
    //   if (!permission.isAuthorized) {
    //     return;
    //   }
    //   const data = await RNPhotosFramework.getAlbumsMany(
    //     [
    //       {
    //         type: 'smartAlbum',
    //         subType: 'smartAlbumUserLibrary',
    //         assetCount: 'exact',
    //         fetchOptions: {
    //           sortDescriptors: [
    //             {
    //               key: 'title',
    //               ascending: true,
    //             },
    //           ],
    //           includeHiddenAssets: false,
    //           includeAllBurstAssets: false,
    //         },
    //         trackInsertsAndDeletes: true,
    //         trackChanges: false,
    //       },
    //     ],
    //     true,
    //   );
    //   this.dataTracking = data;
    //   console.log(data.albums);
    // } catch (e) {
    //   throwException(e);
    // }
  }

  componentWillUnmount() {}

  open = () => {
    this.opacity(1);
    if (this.isOpen) {
      return;
    }
    this.isOpen = true;
    const {toggleKeyboard} = this.props;
    const {heightInit} = this.state;
    toggleKeyboard?.(heightInit || initHeight);
    this.toggle(heightInit || initHeight);
  };

  close = () => {
    this.isOpen = false;
    const {toggleKeyboard} = this.props;
    toggleKeyboard?.(0);
    this.toggle(0);
  };

  opacity = (toValue: 0 | 1) => {
    Animated.spring(this.opacityChild, {
      toValue: toValue,
      bounciness: 0,
      overshootClamping: true,
      useNativeDriver: false,
    }).start();
  };

  toggle = (height: number = 0) => {
    Animated.spring(this.animatedHeight, {
      toValue: height,
      bounciness: 0,
      overshootClamping: true,
      useNativeDriver: false,
    }).start();
  };

  handleShowKeyboard = (e: KeyboardEvent) => {
    this.opacity(0);
    const {heightInit} = this.state;
    const {openWhenShowKeyboard} = this.props;
    const {height} = e.endCoordinates;
    if (this.isOpen || (openWhenShowKeyboard && !this.isOpen)) {
      this.toggle(height);
    }
    if (heightInit !== 0) {
      return;
    }
    this.setState({heightInit: height});
  };

  handleMove = (yChange: number) => {
    const y = this.animatedHeight._value - yChange;
    const {height} = appConnect;
    const {heightInit} = this.state;
    const {toggleKeyboard} = this.props;
    this.isUpMove = yChange < 0;
    this.detectMove = false;
    if (y >= height - 80) {
      return;
    }
    if (this.isUpMove && !this.scrollEnd && !this.forceDrag) {
      return;
    }
    if (!this.isUpMove && this.scrollYNow > 0 && !this.forceDrag) {
      return;
    }
    this.detectMove = true;
    Animated.parallel([
      Animated.timing(this.animatedHeight, {
        toValue: y,
        duration: 10,
        useNativeDriver: false,
      }),
      Animated.timing(this.animatedBackdropHeight, {
        toValue: y > (heightInit || initHeight) ? appConnect.height : 0,
        duration: 0,
        useNativeDriver: false,
      }),
      Animated.timing(this.animatedBackdropOpacity, {
        toValue: y / height - 0.4,
        duration: 10,
        useNativeDriver: false,
      }),
    ]).start();
    if (y <= (heightInit || initHeight)) {
      toggleKeyboard?.(y, false);
    }
  };

  handleMoveEnd = () => {
    if (!this.detectMove) {
      return;
    }
    const yChange = this.animatedHeight._value;
    const {heightInit} = this.state;
    if (yChange >= (heightInit || initHeight)) {
      if (this.isUpMove) {
        this.handleOpenModal();
      } else {
        this.handleCloseInit();
      }
    } else {
      this.handleClose();
    }
  };

  handleOpenModal = () => {
    Animated.parallel([
      Animated.spring(this.animatedHeight, {
        toValue: this.maxHeightModal,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
      Animated.spring(this.animatedBackdropOpacity, {
        toValue: 0.5,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
    ]).start();
  };

  handleCloseInit = () => {
    const {heightInit} = this.state;
    Animated.parallel([
      Animated.spring(this.animatedHeight, {
        toValue: heightInit || initHeight,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
      Animated.spring(this.animatedBackdropOpacity, {
        toValue: 0,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
    ]).start();
  };

  handleClose = () => {
    this.close();
  };

  isScrollEnd = ({layoutMeasurement, contentOffset, contentSize}: any) => {
    const paddingToBottom = 0;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  handleScroll = ({nativeEvent}: any) => {
    const {contentOffset} = nativeEvent;
    this.scrollYNow = contentOffset.y;
    this.scrollEnd = this.isScrollEnd(nativeEvent);
  };

  render() {
    const {width} = appConnect;
    return (
      <Fragment>
        <Animated.View
          style={[
            styles.viewBackdrop,
            {
              height: this.animatedBackdropHeight,
              opacity: this.animatedBackdropOpacity,
              width,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.viewSelect,
            styles.shadow,
            {height: this.animatedHeight, opacity: this.opacityChild, width},
          ]}>
          <ViewMove onMove={this.handleMove} onMoveEnd={this.handleMoveEnd}>
            <Animated.View
              onTouchStart={() => {
                this.forceDrag = true;
              }}
              onTouchEnd={() => {
                this.forceDrag = false;
              }}
              style={[styles.previewDrag, {height: this.heightDrag, width}]}>
              <View style={[styles.flexCenter, {width}]}>
                <View style={styles.dropDrag} />
              </View>
            </Animated.View>
            <ScrollView onScroll={this.handleScroll} scrollEventThrottle={16}>
              <View>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
                <Text>Sang Test Hahahahahaahahahahha</Text>
              </View>
            </ScrollView>
          </ViewMove>
        </Animated.View>
        <KeyboardListener onWillShow={this.handleShowKeyboard} />
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  viewBackdrop: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,1)',
    bottom: 0,
  },
  viewSelect: {
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
    paddingBottom: bar.navbarHeight,
    backgroundColor: '#fff',
  },
  shadow: {
    borderTopWidth: 2,
    borderTopColor: '#f8f8f8',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  previewDrag: {
    marginTop: 8,
  },
  dropDrag: {
    backgroundColor: '#a6a6a6',
    opacity: 0.7,
    height: 5,
    width: 40,
    borderRadius: 8,
  },
  flexCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgroundWhite: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flex: 1,
  },
});

export interface SImage extends SelectImage {}

export default SelectImage;
