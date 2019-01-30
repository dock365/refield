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
  className?: string;
  readOnly?: boolean;
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
  defaultValueIsUpdatable?: boolean;
  render: React.ComponentType<IFieldRenderProps>;
  hideLabel?: boolean;
  readOnly?: boolean;
  onChange?: (value: any, resetFields?: () => void) => void;
  onBlur?: (value: any, errors?: string[], resetFields?: () => void) => void;
  validationRules?: validationRulesType;
  validate?: true;
  showAsteriskOnRequired?: boolean;
  customProps?: any;
  className?: string;
  customValidation?: (value?: any, validationRules?: validationRulesType) => string[];
  validationMessages?: IValidationFailMessages;
}
export interface IFieldState {
  value: any;
  errors: string[];
  customErrors: string[];
}

export default class Field extends React.Component<IFieldProps, IFieldState> {
  private validator: Validator;

  constructor(props: IFieldProps) {
    super(props);

    this.state = {
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
    if (
      prevProps.defaultValue === undefined && this.props.defaultValue !== prevProps.defaultValue ||
      this.props.defaultValueIsUpdatable && this.props.defaultValue !== prevProps.defaultValue
    ) {
      this.setState({ value: this.props.defaultValue });
    }
  }

  public render() {
    const { validationRules, validate, showAsteriskOnRequired } = this.props;
    const errors = [...this.state.errors, ...this.state.customErrors];

    return (
      React.createElement(this.props.render, {
        name: this.props.name,
        placeholder: this.props.placeholder,
        defaultValue: this.props.defaultValue,
        value: this.state.value,
        customProps: this.props.customProps,
        className: this.props.className,
        readOnly: this.props.readOnly,
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
        },
        onBlur: async (
          value: any,
          e?: React.MouseEvent<HTMLInputElement>,
        ) => {
          const _value =
            validationRules &&
              validationRules.type === validationTypes.String &&
              typeof value === "number" ?
              `${value}` : value;

          let customErrors: string[] = [];
          let defaultErrors: string[] = [];
          if (validate) {
            defaultErrors = await this._validateField();
            if (this.props.customValidation)
              customErrors = await this._updateCustomValidationMessage(
                this.props.customValidation(_value, this.props.validationRules),
              );
          }

          if (this.props.onBlur) this.props.onBlur(_value, [...defaultErrors, ...customErrors], this._resetField);
        },
        label: !this.props.hideLabel &&
          (showAsteriskOnRequired && this.props.validationRules && this.props.validationRules.required ?
            `${this.props.label}*` :
            this.props.label) || undefined,
        validationRules: this.props.validationRules,
        errors: [...this.state.errors, ...this.state.customErrors],
      })
    );
  }

  private _resetField() {
    this.setState({ value: null });
  }

  private _validateField(): Promise<string[]> {
    return new Promise((resolve, reject) => {
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
          this.setState({ errors: result.messages }, () => resolve(result.messages));
        } else {
          this.setState({ errors: [] }, () => resolve([]));
        }
      } else {
        resolve([]);
      }
    });
  }

  private _updateCustomValidationMessage(errors: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.setState({ customErrors: errors }, () => resolve(errors));
    });
  }
}
