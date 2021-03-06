import { inject } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { Constants } from './../constants';
import {
  Column,
  Editor,
  EditorValidator,
  EditorValidatorOutput,
  HtmlElementPosition,
  KeyCode
} from './../models/index';
import * as $ from 'jquery';

/*
 * An example of a 'detached' editor.
 * The UI is added onto document BODY and .position(), .show() and .hide() are implemented.
 * KeyDown events are also handled to provide handling for Tab, Shift-Tab, Esc and Ctrl-Enter.
 */
@inject(I18N)
export class LongTextEditor implements Editor {
  $textarea: any;
  $wrapper: any;
  defaultValue: any;

  constructor(private i18n: I18N, private args: any) {
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

  get hasAutoCommitEdit() {
    return this.args.grid.getOptions().autoCommitEdit;
  }

  init(): void {
    const columnId = this.columnDef && this.columnDef.id;
    const cancelText = this.i18n.tr('CANCEL') || Constants.TEXT_CANCEL;
    const saveText = this.i18n.tr('SAVE') || Constants.TEXT_SAVE;
    const placeholder = this.columnEditor && this.columnEditor.placeholder || '';
    const $container = $('body');

    this.$wrapper = $(`<div class="slick-large-editor-text editor-${columnId}" />`).appendTo($container);
    this.$textarea = $(`<textarea hidefocus rows="5" placeholder="${placeholder}">`).appendTo(this.$wrapper);

    // aurelia-slickgrid does not get the focus out event for some reason
    // so register it here
    if (this.hasAutoCommitEdit) {
      this.$textarea.on('focusout', () => this.save());
    }

    $(`<div class="editor-footer">
        <button class="btn btn-primary btn-xs">${saveText}</button>
        <button class="btn btn-default btn-xs">${cancelText}</button>
      </div>`).appendTo(this.$wrapper);

    this.$wrapper.find('button:first').on('click', () => this.save());
    this.$wrapper.find('button:last').on('click', () => this.cancel());
    this.$textarea.on('keydown', this.handleKeyDown.bind(this));

    this.position(this.args && this.args.position);
    this.$textarea.focus().select();
  }

  handleKeyDown(e: any) {
    if (e.which === KeyCode.ENTER && e.ctrlKey) {
      this.save();
    } else if (e.which === KeyCode.ESCAPE) {
      e.preventDefault();
      this.cancel();
    } else if (e.which === KeyCode.TAB && e.shiftKey) {
      e.preventDefault();
      if (this.args && this.args.grid) {
        this.args.grid.navigatePrev();
      }
    } else if (e.which === KeyCode.TAB) {
      e.preventDefault();
      if (this.args && this.args.grid) {
        this.args.grid.navigateNext();
      }
    }
  }

  save() {
    const validation = this.validate();
    if (validation && validation.valid) {
      if (this.hasAutoCommitEdit) {
        this.args.grid.getEditorLock().commitCurrentEdit();
      } else {
        this.args.commitChanges();
      }
    }
  }

  cancel() {
    this.$textarea.val(this.defaultValue);
    if (this.args && this.args.cancelChanges) {
      this.args.cancelChanges();
    }
  }

  hide() {
    this.$wrapper.hide();
  }

  show() {
    this.$wrapper.show();
  }

  position(position: HtmlElementPosition) {
    this.$wrapper
      .css('top', (position.top || 0) - 5)
      .css('left', (position.left || 0) - 5);
  }

  destroy() {
    this.$textarea.off('keydown focusout');
    this.$wrapper.remove();
  }

  focus() {
    this.$textarea.focus();
  }

  loadValue(item: any) {
    this.$textarea.val(this.defaultValue = item[this.columnDef.field]);
    this.$textarea.select();
  }

  serializeValue() {
    return this.$textarea.val();
  }

  applyValue(item: any, state: any) {
    item[this.columnDef.field] = state;
  }

  isValueChanged() {
    return (!(this.$textarea.val() === '' && this.defaultValue == null)) && (this.$textarea.val() !== this.defaultValue);
  }

  validate(): EditorValidatorOutput {
    if (this.validator) {
      const value = this.$textarea && this.$textarea.val && this.$textarea.val();
      const validationResults = this.validator(value, this.args);
      if (!validationResults.valid) {
        return validationResults;
      }
    }

    // by default the editor is always valid
    // if user want it to be a required checkbox, he would have to provide his own validator
    return {
      valid: true,
      msg: null
    };
  }
}
