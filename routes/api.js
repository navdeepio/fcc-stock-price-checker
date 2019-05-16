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
      const {
        stock, stock1, stock2, like,
      } = req.query;
      if (stock) {
        try {
          const result = await $.get(apiUrl, { symbol: stock, ...params });
          if (result.status === 200) {
            const symbol = result.data['01. symbol'];
            const price = result.data['05. price'];
            const { ip } = req;
            const stockFull = await Stock.findOne({ symbol });
            if (like && stockFull.likes.indexOf(ip) === -1) {
              stockFull.likes.push(ip);
              await stockFull.save();
            }
            const likes = stockFull.likes.length;
            res.json({ stockData: { symbol, likes, price } });
          } else {
            next(new Error('Api error'));
          }
        } catch (e) {
          next(e);
        }
      } else if (stock1 && stock2) {
        try {
          const stockOne = await $.get(apiUrl, { symbol: stock1, ...params });
          const stockTwo = await $.get(apiUrl, { symbol: stock2, ...params });
          if (stockOne.status === 200 && stockTwo.status === 200) {
            const { ip } = req;
            const stockOneFromDb = await Stock.findOne({ symbol: stock1 });
            const stockTwoFromDb = await Stock.findOne({ symbol: stock2 });
            if (like && stockOneFromDb.likes.indexOf(ip) === -1) {
              stockOneFromDb.likes.push(ip);
              await stockOneFromDb.save();
            }
            if (like && stockTwoFromDb.likes.indexOf(ip) === -1) {
              stockTwoFromDb.likes.push(ip);
              await stockTwoFromDb.save();
            }
            const stockOneLikes = stockOneFromDb.likes.length;
            const stockTwoLikes = stockTwoFromDb.likes.length;
            const stockOnePrice = stockOne['05. price'];
            const stockTwoPrice = stockTwo['05. price'];
            res.json([
              {
                stock: stock1,
                price: stockOnePrice,
                rel_likes: stockOneLikes - stockTwoLikes,
              },
              {
                stock: stock2,
                price: stockTwoPrice,
                rel_likes: stockTwoLikes - stockOneLikes,
              },
            ]);
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
