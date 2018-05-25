import { I18N } from 'aurelia-i18n';
import { Column, Filter, FilterArguments, FilterCallback, FilterType, GridOption, OperatorString, OperatorType, SearchTerm } from './../models/index';
export declare class CompoundInputFilter implements Filter {
    private i18n;
    private $filterElm;
    private $filterInputElm;
    private $selectOperatorElm;
    grid: any;
    gridOptions: GridOption;
    operator: OperatorType | OperatorString | undefined;
    searchTerm: SearchTerm | undefined;
    columnDef: Column;
    callback: FilterCallback;
    filterType: FilterType;
    constructor(i18n: I18N);
    /**
     * Initialize the Filter
     */
    init(args: FilterArguments): void;
    /**
     * Clear the filter value
     */
    clear(triggerFilterKeyup?: boolean): void;
    /**
     * destroy the filter
     */
    destroy(): void;
    /**
     * Set value(s) on the DOM element
     */
    setValues(values: SearchTerm): void;
    private buildInputHtmlString();
    private buildSelectOperatorHtmlString();
    private getOptionValues();
    /**
     * Create the DOM element
     */
    private createDomElement();
    private onTriggerEvent(e);
}