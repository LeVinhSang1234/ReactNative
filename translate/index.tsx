import config from './config';
import I18n from 'react-native-i18n';
import {appConnect} from '@/App';

interface ITranslate {
  id: string;
  defaultValue?: string;
  values?: {
    [key: string]: string;
  };
}

I18n.fallbacks = true;
I18n.translations = config;

const translate = ({id, defaultValue, values}: ITranslate) => {
  return I18n.t(id, {defaultValue, locale: appConnect.language, values});
};

export default translate;
