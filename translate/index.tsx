import {connect} from 'react-redux';
import React from 'react';
import config from './config';
import {Text, TextStyle, ViewStyle} from 'react-native';
import {Fragment} from 'react';

const mapStateToProps = (props: {language: {lang: string}}) => {
  return {
    language: props.language.lang,
  };
};

interface IPropsTranslate {
  uppercase?: boolean;
  lowercase?: boolean;
  defaultMessage: string;
  value?: {
    [key: string]: string | any;
  };
  style?: TextStyle;
  language?: string;
  id: string;
}

interface IPropsTranslateText extends IPropsTranslate {
  locale: string;
}

const langConfig: {[key: string]: {[key: string]: string}} = config;

let Translate = (props: IPropsTranslate) => {
  const {language = ''} = props;
  const {uppercase, lowercase, defaultMessage = '', value, style} = props;
  let text: any = langConfig[language]?.[props.id];
  let textInit = langConfig[language]?.[props.id];
  if (!text) {
    text = defaultMessage;
    textInit = defaultMessage;
  }
  if (value) {
    Object.keys(value).forEach((key, index) => {
      const re = new RegExp(`{${key}}`, 'g');
      if (typeof value[key] === 'string' || typeof value[key] === 'number') {
        if (uppercase) {
          text = text.toUpperCase();
        } else if (lowercase) {
          text = text.toLowerCase();
        }
        if (index === Object.keys(value).length - 1) {
          text = <Text style={{...style}}>{text.replace(re, value[key])}</Text>;
        } else {
          text = text.replace(re, value[key]);
        }
      } else {
        const array = text.split(`{${key}}`).filter(Boolean);
        let textCheck = '';
        text = (
          <Fragment>
            {array.map((el: any, index: number) => {
              textCheck += el;
              let newText = el;
              if (uppercase) {
                newText = newText.toUpperCase();
              } else if (lowercase) {
                newText = newText.toLowerCase();
              }
              if (textCheck !== textInit) {
                textCheck += `{${key}}`;
                return (
                  <Fragment key={index.toString()}>
                    <Text style={{...style}}>{newText}</Text>
                    {value[key]}
                  </Fragment>
                );
              } else {
                return (
                  <Fragment key={index.toString()}>
                    <Text style={{...style}}>{newText}</Text>
                  </Fragment>
                );
              }
            })}
          </Fragment>
        );
      }
    });
    return text;
  }
  if (uppercase && typeof text === 'string') {
    text = text.toUpperCase();
  } else if (lowercase && typeof text === 'string') {
    text = text.toLowerCase();
  }
  return <Text style={{...style}}>{text}</Text>;
};
const TranslateHtml = connect(mapStateToProps)(Translate);

const translate = (props: IPropsTranslate) => {
  if (typeof props === 'string') {
    return <TranslateHtml defaultMessage="" id={props} />;
  }
  const {uppercase, lowercase, defaultMessage = '', id, style} = props;
  return (
    <TranslateHtml
      style={style}
      uppercase={uppercase}
      lowercase={lowercase}
      defaultMessage={defaultMessage}
      id={id}
    />
  );
};

function translateText(props: IPropsTranslateText) {
  const {uppercase, lowercase, defaultMessage = ''} = props;
  let text = langConfig[props.locale]?.[props.id];
  if (!text) {
    text = defaultMessage;
  }
  if (uppercase) return text.toUpperCase();
  if (lowercase) return text.toLowerCase();
  return text;
}

export {translate, TranslateHtml, translateText};
