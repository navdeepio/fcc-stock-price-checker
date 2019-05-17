/* eslint-env mocha */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const { assert } = require('chai');
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  suite('GET /api/stock-prices => stockData object', function () {
    test('1 stock', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'stockData');
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock.toLowerCase(), 'goog');
          done();
        });
    });
    test('1 stock with like', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'uber', like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'stockData');
          assert.equal(res.body.stockData.stock, 'uber');
          assert.equal(res.body.stockData.likes, 1);
          assert.property(res.body.stockData, 'price');
          done();
        });
    });
    test('1 stock with like again (ensure likes arent double counted)', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'uber', like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'stockData');
          assert.equal(res.body.stockData.stock, 'uber');
          assert.equal(res.body.stockData.likes, 1);
          assert.property(res.body.stockData, 'price');
          done();
        });
    });
    test('2 stocks', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock1: 'goog', stock2: 'msft' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData.length, 2);
          assert.isObject(res.body.stockData[0]);
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.property(res.body.stockData[0], 'stock');
          assert.property(res.body.stockData[0], 'price');
          done();
        });
    });
    test('2 stocks with like', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock1: 'uber', stock2: 'msft', like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData.length, 2);
          assert.isObject(res.body.stockData[0]);
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.property(res.body.stockData[0], 'stock');
          assert.property(res.body.stockData[0], 'price');
          done();
        });
    });
  });
});
