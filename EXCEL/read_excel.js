const xlsx = require('xlsx');
const path = require('path');

// Ruta al archivo Excel dentro del proyecto
const filePath = path.join(__dirname, 'EXCEL/ALOGAR_table_productos.xlsx');

// Leer el archivo Excel
const workbook = xlsx.readFile(filePath);

// Obtener el nombre de la primera hoja
const sheetName = workbook.SheetNames[0];

// Obtener los datos de la hoja
const worksheet = workbook.Sheets[sheetName];

// Convertir los datos a formato JSON
const data = xlsx.utils.sheet_to_json(worksheet);

exports = {
    data
}