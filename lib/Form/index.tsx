import React, {
  useEffect,
  useState,
  useCallback,
  ReactChild,
  Fragment,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  NativeEventEmitter,
  ViewStyle,
} from 'react-native';

const form: any = {
  ref: {},
  value: {},
  touched: {},
  validateFirst: false,
};

export interface IErrorForm {
  [key: string]: any;
}

export interface IValueForm {
  [key: string]: any;
}

export interface FormHandle {
  setFieldsValue: (value: any, errors?: any) => void;
  setFieldValue: (
    key: string,
    value?: any,
    error?: ReactChild | undefined,
  ) => void;
  getFieldValue: (value: any, errors?: any) => void;
  getFieldsValue: (value: any, errors?: any) => void;
  validateFields: (
    calback: (err?: IErrorForm, values?: IValueForm) => any,
  ) => any;
  resetFields: (key: string, value: any, error: ReactChild | undefined) => void;
}

const handle: any = {};
const handleForm: FormHandle = {
  setFieldsValue: () => null,
  setFieldValue: () => null,
  getFieldValue: () => undefined,
  getFieldsValue: () => {},
  validateFields: () => undefined,
  resetFields: () => undefined,
};
const listInterval: any = {};

let useForm = 0;
let errors: any = {};

const styles = StyleSheet.create({
  label: {
    color: '#000000d9',
  },
  Viewlabel: {
    marginBottom: 4,
    flexDirection: 'row',
  },
  dotRequired: {
    color: '#ff4d4f',
    marginRight: 4,
  },
  dotRequiredAfter: {
    color: '#ff4d4f',
    marginRight: 2,
    marginLeft: 2,
  },
  layoutForm: {
    flexDirection: 'row',
  },
  styleSpanCol: {
    height: 34,
    paddingTop: 8.5,
    paddingBottom: 8.5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  error: {
    height: 22,
    fontSize: 12,
    color: '#ff4d4f',
  },
});

interface IPropsItem {
  children?: any;
  defaultValue?: any;
  name: string;
  onParseField?: (v?: any, callback?: any) => any;
  onChange?: (v: any, name: string) => any;
  value?: any;
  onPress?: (v?: any, key?: any) => any;
  rule?: {
    whitespace?: boolean;
    required?: boolean;
    message?: any;
    validator?: (v: any, callback: (v?: any) => any) => any;
  };
  validateFirst?: (v?: any) => any;
  onValueChange?: (v?: any, key?: string) => any;
  onChangeText?: (v?: any, name?: string) => any;
  onChangeInput?: (v?: any, key?: any) => any;
  label?: any;
  colon?: string;
  dotRequired?: string;
  renderDot?: (v?: any) => any;
  formItemLayout?: {
    labelCol: {
      xs: number;
      sm: number;
    };
    wrapperCol: {
      xs: number;
      sm: number;
    };
  };
}

export const Item = (props: IPropsItem) => {
  const {
    children,
    name,
    onParseField,
    onChange,
    value,
    onPress = () => null,
    rule = {},
    validateFirst,
    onValueChange,
    onChangeText,
    label,
    colon,
    dotRequired,
    renderDot,
    formItemLayout,
    onChangeInput,
    defaultValue,
  } = props;
  const [valueState, setValue] = useState({value, error: null});

  useEffect(() => {
    if (name && onParseField) {
      onParseField(name, defaultValue);
      form.ref[name] = (
        val: string | undefined = undefined,
        error: string,
        detectValidate?: boolean,
      ) => {
        if (!detectValidate && onChangeInput) onChangeInput(val);
        form.touched[name] = true;
        const newValue = {...value, value: val};
        let v = val;
        if (rule.whitespace && v) {
          v = v.trim();
        }
        if (error) {
          newValue.error = error;
        } else if (rule.required && !v) {
          if (rule.message) {
            newValue.error = rule.message;
          } else if (!label || typeof label === 'string') {
            newValue.error = (label || ' Field') + ' is required';
          } else {
            newValue.error = (
              <Fragment>
                <Text>{label}</Text>
                <Text> is required</Text>
              </Fragment>
            );
          }
        } else if (rule.validator && typeof rule.validator === 'function') {
          rule.validator(v, (message: string | undefined) => {
            newValue.error = message;
          });
        }
        if (newValue.error) {
          if (errors[name] !== newValue.error) {
            errors[name] = newValue.error;
          }
        } else {
          delete errors[name];
        }
        setValue(newValue);
      };
      if (validateFirst) {
        form.ref[name](valueState.value);
      }
    }
    return () => {
      delete errors[name];
      delete form.ref[name];
      delete form.value[name];
      delete form.touched[name];
    };
  }, []);

  const renderWithLabel = useCallback(
    (
      styleForm: object | undefined,
      styleSpanCol: object | undefined,
      styleSpanWrapCol: object | undefined,
    ) => {
      return (
        <View style={styleForm}>
          <View style={styleSpanCol}>
            <View style={styles.Viewlabel}>
              {rule.required &&
                dotRequired === 'before' &&
                (renderDot ? (
                  renderDot()
                ) : (
                  <Text style={styles.dotRequired}>*</Text>
                ))}
              <Text style={styles.label}>{label}</Text>
              {rule.required &&
                dotRequired === 'after' &&
                (renderDot ? (
                  renderDot()
                ) : (
                  <Text style={styles.dotRequiredAfter}>*</Text>
                ))}
              <Text>{colon ? ':' : ''}</Text>
            </View>
          </View>
          <View style={styleSpanWrapCol}>
            {{
              ...children,
              props: {
                ...children.props,
                onChange: (v: string) => onChange?.(v, name),
                value: valueState.value,
                error: valueState.error,
                onPress: (e: NativeEventEmitter) =>
                  onPress(e, children.props.onPress),
                onValueChange: (e: NativeEventEmitter) =>
                  onValueChange?.(e, name),
                onChangeText: (e: NativeEventEmitter) =>
                  onChangeText?.(e, name),
              },
            }}
            <Text style={styles.error}>{valueState.error}</Text>
          </View>
        </View>
      );
    },
    [valueState.value, valueState.error],
  );

  if (label && formItemLayout) {
    const {labelCol, wrapperCol} = formItemLayout;
    const width = Dimensions.get('window').width;
    const {xs = 12, sm = 12} = labelCol;
    const {xs: xsWrap = 12, sm: smWrap = 12} = wrapperCol;
    let widthSpan = width > 320 ? (sm / 12) * 100 : (xs / 12) * 100;
    if (widthSpan > 100) {
      widthSpan = 100;
    }
    let widthSpanWrap = width > 320 ? (smWrap / 12) * 100 : (xsWrap / 12) * 100;
    if (widthSpanWrap > 100) {
      widthSpanWrap = 100;
    }
    if (widthSpanWrap + widthSpan > 100) {
      styles.layoutForm = {...styles.layoutForm, flexDirection: 'row'};
    }
    return renderWithLabel(
      styles.layoutForm,
      {
        ...styles.styleSpanCol,
        width: widthSpan + '%',
      },
      {
        width: widthSpanWrap + '%',
      },
    );
  }

  if (label) {
    return renderWithLabel(undefined, undefined, undefined);
  }

  return (
    <Fragment>
      {{
        ...children,
        props: {
          ...children.props,
          onChange: (v: string) => onChange?.(v, name),
          value: valueState.value,
          error: valueState.error,
          onPress: (e: NativeEventEmitter) =>
            onPress(e, children.props.onPress),
          onValueChange: (e: NativeEventEmitter) => onValueChange?.(e, name),
          onChangeText: (e: NativeEventEmitter) => onChangeText?.(e, name),
        },
      }}
      <Text style={styles.error}>{valueState.error}</Text>
    </Fragment>
  );
};

interface IPropsForm {
  initialValues?: {
    [key: string]: any;
  };
  children: any;
  validateFirst?: (v?: any) => any;
  renderDot?: (v?: any) => any;
  style?: ViewStyle;
  colon?: boolean;
  formItemLayout?: {
    labelCol: {
      xs: number;
      sm: number;
    };
    wrapperCol: {
      xs: number;
      sm: number;
    };
  };
  dotRequired?: 'before' | 'after';
}

const Form = (props: IPropsForm) => {
  const {
    initialValues = {},
    children,
    validateFirst,
    renderDot,
    style,
    colon,
    formItemLayout,
    dotRequired,
  } = props;
  useMemo(() => {
    handle.onChange = onChange;
    handle.onValueChange = onChange;
    handle.onParseField = onParseField;
    handle.onPress = onPress;
    handle.colon = colon;
    handle.formItemLayout = formItemLayout;
    handle.dotRequired = dotRequired || 'before';
    handle.renderDot = renderDot;
    handleForm.setFieldsValue = setFieldsValue;
    handleForm.setFieldValue = setFieldValue;
    handleForm.getFieldValue = getFieldValue;
    handleForm.getFieldsValue = getFieldsValue;
    handleForm.validateFields = validateFields;
    handleForm.resetFields = resetFields;
    form.validateFirst = validateFirst;
    Object.keys(initialValues).forEach(key => {
      form.value[key] = initialValues[key];
    });
  }, []);

  useEffect(() => {
    if (useForm) {
      Object.keys(initialValues).forEach(key => {
        onChange(initialValues[key], key, undefined);
      });
    }
  }, [useForm]);

  useEffect(() => {
    return () => {
      form.validateFirst = false;
    };
  }, []);

  function onParseField(name: string, value?: any) {
    if (value !== undefined) {
      form.value[name] = value;
    } else if (!initialValues[name]) {
      form.value[name] = undefined;
    }
  }

  function onChange(v: any, name: string, error: string | undefined) {
    form.value[name] = v;
    if (typeof form.ref[name] === 'function') {
      form.ref[name](v, error);
    }
  }

  function resetFields(fields: any = [], errors: any = {}) {
    if (Array.isArray(fields) && fields.length) {
      fields.forEach(key => {
        onChange(undefined, key, errors[key]);
      });
    } else {
      Object.keys(form.value).forEach(key => {
        onChange(undefined, key, errors[key]);
      });
    }
  }

  function onPress(e: NativeEventEmitter, func: any) {
    if (typeof func === 'function') {
      func(e, {
        value: form.value,
        erorrs: Object.keys(errors).map(key => ({[key]: errors[key]})),
      });
    }
  }

  function setFieldsValue(value: any, errors: any = {}) {
    Object.keys(value).forEach(key => {
      listInterval[key] = setInterval(() => {
        if (typeof form.ref[key] === 'function') {
          form.value[key] = value;
          onChange(value[key], key, errors[key]);
          clearInterval(listInterval[key]);
          delete listInterval[key];
        }
      }, 0);
    });
  }

  function setFieldValue(
    key: string,
    value: any,
    error: string | undefined | ReactChild,
  ) {
    form.value[key] = value;
    if (typeof form.ref[key] === 'function') {
      form.ref[key](value, error);
    }
  }

  function getFieldValue(key: string) {
    return form.value[key];
  }

  function getFieldsValue() {
    return form.value;
  }

  function validateFields(
    calback: (err?: IErrorForm[], v?: IValueForm) => any,
  ) {
    Object.keys(form.value).forEach(key => {
      if (typeof form.ref[key] === 'function') {
        form.ref[key](form.value[key], undefined, true);
      }
    });
    let errorArr: {[key: string]: any}[] | undefined = Object.keys(errors).map(
      (key: string) => ({
        [key]: errors[key],
      }),
    );
    if (!errorArr.length) {
      errorArr = undefined;
    }
    if (calback && typeof calback === 'function') {
      calback(errorArr, form.value);
    }
  }

  if (!Object.keys(handle).length) {
    return null;
  }
  return <View style={{flex: 1, ...style}}>{children}</View>;
};

Form.useForm = () => {
  useForm = 1;
  return [handleForm];
};

Form.Item = (props: IPropsItem) => {
  return Item({
    ...props,
    onChange: handle.onChange,
    onChangeText: handle.onChange,
    onValueChange: handle.onValueChange,
    onChangeInput: props.onChange,
    onParseField: handle.onParseField,
    onPress: handle.onPress,
    value: form[props.name] || props.defaultValue,
    validateFirst: form.validateFirst,
    colon: handle.colon,
    dotRequired: handle.dotRequired,
    renderDot: handle.renderDot,
    formItemLayout: handle.formItemLayout,
  });
};

Form.create = () => {
  return (WrapComponent: any) => (props: any) => {
    return <WrapComponent {...props} form={handleForm} />;
  };
};

export default Form;
