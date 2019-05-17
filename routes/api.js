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

const values = {
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
          const result = await $.get(apiUrl, {params: { symbol: stock, ...values }});
          if (result.status === 200) {
            const price = result.data['Global Quote']['05. price'];
            const { ip } = req;
            let stockFull = await Stock.findOne({ stock });
            if (stockFull) {
              if (like && stockFull.likes.indexOf(ip) === -1) {
              stockFull.likes.push(ip);
              await stockFull.save();
              }
            } else {
              let proxy = like ? 
                  {
                    stock,
                    price,
                    likes: [ip]
                  }: {
                    stock,
                    price
                  };
              stockFull = new Stock(proxy);
              await stockFull.save();
            }
            const likes = stockFull.likes.length;
            res.json({ stockData: { stock, likes, price } });
          } else {
            next(new Error('Api error'));
          }
        } catch (e) {
          next(e);
        }
      } else if (stock1 && stock2) {
        try {
          const stockOne = await $.get(apiUrl, {params: { symbol: stock1, ...values }});
          const stockTwo = await $.get(apiUrl, {params: { symbol: stock2, ...values }});
          if (stockOne.status === 200 && stockTwo.status === 200) {
            const stockOnePrice = stockOne.data['Global Quote']['05. price'];
            const stockTwoPrice = stockTwo.data['Global Quote']['05. price'];
            const { ip } = req;
            let stockOneFromDb = await Stock.findOne({ stock: stock1 });
            let stockTwoFromDb = await Stock.findOne({ stock: stock2 });
            
            if (stockOneFromDb) {
              if (like && stockOneFromDb.likes.indexOf(ip) === -1) {
                stockOneFromDb.likes.push(ip);
                await stockOneFromDb.save();
              }
            } else {
              let proxy = like ?
                  {
                    stock: stock1,
                    price: stockOnePrice,
                    likes: [ip]
                  }: {
                    stock: stock1,
                    price: stockOnePrice
                  };
              stockOneFromDb = new Stock(proxy);
              await stockOneFromDb.save();
            }
            if (stockTwoFromDb) {
              if (like && stockTwoFromDb.likes.indexOf(ip) === -1) {
                stockTwoFromDb.likes.push(ip);
                await stockTwoFromDb.save();
              }
            } else {
              let proxy = like ?
                  {
                    stock: stock2,
                    price: stockTwoPrice,
                    likes: [ip]
                  }: {
                    stock: stock2,
                    price: stockTwoPrice
                  };
                stockTwoFromDb = new Stock(proxy);
              await stockTwoFromDb.save();
            }
            const stockOneLikes = stockOneFromDb.likes.length;
            const stockTwoLikes = stockTwoFromDb.likes.length;
            res.json({stockData: [
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
            ]});
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
