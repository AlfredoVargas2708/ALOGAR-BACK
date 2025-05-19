const axios = require('axios');
const cheerio = require('cheerio');
const urlPrincipal = 'https://alogar.cl'
const pool = require('../PostgreSQL/db');
const excelPath = 'C:\\Users\\varga\\OneDrive\\Documentos\\Proyecto-Alogar\\ALOGAR-BACK\\EXCEL\\ALOGAR_table_productos.xlsx'
const readExcel = require('../EXCEL/read_excel.js');

class WebController {
    async scrappingCategories(req, res) {
        try {
            const { $ } = await urlData(urlPrincipal);
            const categories = [];
            const categoryElements = $('.collection-grid-item');

            categoryElements.each((index, element) => {
                const category = {
                    category_id: index,
                    category: capitalizeWords($(element).find('.collection-grid-item__title').text().trim()),
                    category_image: 'https:' + $(element).find('.collection-grid-item__overlay').get(0).attribs['data-bgset'].split(' ')[0],
                    category_url: urlPrincipal + $(element).find('a').attr('href')
                };
                categories.push(category);
            });

            const truncateQuery = 'TRUNCATE TABLE categories RESTART IDENTITY CASCADE';
            await pool.query(truncateQuery);

            const query = 'INSERT INTO categories (category, category_image, category_url) VALUES ($1, $2, $3)';
            const insertPromises = categories.map(category => {
                return pool.query(query, [category.category, category.category_image, category.category_url]);
            });

            await Promise.all(insertPromises);

            res.status(200).json({ message: 'Categorías guardadas correctamente', categories });
        } catch (error) {
            console.error('Error en scrappingCategories:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async scrappingCategoriesProducts(req, res) {
        try {
            const categories = await pool.query('SELECT * FROM categories');

            const products = [];

            let dataExcel = await readExcel(excelPath);
            let dataExcelCodes = dataExcel.map(item => item['Col2']);
            let dataExcelProducts = dataExcel.map(item => item['Col3']);
            let dataExcelWeighable = dataExcel.map(item => item['Col4']);

            for (const category of categories.rows) {
                const cantPages = await changeUrl(category.category_url);

                const categoryProducts = [];
                for (let i = 1; i <= cantPages; i++) {
                    const { $ } = await urlData(category.category_url + '?page=' + i);
                    const productElements = $('.grid-view-item.product-card');
                    productElements.each((index, element) => {
                        const product = {
                            product: capitalizeWords($(element).find('.grid-view-item__title').text().trim()),
                            price: Number($(element).find('.price-item.price-item--regular').text().trim().replace('$', '').replace('.', '')),
                            product_url: urlPrincipal + $(element).find('a').attr('href'),
                            product_image: 'https:' + $(element).find('.grid-view-item__image').get(0).attribs['data-src'].split(' ')[0].replace('{width}', '300'),
                            product_code: dataExcelCodes[dataExcelProducts.indexOf($(element).find('.grid-view-item__title').text().trim())] !== undefined ? dataExcelCodes[dataExcelProducts.indexOf($(element).find('.grid-view-item__title').text().trim())] : null,
                            product_weighable: dataExcelWeighable[dataExcelProducts.indexOf($(element).find('.grid-view-item__title').text().trim())] !== undefined ? dataExcelWeighable[dataExcelProducts.indexOf($(element).find('.grid-view-item__title').text().trim())] === 'Si' ? true : false : null,
                        };
                        categoryProducts.push(product);
                    });
                }
                products.push({
                    id_category: category.category_id,
                    category: category.category,
                    products: categoryProducts
                });
            }

            const truncateQuery = 'TRUNCATE TABLE products RESTART IDENTITY CASCADE';
            await pool.query(truncateQuery);

            const query = 'INSERT INTO products (product, price, product_url, product_image, id_category, product_code, product_weighable) VALUES ($1, $2, $3, $4, $5, $6, $7)';
            const insertPromises = products.flatMap(category => {
                return category.products.map(product => {
                    return pool.query(query, [product.product, product.price, product.product_url, product.product_image, category.id_category, product.product_code, product.product_weighable]);
                });
            });

            await Promise.all(insertPromises);

            res.status(200).json({ message: 'Productos insertados correctamente', products });
        } catch (error) {
            console.error('Error en scrappingCategoriesProducts:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }

    async getLogo(req, res) {
        try {
            const { $ } = await urlData(urlPrincipal);
        } catch (error) {
            console.error('Error en getLogo:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }
}

const urlData = async (url) => {
    let response = await axios.get(url);
    let html = response.data;
    let $ = cheerio.load(html);

    return { $ };
}

const changeUrl = async (url) => {
    let response = await axios.get(url);
    let html = response.data;
    let $ = cheerio.load(html);
    let pagination = $('ul.list--inline.pagination');

    if (pagination.length > 0) {
        const paginationText = pagination.find('li.pagination__text').text().trim();

        // Expresión regular para extraer el número total de páginas
        const pageMatch = paginationText.match(/de\s+(\d+)/);

        if (pageMatch && pageMatch[1]) {
            return parseInt(pageMatch[1], 10);
        }
    } else {
        return 1; // Si no hay paginación, asumimos que hay una sola página
    }
    return 0; // Si no se encuentra el número de páginas, devolvemos 0
}

const capitalizeWords = (str) => {
    return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

module.exports = WebController