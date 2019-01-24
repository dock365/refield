import * as React from 'react';
import Validator, {
  validationTypes,
  IStringValidationOptions,
  INumberValidationOptions,
  IDateValidationOptions,
  IEmailValidationOptions,
  IValidationFailMessages,
  IValidationResponse,
} from '@dock365/validator';

export type validationRulesType =
  (IStringValidationOptions & { type: validationTypes.String }) |
  (INumberValidationOptions & { type: validationTypes.Number }) |
  (IDateValidationOptions & { type: validationTypes.Date }) |
  (IEmailValidationOptions & { type: validationTypes.Email });

export interface IFieldRenderProps {
  name: string;
  placeholder?: string;
  defaultValue?: any;
  value?: any;
  customProps?: any;
  onChange?: (
    value: any,
    e?: React.MouseEvent<HTMLInputElement>,
  ) => void;
  onBlur?: (
    value: any,
    e?: React.MouseEvent<HTMLInputElement>,
  ) => void;
  label?: string;
  validationRules?: validationRulesType;
  errors?: string[];
  resetField?: () => void;
}

export enum ValidateOnTypes {
  OnChange,
  OnBlur,
}

export interface IFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: any;
  render: React.ComponentType<IFieldRenderProps>;
  onChange?: (value: any, resetFields?: () => void) => void;
  onBlur?: (value: any, resetFields?: () => void) => void;
  validationRules?: validationRulesType;
  validateOn?: ValidateOnTypes;
  showAsteriskOnRequired?: boolean;
  customProps?: any;
  customValidation?: (value?: any, validationRules?: validationRulesType) => string[];
  validationMessages?: IValidationFailMessages;
}
export interface IFieldState {
  shouldUpdate: boolean;
  value: any;
  errors: string[];
  customErrors: string[];
}

export default class Field extends React.Component<IFieldProps, IFieldState> {
  private validator: Validator;

  constructor(props: IFieldProps) {
    super(props);

    this.state = {
      shouldUpdate: false,
      value: this.props.defaultValue,
      errors: [],
      customErrors: [],
    };

    this.validator = new Validator({
      failMessages: this.props.validationMessages,
    });

    this._resetField = this._resetField.bind(this);
  }
  public componentDidUpdate(prevProps: IFieldProps) {
    if (this.props.validationRules !== prevProps.validationRules) {
      this.setState({ shouldUpdate: true });
    }
  }

  public render() {
    const { validationRules, validateOn, showAsteriskOnRequired } = this.props;

    return (
      React.createElement(this.props.render, {
        name: this.props.name,
        placeholder: this.props.placeholder,
        defaultValue: this.props.defaultValue,
        value: this.state.value,
        customProps: this.props.customProps,
        onChange: (
          value: any,
          e?: React.MouseEvent<HTMLInputElement>,
        ) => {

          const _value =
            validationRules &&
              validationRules.type === validationTypes.String &&
              typeof value === "number" ?
              `${value}` : value;
          this.setState(() => ({ value: _value }));

          if (this.props.onChange) this.props.onChange(_value, this._resetField);
          if (validateOn === ValidateOnTypes.OnChange) {
            this._validateField();
            if (this.props.customValidation)
              this._updateCustomValidationMessage(
                this.props.customValidation(_value, this.props.validationRules),
              );
          }
        },
        onBlur: (
          value: any,
          e?: React.MouseEvent<HTMLInputElement>,
        ) => {
          const _value =
            validationRules &&
              validationRules.type === validationTypes.String &&
              typeof value === "number" ?
              `${value}` : value;

          if (this.props.onBlur) this.props.onBlur(_value, this._resetField);
          if (validateOn === ValidateOnTypes.OnBlur) {
            this._validateField();
            if (this.props.customValidation)
              this._updateCustomValidationMessage(
                this.props.customValidation(_value, this.props.validationRules),
              );
          }
        },
        label: showAsteriskOnRequired && this.props.validationRules && this.props.validationRules.required ?
          `${this.props.label}*` :
          this.props.label,
        validationRules: this.props.validationRules,
        errors: [...this.state.errors, ...this.state.customErrors],
      })
    );
  }

  private _resetField() {
    this.setState({ value: null });
  }

  private _validateField() {
    const { validationRules, label, name } = this.props;
    const { value } = this.state;

    if (validationRules && validationRules.type) {
      let result: IValidationResponse;
      switch (validationRules.type) {
        case validationTypes.String:
          result =
            this.validator[validationTypes.String](label || name, value || "", validationRules);
          break;
        case validationTypes.Number:
          result =
            this.validator[validationTypes.Number](label || name, value, validationRules);
          break;
        case validationTypes.Date:
          result =
            this.validator[validationTypes.Date](label || name, value, validationRules);
          break;
        case validationTypes.Email:
          result =
            this.validator[validationTypes.Email](label || name, value || "", validationRules);
          break;

        default:
          result = {
            success: true,
            messages: [],
          };
          break;
      }
      if (!result.success) {
        this.setState({
          errors: result.messages,
        });

        return false;
      }
      this.setState({ errors: [] });
    }

    return true;
  }

  private _updateCustomValidationMessage(errors: string[]) {
    this.setState({
      customErrors: errors,
    });
  }
}
