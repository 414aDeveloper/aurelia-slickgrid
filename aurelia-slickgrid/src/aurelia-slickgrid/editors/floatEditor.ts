import { Constants } from '../constants';
import { Column, Editor, EditorValidator, EditorValidatorOutput, KeyCode } from './../models/index';
import * as $ from 'jquery';

const defaultDecimalPlaces = 0;

/*
 * An example of a 'detached' editor.
 * KeyDown events are also handled to provide handling for Tab, Shift-Tab, Esc and Ctrl-Enter.
 */
export class FloatEditor implements Editor {
  $input: any;
  defaultValue: any;

  constructor(private args: any) {
    this.init();
  }

  /** Get Column Definition object */
  get columnDef(): Column {
    return this.args && this.args.column || {};
  }

  /** Get Column Editor object */
  get columnEditor(): any {
    return this.columnDef && this.columnDef.internalColumnEditor || {};
  }

  /** Get the Validator function, can be passed in Editor property or Column Definition */
  get validator(): EditorValidator {
    return this.columnEditor.validator || this.columnDef.validator;
  }

  init(): void {
    const columnId = this.columnDef && this.columnDef.id;
    const placeholder = this.columnEditor && this.columnEditor.placeholder || '';

    this.$input = $(`<input type="number" class="editor-text editor-${columnId}" placeholder="${placeholder}" step="${this.getInputDecimalSteps()}" />`)
      .appendTo(this.args.container)
      .on('keydown.nav', (e) => {
        if (e.keyCode === KeyCode.LEFT || e.keyCode === KeyCode.RIGHT) {
          e.stopImmediatePropagation();
        }
      });

    setTimeout(() => {
      this.$input.focus().select();
    }, 50);
  }

  destroy() {
    this.$input.off('keydown.nav').remove();
  }

  focus() {
    this.$input.focus();
  }

  getDecimalPlaces(): number {
    // returns the number of fixed decimal places or null
    let rtn = (this.columnEditor.params && this.columnEditor.params.hasOwnProperty('decimalPlaces')) ? this.columnEditor.params.decimalPlaces : undefined;

    if (rtn === undefined) {
      rtn = defaultDecimalPlaces;
    }
    return (!rtn && rtn !== 0 ? null : rtn);
  }

  getInputDecimalSteps(): string {
    const decimals = this.getDecimalPlaces();
    let zeroString = '';
    for (let i = 1; i < decimals; i++) {
      zeroString += '0';
    }

    if (decimals > 0) {
      return `0.${zeroString}1`;
    }
    return '1';
  }

  loadValue(item: any) {
    this.defaultValue = item[this.columnDef.field];

    const decPlaces = this.getDecimalPlaces();
    if (decPlaces !== null
      && (this.defaultValue || this.defaultValue === 0)
      && this.defaultValue.toFixed) {
      this.defaultValue = this.defaultValue.toFixed(decPlaces);
    }

    this.$input.val(this.defaultValue);
    this.$input[0].defaultValue = this.defaultValue;
    this.$input.select();
  }

  serializeValue() {
    let rtn = parseFloat(this.$input.val()) || 0;
    const decPlaces = this.getDecimalPlaces();
    if (decPlaces !== null
      && (rtn || rtn === 0)
      && rtn.toFixed) {
      rtn = parseFloat(rtn.toFixed(decPlaces));
    }

    return rtn;
  }

  applyValue(item: any, state: any) {
    item[this.columnDef.field] = state;
  }

  isValueChanged() {
    const elmValue = this.$input.val();
    return (!(elmValue === '' && this.defaultValue === null)) && (elmValue !== this.defaultValue);
  }

  validate(): EditorValidatorOutput {
    const elmValue = this.$input.val();
    const floatNumber = !isNaN(elmValue as number) ? parseFloat(elmValue) : null;
    const decPlaces = this.getDecimalPlaces();
    const minValue = this.columnEditor.minValue;
    const maxValue = this.columnEditor.maxValue;
    const errorMsg = this.columnEditor.errorMessage;
    const mapValidation = {
      '{{minValue}}': minValue,
      '{{maxValue}}': maxValue,
      '{{minDecimal}}': 0,
      '{{maxDecimal}}': decPlaces
    };

    if (this.validator) {
      const validationResults = this.validator(elmValue, this.args);
      if (!validationResults.valid) {
        return validationResults;
      }
    } else if (isNaN(elmValue as number) || (decPlaces === 0 && !/^[-+]?(\d+(\.)?(\d)*)$/.test(elmValue))) {
      // when decimal value is 0 (which is the default), we accept 0 or more decimal values
      return {
        valid: false,
        msg: errorMsg || Constants.VALIDATION_EDITOR_VALID_NUMBER
      };
    } else if (minValue !== undefined && maxValue !== undefined && floatNumber !== null && (floatNumber < minValue || floatNumber > maxValue)) {
      // MIN & MAX Values provided
      // when decimal value is bigger than 0, we only accept the decimal values as that value set
      // for example if we set decimalPlaces to 2, we will only accept numbers between 0 and 2 decimals
      return {
        valid: false,
        msg: errorMsg || Constants.VALIDATION_EDITOR_NUMBER_BETWEEN.replace(/{{minValue}}|{{maxValue}}/gi, (matched) => mapValidation[matched])
      };
    } else if (minValue !== undefined && floatNumber !== null && floatNumber <= minValue) {
      // MIN VALUE ONLY
      // when decimal value is bigger than 0, we only accept the decimal values as that value set
      // for example if we set decimalPlaces to 2, we will only accept numbers between 0 and 2 decimals
      return {
        valid: false,
        msg: errorMsg || Constants.VALIDATION_EDITOR_NUMBER_MIN.replace(/{{minValue}}/gi, (matched) => mapValidation[matched])
      };
    } else if (maxValue !== undefined && floatNumber !== null && floatNumber >= maxValue) {
      // MAX VALUE ONLY
      // when decimal value is bigger than 0, we only accept the decimal values as that value set
      // for example if we set decimalPlaces to 2, we will only accept numbers between 0 and 2 decimals
      return {
        valid: false,
        msg: errorMsg || Constants.VALIDATION_EDITOR_NUMBER_MAX.replace(/{{maxValue}}/gi, (matched) => mapValidation[matched])
      };
    } else if ((decPlaces > 0 && !new RegExp(`^(\\d*(\\.)?(\\d){0,${decPlaces}})$`).test(elmValue))) {
      // when decimal value is bigger than 0, we only accept the decimal values as that value set
      // for example if we set decimalPlaces to 2, we will only accept numbers between 0 and 2 decimals
      return {
        valid: false,
        msg: errorMsg || Constants.VALIDATION_EDITOR_DECIMAL_BETWEEN.replace(/{{minDecimal}}|{{maxDecimal}}/gi, (matched) => mapValidation[matched])
      };
    }

    return {
      valid: true,
      msg: null
    };
  }
}
