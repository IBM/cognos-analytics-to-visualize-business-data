/**
 * Copyright 2020 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

const databaseUtil = require('../db/database-util');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const Query = require('../db/query-constants');
const dataUtil = require('./data-util');

module.exports = {
  // STORE DATA
  buildStoreFile: async (writeToCSV, writeToDB) => {
    console.log('Build Store File');

    const csvWriter = createCsvWriter({
      path: '../../data/out-stores.csv',
      header: [
        { id: 'storeId', title: 'StoreId' },
        { id: 'name', title: 'Store Name' },
        { id: 'address', title: 'Address' },
        { id: 'city', title: 'City' },
        { id: 'state', title: 'State' },
        { id: 'zip', title: 'Zip Code' },
        { id: 'lat', title: 'Latitude' },
        { id: 'long', title: 'Longitude' },
      ],
    });

    let data = dataUtil.getStoreData();
    if (writeToCSV) {
      csvWriter
        .writeRecords(data)
        .then(() => console.log('The store CSV file was written successfully'));
    }

    if (writeToDB) {
      await databaseUtil.updateDB(
        Query.STORE_CREATE_TABLE,
        Query.STORE_INSERT_TO_TABLE,
        data
      );
      console.log('Store table created..');
    }

    return true;
  },

  // PRODUCT DATA
  buildProductFile: async (writeToCSV, writeToDB) => {
    console.log('Build Product File');

    const csvWriter = createCsvWriter({
      path: '../../data/out-products.csv',
      header: [
        { id: 'productId', title: 'ProductId' },
        { id: 'name', title: 'Product Name' },
        { id: 'price', title: 'Price' },
        { id: 'restockAmt', title: 'Restock Amount' },
        { id: 'restockInt', title: 'Restock Interval' },
      ],
    });

    let data = dataUtil.getProductData();
    if (writeToCSV) {
      csvWriter
        .writeRecords(data)
        .then(() =>
          console.log('The product CSV file was written successfully')
        );
    }

    if (writeToDB) {
      await databaseUtil.updateDB(
        Query.PRODUCT_CREATE_TABLE,
        Query.PRODUCT_INSERT_TO_TABLE,
        data
      );
      console.log('Product table created..');
    }

    return true;
  },

  // WAREHOUSE INVENTORY DATA
  buildWarehouseFile: async (writeToCSV, writeToDB) => {
    console.log('Build Warehouse File');

    const csvWriter = createCsvWriter({
      path: '../../data/out-warehouses.csv',
      header: [
        { id: 'warehouseId', title: 'WarehouseId' },
        { id: 'productId', title: 'ProductId' },
        { id: 'date', title: 'Date' },
        { id: 'numItems', title: 'Number of Items' },
      ],
    });

    let data = dataUtil.getWarehouseData();

    if (writeToCSV) {
      csvWriter
        .writeRecords(data)
        .then(() =>
          console.log('The warehouse CSV file was written successfully')
        );
    }

    if (writeToDB) {
      await databaseUtil.updateDB(
        Query.WAREHOUSE_CREATE_TABLE,
        Query.WAREHOUSE_INSERT_TO_TABLE,
        data
      );
      console.log('Warehouse table created..');
    }

    return true;
  },

  // ORDER DATA (requests from stores, fulfilled by warehouse)
  buildOrderFile: async (writeToCSV, writeToDB) => {
    console.log('Build Order File');

    const csvWriter = createCsvWriter({
      path: '../../data/out-orders.csv',
      header: [
        { id: 'orderId', title: 'OrderId' },
        { id: 'date', title: 'Date' },
        { id: 'storeId', title: 'StoreId' },
        { id: 'productId', title: 'ProductId' },
        { id: 'itemPrice', title: 'Item Price' },
        { id: 'orderSize', title: 'Number of Items' },
      ],
    });

    let data = dataUtil.getOrderData();
    if (writeToCSV) {
      csvWriter
        .writeRecords(data)
        .then(() => console.log('The order CSV file was written successfully'));
    }

    if (writeToDB) {
      await databaseUtil.updateDB(
        Query.STORE_ORDER_CREATE_TABLE,
        Query.STORE_ORDER_INSERT_TO_TABLE,
        data
      );
      console.log('Order table created..');
    }

    return true;
  },

  // SALES DATA from stores
  buildSalesfile: async (writeToCSV, writeToDB) => {
    console.log('Build Sales File');

    const csvWriter = createCsvWriter({
      path: '../../data/out-sales.csv',
      header: [
        { id: 'storeId', title: 'StoreId' },
        { id: 'productId', title: 'ProductId' },
        { id: 'date', title: 'Date' },
        { id: 'amount', title: 'Quantity' },
      ],
    });

    let data = dataUtil.getSalesData();

    if (writeToCSV) {
      csvWriter
        .writeRecords(data)
        .then(() => console.log('The sales CSV file was written successfully'));
    }

    if (writeToDB) {
      await databaseUtil.updateDB(
        Query.SALES_CREATE_TABLE,
        Query.SALES_INSERT_TO_TABLE,
        data
      );
      console.log('Sales table created..');
    }

    return true;
  },
};
