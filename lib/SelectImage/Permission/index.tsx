import Text from '@/lib/Text';
import translate from '@/translate';
import React, {Component} from 'react';
import {Linking, Pressable, StyleSheet, View} from 'react-native';

interface IProps {
  handleAuthor?: () => any;
  initPermission?: boolean;
}

class Permission extends Component<IProps> {
  shouldComponentUpdate(nProps: IProps) {
    const {initPermission} = this.props;
    return initPermission !== nProps.initPermission;
  }

  openSetting = () => {
    Linking.openSettings();
  };

  render() {
    const {handleAuthor, initPermission} = this.props;
    return (
      <View style={styles.viewPermission}>
        {initPermission ? (
          <View style={styles.viewAddPermission}>
            <Text style={[styles.textCenter, styles.titleMessagePermission]}>
              {translate({
                id: 'screen.list_image.title_add_permission_library',
                defaultValue: 'Quyền truy cập vào ảnh và video của bạn',
              })}
            </Text>
            <Text style={[styles.textCenter, styles.mb2]}>
              {translate({
                id: 'screen.list_image.title_add_permission_description1',
                defaultValue: 'Cho phép App truy cập vào ảnh và video',
              })}
            </Text>
            <Text style={[styles.textCenter, styles.mb20]}>
              {translate({
                id: 'screen.list_image.title_add_permission_description2',
                defaultValue: 'để bạn có thể chia sẻ với bạn bè',
              })}
            </Text>
            <Pressable onPress={handleAuthor}>
              <Text style={[styles.textCenter, styles.buttonAddPermission]}>
                {translate({
                  id: 'screen.list_image.button_add_permission',
                  defaultValue: 'Cho phép truy cập',
                })}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <Text>
              {translate({
                id: 'screen.list_image.permission_library_photo_denied',
                defaultValue:
                  'Vui lòng cấp quyền truy cập Ảnh và Video trong cài đặt',
              })}
            </Text>
            <Pressable onPress={this.openSetting}>
              <Text style={[styles.textCenter, styles.buttonOpenSetting]}>
                {translate({
                  id: 'screen.list_image.button_open_setting',
                  defaultValue: 'Mở Cài đặt',
                })}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewPermission: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAddPermission: {
    paddingHorizontal: 30,
  },
  titleMessagePermission: {
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 15,
  },
  textCenter: {
    textAlign: 'center',
    color: '#2b1624',
  },
  mb2: {
    marginBottom: 2,
  },
  mb20: {
    marginBottom: 20,
  },
  buttonAddPermission: {
    fontWeight: '600',
    color: '#4378ec',
  },
  buttonOpenSetting: {
    fontWeight: '600',
    color: '#4378ec',
    marginTop: 15,
  },
});

export default Permission;
