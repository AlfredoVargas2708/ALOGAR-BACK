const ExcelJS = require('exceljs');

async function readExcel(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1); // Primera hoja
    const data = [];
    
    worksheet.eachRow((row, rowNumber) => {
        const rowData = {};
        row.eachCell((cell, colNumber) => {
            rowData[`Col${colNumber}`] = cell.value;
        });
        data.push(rowData);
    });

    return data;
}

module.exports = readExcel;
