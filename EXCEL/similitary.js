const pool = require('../PostgreSQL/db');
const readExcel = require('../EXCEL/read_excel.js');
const stringSimilarity = require('string-similarity');
const excelPath = 'C:\\Users\\varga\\OneDrive\\Documentos\\Proyecto-Alogar\\ALOGAR-BACK\\EXCEL\\ALOGAR_table_productos.xlsx'

async function searchProducts() {
    const productsInBBDD = await pool.query('SELECT * FROM products');
    const dataExcel = await readExcel(excelPath);
    let dataExcelProducts = dataExcel.map(item => item['Col3']);
    const bestMatches = [];

    dataExcelProducts.forEach(product => {
        const match = stringSimilarity.findBestMatch(product, productsInBBDD.rows.map(item => item.product));
        const mejor = match.bestMatch;
        const productInExcel = dataExcel.find(item => item['Col3'] === product);

        if(mejor.rating < 0.8) {
            return;
        }

        bestMatches.push({
            product: product,
            bestMatch: mejor.target,
            similarity: (mejor.rating * 100).toFixed(2),
            codeProductInExcel: productInExcel['Col2'],
            isWeighable: productInExcel['Col4'] === 'Si' ? true : false
        });
    });

    return bestMatches;
}

module.exports = {
    searchProducts
};