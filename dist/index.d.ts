import * as React from 'react';
import { validationTypes, IStringValidationOptions, INumberValidationOptions, IDateValidationOptions, IEmailValidationOptions, IValidationFailMessages } from '@dock365/validator';
export declare type validationRulesType = (IStringValidationOptions & {
    type: validationTypes.String;
}) | (INumberValidationOptions & {
    type: validationTypes.Number;
}) | (IDateValidationOptions & {
    type: validationTypes.Date;
}) | (IEmailValidationOptions & {
    type: validationTypes.Email;
});
export interface IFieldRenderProps {
    name: string;
    placeholder?: string;
    defaultValue?: any;
    value?: any;
    customProps?: any;
    onChange?: (value: any, e?: React.MouseEvent<HTMLInputElement>) => void;
    onBlur?: (value: any, e?: React.MouseEvent<HTMLInputElement>) => void;
    label?: string;
    validationRules?: validationRulesType;
    errors?: string[];
    resetField?: () => void;
}
export declare enum ValidateOnTypes {
    OnChange = 0,
    OnBlur = 1
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
    private validator;
    constructor(props: IFieldProps);
    componentDidUpdate(prevProps: IFieldProps): void;
    render(): React.ReactElement<IFieldRenderProps>;
    private _resetField;
    private _validateField;
    private _updateCustomValidationMessage;
}
