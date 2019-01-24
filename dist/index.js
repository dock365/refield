"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var validator_1 = __importStar(require("@dock365/validator"));
var ValidateOnTypes;
(function (ValidateOnTypes) {
    ValidateOnTypes[ValidateOnTypes["OnChange"] = 0] = "OnChange";
    ValidateOnTypes[ValidateOnTypes["OnBlur"] = 1] = "OnBlur";
})(ValidateOnTypes = exports.ValidateOnTypes || (exports.ValidateOnTypes = {}));
var Field = /** @class */ (function (_super) {
    __extends(Field, _super);
    function Field(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            shouldUpdate: false,
            value: _this.props.defaultValue,
            errors: [],
            customErrors: [],
        };
        _this.validator = new validator_1.default({
            failMessages: _this.props.validationMessages,
        });
        _this._resetField = _this._resetField.bind(_this);
        return _this;
    }
    Field.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.validationRules !== prevProps.validationRules) {
            this.setState({ shouldUpdate: true });
        }
    };
    Field.prototype.render = function () {
        var _this = this;
        var _a = this.props, validationRules = _a.validationRules, validateOn = _a.validateOn, showAsteriskOnRequired = _a.showAsteriskOnRequired;
        return (React.createElement(this.props.render, {
            name: this.props.name,
            placeholder: this.props.placeholder,
            defaultValue: this.props.defaultValue,
            value: this.state.value,
            customProps: this.props.customProps,
            onChange: function (value, e) {
                var _value = validationRules &&
                    validationRules.type === validator_1.validationTypes.String &&
                    typeof value === "number" ?
                    "" + value : value;
                _this.setState(function () { return ({ value: _value }); });
                if (_this.props.onChange)
                    _this.props.onChange(_value, _this._resetField);
                if (validateOn === ValidateOnTypes.OnChange) {
                    _this._validateField();
                    if (_this.props.customValidation)
                        _this._updateCustomValidationMessage(_this.props.customValidation(_value, _this.props.validationRules));
                }
            },
            onBlur: function (value, e) {
                var _value = validationRules &&
                    validationRules.type === validator_1.validationTypes.String &&
                    typeof value === "number" ?
                    "" + value : value;
                if (_this.props.onBlur)
                    _this.props.onBlur(_value, _this._resetField);
                if (validateOn === ValidateOnTypes.OnBlur) {
                    _this._validateField();
                    if (_this.props.customValidation)
                        _this._updateCustomValidationMessage(_this.props.customValidation(_value, _this.props.validationRules));
                }
            },
            label: showAsteriskOnRequired && this.props.validationRules && this.props.validationRules.required ?
                this.props.label + "*" :
                this.props.label,
            validationRules: this.props.validationRules,
            errors: this.state.errors.concat(this.state.customErrors),
        }));
    };
    Field.prototype._resetField = function () {
        this.setState({ value: null });
    };
    Field.prototype._validateField = function () {
        var _a = this.props, validationRules = _a.validationRules, label = _a.label, name = _a.name;
        var value = this.state.value;
        if (validationRules && validationRules.type) {
            var result = void 0;
            switch (validationRules.type) {
                case validator_1.validationTypes.String:
                    result =
                        this.validator[validator_1.validationTypes.String](label || name, value || "", validationRules);
                    break;
                case validator_1.validationTypes.Number:
                    result =
                        this.validator[validator_1.validationTypes.Number](label || name, value, validationRules);
                    break;
                case validator_1.validationTypes.Date:
                    result =
                        this.validator[validator_1.validationTypes.Date](label || name, value, validationRules);
                    break;
                case validator_1.validationTypes.Email:
                    result =
                        this.validator[validator_1.validationTypes.Email](label || name, value || "", validationRules);
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
    };
    Field.prototype._updateCustomValidationMessage = function (errors) {
        this.setState({
            customErrors: errors,
        });
    };
    return Field;
}(React.Component));
exports.default = Field;
//# sourceMappingURL=index.js.map