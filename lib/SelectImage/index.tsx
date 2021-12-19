import {throwException} from '@/utils';
import React, {Component} from 'react';
import {View} from 'react-native';
import RNPhotosFramework from 'rn-photos-framework';
import Text from '../Text';

class SelectImage extends Component {
  dataTracking: any;
  async componentDidMount() {
    try {
      const permission = await RNPhotosFramework.requestAuthorization();
      if (!permission.isAuthorized) {
        return;
      }
      const data = await RNPhotosFramework.getAlbumsMany(
        [
          {
            type: 'smartAlbum',
            subType: 'smartAlbumUserLibrary',
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
            trackInsertsAndDeletes: true,
            trackChanges: false,
          },
        ],
        true,
      );
      this.dataTracking = data;
      console.log(data.albums);
    } catch (e) {
      throwException(e);
    }
  }

  componentWillUnmount() {
    this.dataTracking?.stopTracking?.();
  }

  render() {
    return (
      <View>
        <Text>sang</Text>
      </View>
    );
  }
}

export default SelectImage;
