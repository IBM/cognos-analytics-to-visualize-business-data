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

require('dotenv').config({
  silent: true,
  path: '../../.env',
});

const ibmdb = require('ibm_db');

module.exports =  {

  // write out each review into a Db2 table
  updateDB: async (createQuery, insertQuery, data) => {
    const connStr = process.env.DB2WH_DSN;
    return new Promise((resolve, reject) => {
      ibmdb.open(connStr, function (err, conn) {
        if (err) {
          console.log('DB Connection Error: ' + err);
          reject(err);
        }
        // note: table name can NOT contain a dash
        conn.querySync(createQuery);
        conn.prepare(insertQuery, function (err, stmt) {
          if (err) {
            console.log(err);
            conn.closeSync();
            reject(err);
          }
          
          let i = 0;
          let keys = [];
          data.forEach(function (row) {
            Object.keys(row).forEach(function (key) {
              keys.push(row[key]);
            });          
            stmt.executeNonQuerySync(keys);
            i += 1;
            keys = [];
          });
  
          stmt.closeSync();
          console.log('Records written: ' + i);
          conn.closeSync();
          resolve();
        });
      });
    });
  }

};