import {appConnect} from '@/App';
import translate from '@/translate';
import {throwException, unMount} from '@/utils';
import bar from '@/utils/bar';
import {backgroundIconChat} from '@/utils/variables';
import React, {Component, Fragment} from 'react';
import {FlatList, Pressable, View} from 'react-native';
import {Animated, KeyboardEvent, StyleSheet} from 'react-native';
import RNPhotosFramework from 'rn-photos-framework';
import KeyboardListener from '../KeyboardListener';
import Spin from '../Spin';
import Text from '../Text';
import ViewMove from '../ViewMove';
import Album from './Album';
import PreImage from './PreImage';

interface IProps {
  toggleKeyboard?: (h?: number, animated?: boolean) => any;
  openWhenShowKeyboard?: boolean;
  fullScreen?: boolean;
  backgroundColor?: string;
  hiddenStatusBarWhenOpen?: boolean;
  spaceTopWhenFullScreen?: number;
  colorText?: string;
  description?: string;
  maxPoint?: number;
  onSelect?: (image: any) => any;
}
interface IState {
  permission: {isAuthorized: boolean; status?: string};
  loading: boolean;
  heightInit: number;
  album: any;
  photos: any[];
  scrollEnable: boolean;
  albums: any[];
}

const initHeight = 260;
const maxHeightDrag = 37;

class SelectImage extends Component<IProps, IState> {
  dataTracking: any;
  animatedBackdropOpacity: Animated.Value;
  animatedBackdropHeight: Animated.Value;
  animatedHeight: Animated.Value | any;
  opacityChild: Animated.Value;
  heightDrag: Animated.Value;
  heightDragScale: Animated.Value;
  isOpen: boolean;
  isUpMove: boolean;
  maxHeightModal: number;
  scrollYNow: number;
  scrollEnd: boolean;
  forceDrag: boolean;
  detectMove: boolean;
  flatList?: FlatList<any> | null;
  unSubAlbum: any;
  album?: Album | null;

  constructor(props: IProps) {
    super(props);
    const {fullScreen, maxPoint} = props;
    const {height} = appConnect;
    this.state = {
      loading: true,
      permission: {isAuthorized: false, status: ''},
      heightInit: 0,
      album: undefined,
      photos: [],
      scrollEnable: true,
      albums: [],
    };
    this.animatedBackdropOpacity = new Animated.Value(0);
    this.animatedBackdropHeight = new Animated.Value(0);
    this.animatedHeight = new Animated.Value(0);
    this.opacityChild = new Animated.Value(0);
    this.heightDrag = new Animated.Value(0);
    this.heightDragScale = new Animated.Value(0);
    this.isOpen = false;
    this.isUpMove = false;
    this.maxHeightModal = maxPoint || height - (fullScreen ? 0 : 70);
    this.scrollYNow = 0;
    this.scrollEnd = false;
    this.forceDrag = false;
    this.detectMove = false;
  }

  async UNSAFE_componentWillMount() {
    const permission = await RNPhotosFramework.authorizationStatus();
    const {isAuthorized} = permission;
    if (isAuthorized) {
      await this.handleGetAlbum();
    } else {
      this.setState({permission, loading: false});
    }
  }

  shouldComponentUpdate(_nProps: IProps, nState: any) {
    const state: any = this.state;
    return Object.keys(this.state).some(key => state[key] !== nState[key]);
  }

  componentWillUnmount() {
    this.unSubAlbum?.();
    Animated.timing(this.animatedBackdropHeight, {
      toValue: 0,
      useNativeDriver: false,
      duration: 0,
    }).start();
    this.close();
    unMount(this);
  }

  handleAuthor = async () => {
    const permission = await RNPhotosFramework.requestAuthorization();
    if (!permission.isAuthorized) {
      return this.setState({permission});
    }
    await this.handleGetAlbum();
  };

