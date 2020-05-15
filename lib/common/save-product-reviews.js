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

/**
 * To Run:
 * cd scripts
 * node store-disco-enrichments.js
 *
 * Queries Watson Discovery to retrieve all reviews which include sentiment data.
 * That data is then written out to build a new csv file - 'data/Reviews-with-sentiment.csv'.
 * Each record is also written to a Db2 instance. Instructions for how to do this:
 * https://developer.ibm.com/mainframe/2019/08/07/accessing-ibm-db2-on-node-js/
 * https://github.com/ibmdb/node-ibm_db/blob/master/APIDocumentation.md
 */

require('dotenv').config({
  silent: true,
  path: '../../.env',
});

const databaseUtil = require('../db/database-util');
const Query = require('../db/query-constants');
const csv = require('csv-parser');
const fs = require('fs');


module.exports = {
  buildProductReviewFile: (writeToDB) => {
    buildReviewFile(writeToDB);
  },
};

// write out each review as a row into a csv file
function buildReviewFile(writeToDB) {
  console.log('Build product review CSV Files');
  // console.log(JSON.stringify(results, null, 2));

  let reviews = [];
  let keywords = [];

  fs.createReadStream('../../data/out-reviews.csv')
    .pipe(csv())
    .on('data', (review) => {      
      reviews.push(review);
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
    });

  fs.createReadStream('../../data/out-keywords.csv')
    .pipe(csv())
    .on('data', (keyword) => {      
      keywords.push(keyword);
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
    });

  if(writeToDB) {
    databaseUtil.updateDB(
      Query.PRODUCT_REVIEWS_CREATE_TABLE,
      Query.PRODUCT_REVIEWS_INSERT_TO_TABLE,
      reviews
    );

    databaseUtil.updateDB(
      Query.PRODUCT_KEYWORDS_CREATE_TABLE,
      Query.PRODUCT_KEYWORDS_INSERT_TO_TABLE,
      keywords
    );
  }

}
