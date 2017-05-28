const XLSX = require('xlsx');
const mongoXlsx = require('mongo-xlsx');
const XslxMappings = require('../models/XslxMappings');
const XslxPresentationModel = require('../models/XslxPresentation');

function Workbook() {
    if (!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
}
function datenum(v, date1904) {
    if (date1904) v += 1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}
function sheet_from_array_of_arrays(data, opts) {
    var ws = {};
    var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
    for (var R = 0; R != data.length; ++R) {
        for (var C = 0; C != data[R].length; ++C) {
            if (range.s.r > R) range.s.r = R;
            if (range.s.c > C) range.s.c = C;
            if (range.e.r < R) range.e.r = R;
            if (range.e.c < C) range.e.c = C;
            var cell = { v: data[R][C] };
            if (cell.v == null) continue;
            var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

            if (typeof cell.v === 'number') cell.t = 'n';
            else if (typeof cell.v === 'boolean') cell.t = 'b';
            else if (cell.v instanceof Date) {
                ///Date format https://github.com/SheetJS/ssf/blob/097f026d0345dbff53338493913aba0c6a656386/ssf.js
                cell.t = 'n'; cell.z = XLSX.SSF._table[22];///'m/d/yy h:mm'
                cell.v = datenum(cell.v);
            }
            else cell.t = 's';
            ws[cell_ref] = cell;
        }
    }
    if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
    return ws;
}

function buildSheet(data, model) {
    var result = sheet_from_array_of_arrays(mongoXlsx.mongoData2XlsxData(data, model));
    return result;
}
function generateWorkBook(data, fullReport) {
    var ws_name = "Presentations";
    var obj = XslxMappings.generateXlsxMappingsForRows(data, fullReport);
    var ws = buildSheet(obj.data, obj.model);
    var wb = new Workbook();
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    return wb;
}
function generateDoctorWorkBook(data, fullReport) {
    var ws_name = "Doctors";
    var obj = XslxMappings.generateDoctorsXlsxMappings(data, fullReport);
    var ws = buildSheet(obj.data, obj.model);
    var wb = new Workbook();
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    return wb;
}
module.exports.generateWorkBook = generateWorkBook; 
module.exports.generateDoctorWorkBook = generateDoctorWorkBook; 
module.exports.Workbook = Workbook; 
module.exports.buildSheet = buildSheet;