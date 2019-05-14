/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';


const mongoose = require('mongoose');

const CONNECTION_STRING = process.env.DB;
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });
const $ = require('axios');
const Stock = require('../Stock');

const API_KEY = 'W3YXKOCR8NKTTCDX';
const apiUrl = 'https://www.alphavantage.co/query';

const params = {
  function: 'GLOBAL_QUOTE',
  apikey: API_KEY,
};


module.exports = (app) => {
  app.route('/api/stock-prices')
    .get(async (req, res, next) => {
      const { stock, like } = req.query;
      if (stock) {
        try {
          const result = await $.get(apiUrl, { symbol: stock, ...params });
          if (result.status === 200) {
            const symbol = result.data['01. symbol'];
            const price = result.data['05. price'];
            const { ip } = req;
            // hello world

          } else {
            next(new Error('Api error'));
          }
        } catch (e) {
          next(e);
        }
      } else {
        res.status(400).json({ message: 'invalid request' });
      }

      
    });
    
};
