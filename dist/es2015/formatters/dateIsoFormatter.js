import { FieldType } from './../models/index';
import { mapMomentDateFormatWithFieldType } from './../services/utilities';
import * as moment from 'moment';
const FORMAT = mapMomentDateFormatWithFieldType(FieldType.dateIso);
export const dateIsoFormatter = (row, cell, value, columnDef, dataContext) => value ? moment(value).format(FORMAT) : '';
//# sourceMappingURL=dateIsoFormatter.js.map