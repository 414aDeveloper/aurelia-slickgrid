var _dec, _class;

import { Grid } from 'slickgrid-es6';
import { inject } from 'aurelia-framework';
import { SlickResizer } from './slick-window-resizer';
import $ from 'jquery';

export let SlickService = (_dec = inject(Grid, SlickResizer), _dec(_class = class SlickService {

  constructor(grid, slickResizer) {
    this.columnDefinition = {};
    this.data = {};
    this.grid = {};
    this.gridId = "myGrid";
    this.gridOptions = {};
    this.isCreated = false;
    this.paginationCallback = null;

    this.gridEs6 = grid;
    this.slickResizer = slickResizer;
  }

  createDatagrid(gridId, columnDefinition, gridOptions, data) {
    this.columnDefinition = columnDefinition || {};
    this.data = data || {};
    this.gridId = gridId || "myGrid";
    this.gridOptions = gridOptions || {};
    this.gridOptions.gridId = this.gridId;

    this.grid = this.gridEs6(`#${ this.gridId }`, this.data, this.columnDefinition, this.gridOptions);
    this.isCreated = true;
    if (typeof this.gridOptions.onSortingChanged === "function") {
      this.grid.onSort.subscribe(this.gridOptions.onSortingChanged);
    }

    if (!!this.gridOptions.autoResize) {
      this.slickResizer.attachAutoResizeDataGrid(this.grid, this.gridOptions);
    }
  }

  get gridObject() {
    return this.grid;
  }

  refreshDataset(dataset) {
    if (dataset) {
      this.grid.setData(dataset);
      this.grid.invalidate();
      this.grid.render();
    }
  }
}) || _class);