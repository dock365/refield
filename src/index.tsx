import * as React from 'react';
import Validator, {
  validationTypes,
  IStringValidationOptions,
  INumberValidationOptions,
  IDateValidationOptions,
  IEmailValidationOptions,
  IValidationFailMessages,
  IValidationResponse,
  IArrayValidationOptions,
} from '@dock365/validator';
import { IFieldRenderProps } from "@dock365/reform";

export type validationRulesType =
  (IStringValidationOptions & { type: validationTypes.String }) |
  (INumberValidationOptions & { type: validationTypes.Number }) |
  (IDateValidationOptions & { type: validationTypes.Date }) |
  (IArrayValidationOptions & { type: validationTypes.Array }) |
  (IEmailValidationOptions & { type: validationTypes.Email });
//
// export interface IFieldRenderProps {
//   name?: string;
//   placeholder?: string;
//   defaultValue?: any;
//   defaultValueIsUpdatable?: boolean;
//   value?: any;
//   customProps?: any;
//   onChange?: (
//     value: any,
//     e?: React.MouseEvent<HTMLInputElement>,
//   ) => void;
//   onBlur?: (
//     value: any,
//     e?: React.MouseEvent<HTMLInputElement>,
//   ) => void;
//   label?: string;
//   validationRules?: validationRulesType;
//   errors?: string[];
//   resetField?: () => void;
//   className?: string;
//   readOnly?: boolean;
//   onClick?: (event: React.MouseEvent<any>) => void;
// }

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
  render: React.ComponentType<IFieldRenderProps & {
    defaultValueIsUpdatable?: boolean,
    className?: string, onClick?: (event: React.MouseEvent<any>) => void,
  }>;
  hideLabel?: boolean;
  readOnly?: boolean;
  onChange?: (value: any, name: string, resetFields: () => void) => any;
  onBlur?: (value: any, name: string, errors: string[], resetFields: () => void) => any;
  validationRules?: validationRulesType;
  validate?: true;
  showAsteriskOnRequired?: boolean;
  customProps?: any;
  className?: string;
  customValidation?: (value?: any, validationRules?: validationRulesType) => string[];
  validationMessages?: IValidationFailMessages;
  onClick?: (event: React.MouseEvent<any>) => void;
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
  }

  public componentDidUpdate(prevProps: IFieldProps) {
    if (
      prevProps.defaultValue === undefined && this.props.defaultValue !== prevProps.defaultValue ||
      this.props.defaultValueIsUpdatable && this.props.defaultValue !== prevProps.defaultValue
    ) {
      this.setState({value: this.props.defaultValue});
    }
  }

  public render() {
    const {validationRules, validate, showAsteriskOnRequired} = this.props;
    const errors = [...this.state.errors, ...this.state.customErrors];

    return (
      React.createElement(this.props.render, {
        name: this.props.name,
        placeholder: this.props.placeholder,
        defaultValue: this.props.defaultValue,
        defaultValueIsUpdatable: this.props.defaultValueIsUpdatable,
        value: this.state.value,
        customProps: this.props.customProps,
        className: this.props.className,
        readOnly: this.props.readOnly,
        onClick: this.props.onClick,
        onChange: (
          value: any,
          e?: React.MouseEvent<HTMLInputElement>,
        ) => {

          const _value =
            validationRules &&
            validationRules.type === validationTypes.String &&
            typeof value === "number" ?
              `${value}` : value;
          const onChange = this.props.onChange && this.props.onChange(_value, this.props.name, this._resetField);
          if (onChange || onChange === undefined)
            this.setState(() => ({value: _value}));

          return onChange;
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
            defaultErrors = await this._validateField(_value);
            if (this.props.customValidation)
              customErrors = await this._updateCustomValidationMessage(
                this.props.customValidation(_value, this.props.validationRules),
              );
          }

          return this.props.onBlur &&
            this.props.onBlur(_value, this.props.name, [...defaultErrors, ...customErrors], this._resetField);
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

  private _resetField = () => {
    this.setState({value: undefined});
  }

  private _validateField(value: any): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const {validationRules, label, name} = this.props;

      if (validationRules && validationRules.type) {
        let result: IValidationResponse;
        switch (validationRules.type) {
          case validationTypes.String:
            result =
              this.validator[validationTypes.String](label || name || "", value || "", validationRules);
            break;
          case validationTypes.Number:
            result =
              this.validator[validationTypes.Number](label || name || "", value, validationRules);
            break;
          case validationTypes.Date:
            result =
              this.validator[validationTypes.Date](label || name || "", value, validationRules);
            break;
          case validationTypes.Email:
            result =
              this.validator[validationTypes.Email](label || name || "", value || "", validationRules);
            break;

          case validationTypes.Array:
            result =
              this.validator[validationTypes.Array](label || name || "", value || [], validationRules);
            break;

          default:
            result = {
              success: true,
              messages: [],
            };
            break;
        }
        if (!result.success) {
          this.setState({errors: result.messages}, () => resolve(result.messages));
        } else {
          this.setState({errors: []}, () => resolve([]));
        }
      } else {
        resolve([]);
      }
    });
  }

  private _updateCustomValidationMessage(errors: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.setState({customErrors: errors}, () => resolve(errors));
    });
  }
}