  handleGetAlbum = async () => {
    const {loading} = this.state;
    if (!loading) {
      this.setState({loading: true});
    }

    try {
      const data = await RNPhotosFramework.getAlbumsMany(
        [
          {
            type: 'smartAlbum',
            subType: 'any',
            assetCount: 'exact',
            fetchOptions: {
              sortDescriptors: [
                {
                  key: 'title',
                  ascending: true,
                },
              ],
              includeHiddenAssets: false,
              includeAllBurstAssets: false,
            },
            previewAssets: 1,
          },
          {
            type: 'album',
            subType: 'any',
            assetCount: 'exact',
            fetchOptions: {
              sortDescriptors: [
                {
                  key: 'title',
                  ascending: false,
                },
              ],
              includeHiddenAssets: false,
              includeAllBurstAssets: false,
            },
            previewAssets: 1,
          },
        ],
        true,
      );
      const albumSort = data.albums
        .filter((e: any) => e.assetCount)
        .sort?.((a: any, b: any) => (b.assetCount > a.assetCount ? 1 : -1));
      const albumActive = albumSort[0];
      const photos = await this.handleGetPhotos(albumActive);
      this.setState({
        permission: {isAuthorized: true},
        loading: false,
        album: albumActive,
        photos,
        albums: albumSort,
      });
    } catch (e) {
      throwException(e);
    }
  };

  handleSelectAlbum = async (albumItem: any) => {
    this.flatList?.scrollToOffset?.({animated: false, offset: 0});
    this.setState({loading: true});
    const photos = await this.handleGetPhotos(albumItem);
    this.setState({loading: false, album: albumItem, photos});
  };

  handleGetPhotos = async (album: any) => {
    const {loading} = this.state;
    if (!loading) {
      this.setState({loading: true});
    }
    const {assets} = await this.getAssets(album);
    return assets;
  };

  getAssets = async (album: any) => {
    const data = await album.getAssets({
      startIndex: 0,
      endIndex: album.assetCount,
      trackInsertsAndDeletes: true,
      trackChanges: false,
    });
    this.unSubAlbum?.();
    album.onChange(async (changeDetails: any, update: any) => {
      const {photos} = this.state;
      if (changeDetails.hasIncrementalChanges) {
        update(photos, (updatedAssetArray: any[]) => {
          this.setState({photos: updatedAssetArray});
        });
      }
    });
    this.unSubAlbum = () => album.stopTracking();
    return data;
  };

  open = () => {
    this.opacity(1);
    if (this.isOpen) {
      return;
    }
    this.isOpen = true;
    const {toggleKeyboard, fullScreen} = this.props;
    if (fullScreen) {
      return this.handleOpenModal();
    }
    const {heightInit} = this.state;
    const heightBase = heightInit || initHeight;
    toggleKeyboard?.(heightBase);
    this.toggle(heightBase + bar.navbarHeight);
  };

  close = () => {
    this.isOpen = false;
    const {toggleKeyboard} = this.props;
    toggleKeyboard?.(0);
    this.toggle(0);
    Animated.spring(this.opacityChild, {
      toValue: 0,
      bounciness: 0,
      overshootClamping: true,
      useNativeDriver: false,
    }).start();
    this.flatList?.scrollToOffset?.({animated: false, offset: 0});
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
    const {toggleKeyboard, fullScreen} = this.props;
    const y = this.animatedHeight._value - yChange;
    const {height} = appConnect;
    const {heightInit, scrollEnable} = this.state;
    this.isUpMove = yChange < 0;
    if (y >= this.maxHeightModal) {
      return;
    }
    if (scrollEnable) {
      if (this.isUpMove && !this.scrollEnd && !this.forceDrag) {
        return;
      }
      if (!this.isUpMove && this.scrollYNow > 0 && !this.forceDrag) {
        return;
      }
      this.setState({scrollEnable: false});
    }
    const heightIntBase = (heightInit || initHeight) + bar.navbarHeight;
    let scalce = (y - heightIntBase) / (this.maxHeightModal - heightIntBase);
    if (scalce <= 0) {
      scalce = 0;
    } else if (scalce >= 1) {
      scalce = 1;
    }
    this.detectMove = true;
    Animated.parallel([
      Animated.timing(this.animatedHeight, {
        toValue: y,
        duration: 10,
        useNativeDriver: false,
      }),
      Animated.timing(this.animatedBackdropHeight, {
        toValue: y > heightIntBase ? appConnect.height : 0,
        duration: 0,
        useNativeDriver: false,
      }),
      Animated.timing(this.animatedBackdropOpacity, {
        toValue: y / height - 0.4,
        duration: 30,
        useNativeDriver: false,
      }),
      Animated.timing(this.heightDrag, {
        toValue: scalce * maxHeightDrag,
        duration: 0,
        useNativeDriver: false,
      }),
      Animated.timing(this.heightDragScale, {
        toValue: scalce,
        duration: 0,
        useNativeDriver: false,
      }),
    ]).start();
    if (y <= heightIntBase && !fullScreen) {
      toggleKeyboard?.(y, false);
    }
  };

