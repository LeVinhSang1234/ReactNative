import {Platform} from 'react-native';

export function unMount(paramThis: any) {
  paramThis.setState = () => null;
}
export async function throwException(e: any) {
  console.log(e);
}

export const convertUri = (uri: string) => {
  if (Platform.OS === 'android') {
    return uri;
  }
  return decodeURIComponent(uri.replace('file://', ''));
};