  handleMoveEnd = () => {
    if (!this.detectMove) {
      return;
    }
    const {scrollEnable} = this.state;
    if (scrollEnable) {
      return;
    }
    if (!scrollEnable) {
      this.setState({scrollEnable: true});
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
      this.close();
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
      Animated.spring(this.heightDrag, {
        toValue: maxHeightDrag,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
      Animated.spring(this.heightDragScale, {
        toValue: 1,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
    ]).start();
  };

  handleCloseInit = () => {
    const {heightInit} = this.state;
    const {fullScreen, toggleKeyboard} = this.props;
    let heightBase = heightInit || initHeight;
    if (fullScreen) {
      heightBase = 0;
    }
    if (fullScreen) {
      Animated.timing(this.animatedBackdropHeight, {
        toValue: 0,
        useNativeDriver: false,
        duration: 0,
      }).start();
      this.close();
    }
    toggleKeyboard?.(heightBase);
    Animated.parallel([
      Animated.spring(this.animatedHeight, {
        toValue: heightBase + bar.navbarHeight,
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
      Animated.spring(this.heightDrag, {
        toValue: 0,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
      Animated.spring(this.heightDragScale, {
        toValue: 0,
        bounciness: 0,
        overshootClamping: true,
        useNativeDriver: false,
      }),
    ]).start(({finished}) => {
      if (finished && !fullScreen) {
        Animated.timing(this.animatedBackdropHeight, {
          toValue: 0,
          useNativeDriver: false,
          duration: 0,
        }).start();
      }
    });
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

  handleHideKeyboard = () => {
    Animated.timing(this.animatedBackdropHeight, {
      toValue: 0,
      duration: 0,
      useNativeDriver: false,
    }).start();
  };

  renderItem = ({item}: any) => {
    const {onSelect} = this.props;
    return <PreImage onSelect={onSelect} image={item} />;
  };

  render() {
    const {width} = appConnect;
    const {permission, loading, photos, scrollEnable, album, albums} =
      this.state;
    const {
      fullScreen,
      backgroundColor = fullScreen ? '#000' : '#fff',
      spaceTopWhenFullScreen = bar.height - 10,
      colorText = fullScreen ? '#fff' : backgroundIconChat,
      description,
    } = this.props;
    const colorAlbum = fullScreen ? colorText : '#23071c';

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
            fullScreen ? {} : styles.shadow,
            {
              height: this.animatedHeight,
              opacity: this.opacityChild,
              width,
              backgroundColor,
            },
          ]}>
          <Spin spinning={loading} backgroundColor={backgroundColor}>
            <ViewMove onMove={this.handleMove} onMoveEnd={this.handleMoveEnd}>
              <View
                onTouchStart={() => (this.forceDrag = true)}
                onTouchEnd={() => (this.forceDrag = false)}
                style={[
                  styles.previewDrag,
                  {width, paddingTop: fullScreen ? spaceTopWhenFullScreen : 8},
                ]}>
                {fullScreen ? null : (
                  <View style={[styles.flexCenter, {width}]}>
                    <View style={styles.dropDrag} />
                  </View>
                )}
                <Animated.View
                  style={[
                    styles.viewListAlbum,
                    {
                      width,
                      height: this.heightDrag,
                      transform: [{scaleY: this.heightDragScale}],
                    },
                  ]}>
                  <Pressable onPress={this.handleCloseInit}>
                    <View style={styles.buttonCancel}>
                      <Text
                        style={[styles.ml5, styles.fw5, {color: colorText}]}>
                        {translate({
                          id: 'screen.list_image.button.cancel',
                          defaultValue: 'Huỷ',
                        })}
                      </Text>
                    </View>
                  </Pressable>
                  <View>
                    <Text
                      style={[
                        styles.textCenter,
                        styles.textAlbum,
                        {color: colorAlbum},
                      ]}>
                      {album?.title ||
                        translate({
                          id: 'screen.list_image.title_image_default',
                          defaultValue: 'Ảnh',
                        })}
                    </Text>
                    {description ? (
                      <Text
                        style={[styles.textCenter, styles.albumDescription]}>
                        {description}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => {
                      this.album?.open?.();
                    }}>
                    <View style={[styles.buttonCancel, styles.justiEnd]}>
                      {permission.isAuthorized ? (
                        <Text
                          style={[
                            styles.pr5,
                            styles.fw5,
                            styles.alignRight,
                            {color: colorText},
                          ]}>
                          {translate({
                            id: 'screen.list_image.button.open_list_album',
                            defaultValue: 'Album',
                          })}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                </Animated.View>
              </View>
              {permission.isAuthorized ? (
                <FlatList
                  getItemLayout={(_data, index) => ({
                    length: width / 4 - 2,
                    offset: (width / 4 - 2) * index,
                    index,
                  })}
                  ref={ref => (this.flatList = ref)}
                  scrollEnabled={scrollEnable}
                  numColumns={4}
                  onScroll={this.handleScroll}
                  scrollEventThrottle={16}
                  data={photos}
                  renderItem={this.renderItem}
                  keyExtractor={item => item.localIdentifier}
                />
              ) : (
                <View style={styles.viewPermission}>
                  {loading ? null : permission.status === 'notDetermined' ? (
                    <View style={styles.viewAddPermission}>
                      <Text
                        style={[
                          styles.textCenter,
                          styles.titleMessagePermission,
                        ]}>
                        {translate({
                          id: 'screen.list_image.title_add_permission_library',
                          defaultValue:
                            'Quyền truy cập vào ảnh và video của bạn',
                        })}
                      </Text>
                      <Text style={[styles.textCenter, styles.mb2]}>
                        {translate({
                          id: 'screen.list_image.title_add_permission_description1',
                          defaultValue:
                            'Cho phép App truy cập vào ảnh và video',
                        })}
                      </Text>
                      <Text style={[styles.textCenter, styles.mb20]}>
                        {translate({
                          id: 'screen.list_image.title_add_permission_description2',
                          defaultValue: 'để bạn có thể chia sẻ với bạn bè',
                        })}
                      </Text>
                      <Pressable onPress={this.handleAuthor}>
                        <Text
                          style={[
                            styles.textCenter,
                            styles.buttonAddPermission,
                          ]}>
                          {translate({
                            id: 'screen.list_image.button_add_permission',
                            defaultValue: 'Cho phép truy cập',
                          })}
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Text>
                      {translate({
                        id: 'screen.list_image.permission_library_photo_denied',
                        defaultValue:
                          'Vui lòng cấp quyền truy cập Ảnh và Video trong cài đặt',
                      })}
                    </Text>
                  )}
                </View>
              )}
            </ViewMove>
          </Spin>
        </Animated.View>
        <Album
          onSelect={this.handleSelectAlbum}
          colorAlbum={colorAlbum}
          color={colorText}
          backgroundColor={backgroundColor}
          album={album}
          albums={albums}
          ref={ref => (this.album = ref)}
        />
        <KeyboardListener
          onWillHide={this.handleHideKeyboard}
          onWillShow={this.handleShowKeyboard}
        />
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
  },
  shadow: {
    borderTopWidth: 2,
    borderTopColor: '#f8f8f8',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  previewDrag: {
    paddingVertical: 8,
    overflow: 'hidden',
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
  viewPermission: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCenter: {
    textAlign: 'center',
    color: '#2b1624',
  },
  titleMessagePermission: {
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 15,
  },
  mb2: {
    marginBottom: 2,
  },
  mb20: {
    marginBottom: 20,
  },
  viewAddPermission: {
    paddingHorizontal: 30,
  },
  buttonAddPermission: {
    fontWeight: '600',
    color: '#4378ec',
  },
  viewListAlbum: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 1,
    overflow: 'hidden',
  },
  buttonCancel: {
    width: 70,
    height: maxHeightDrag,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ml5: {
    marginLeft: 15,
  },
  pr5: {
    paddingRight: 15,
  },
  w60: {},
  alignRight: {
    textAlign: 'right',
  },
  textAlbum: {
    fontWeight: '700',
    fontSize: 17,
  },
  albumDescription: {
    color: '#aaa4a6',
  },
  fw5: {
    fontWeight: '600',
  },
  justiEnd: {
    justifyContent: 'flex-end',
  },
});

export interface SImage extends SelectImage {}

export default SelectImage;
