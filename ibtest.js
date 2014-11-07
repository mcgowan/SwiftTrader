
// 'use strict';

// require('colors');

// var _ = require('lodash');

// var ib = new (require('ib'))({
//   // clientId: 0,
//   // host: '127.0.0.1',
//   // port: 7496
// }).on('error', function (err) {
//   console.error(err.message.red);
// }).on('result', function (event, args) {
//   if (!_.contains(['position', 'positionEnd'], event)) {
//     console.log('%s %s', (event + ':').yellow, JSON.stringify(args));
//   }
// }).on('position', function (account, contract, pos, avgCost) {
//   console.log(
//     '%s %s%s %s%s %s%s %s%s',
//     '[position]'.cyan,
//     'account='.bold, account,
//     'contract='.bold, JSON.stringify(contract),
//     'pos='.bold, pos,
//     'avgCost='.bold, avgCost
//   );
// }).on('positionEnd', function () {
//   console.log('[positionEnd]'.cyan);
// });

// ib.connect();

// ib.reqPositions();

// ib.on('positionEnd', function () {
//   ib.disconnect();
// });

// /*
//  * examples/placeOrder.js
//  */

'use strict';

require('colors');

var _ = require('lodash');

var ib = new (require('ib'))({
  // clientId: 0,
  // host: '127.0.0.1',
  // port: 7496
}).on('error', function (err) {
  console.error(err.message.red);
}).on('result', function (event, args) {
  if (!_.contains(['nextValidId', 'openOrder', 'openOrderEnd', 'orderStatus'], event)) {
    console.log('%s %s', (event + ':').yellow, JSON.stringify(args));
  }
}).on('nextValidId', function (orderId) {
  console.log(
    '%s %s%d',
    '[nextValidId]'.cyan,
    'orderId='.bold, orderId
  );
}).on('openOrder', function (orderId, contract, order, orderState) {
  console.log(
    '%s %s%d %s%s %s%s %s%s',
    '[openOrder]'.cyan,
    'orderId='.bold, orderId,
    'contract='.bold, JSON.stringify(contract),
    'order='.bold, JSON.stringify(order),
    'orderState='.bold, JSON.stringify(orderState)
  );
}).on('openOrderEnd', function () {
  console.log('[openOrderEnd]'.cyan);
}).on('orderStatus', function (id, status, filled, remaining, avgFillPrice, permId,
                               parentId, lastFillPrice, clientId, whyHeld) {
  console.log(
    '%s %s%d %s%s %s%d %s%d %s%d %s%d %s%d %s%d %s%d %s%s',
    '[orderStatus]'.cyan,
    'id='.bold, id,
    'status='.bold, status,
    'filled='.bold, filled,
    'remaining='.bold, remaining,
    'avgFillPrice='.bold, avgFillPrice,
    'permId='.bold, permId,
    'parentId='.bold, parentId,
    'lastFillPrice='.bold, lastFillPrice,
    'clientId='.bold, clientId,
    'whyHeld='.bold, whyHeld
  );
});

ib.once('nextValidId', function (orderId) {
  console.log('Placing orders...'.yellow);

  // Place orders
  ib.placeOrder(orderId, ib.contract.stock('AAPL'), ib.order.market('SELL', 2, true));
  // ib.placeOrder(orderId + 1, ib.contract.stock('GOOG'), ib.order.market('BUY', 2, true));
  // ib.placeOrder(orderId + 2, ib.contract.stock('FB'), ib.order.market('SELL', 2, true));

  // ib.placeOrder(38, ib.contract.stock('AAPL'), ib.order.market('SELL', 2, true));
  // ib.placeOrder(39, ib.contract.stock('GOOG'), ib.order.market('BUY', 2, true));
  // ib.placeOrder(40, ib.contract.stock('FB'), ib.order.market('SELL', 2, true));

  // ib.placeOrder(orderId, ib.contract.stock('AAPL'), ib.order.market('BUY', 1, true));
  // ib.placeOrder(orderId + 1, ib.contract.stock('GOOG'), ib.order.market('SELL', 1, true));
  // ib.placeOrder(orderId + 2, ib.contract.stock('FB'), ib.order.market('BUY', 1, true));


  // Check open orders
  ib.reqOpenOrders();

  // Check next orderId
  ib.reqIds(1);

  // Cancel orders after 5 seconds.
  setTimeout(function () {
    console.log('Cancelling orders...'.yellow);
    ib.cancelOrder(orderId);
    ib.cancelOrder(orderId + 1);
    ib.cancelOrder(orderId + 2);

    ib.once('openOrderEnd', function () {
      console.log('Disconnecting...'.yellow);
      ib.disconnect();
    });

    ib.reqAllOpenOrders();
  }, 5000);

});

ib.connect()
  .reqIds(1);



// 'use strict';

// require('colors');

// var _ = require('lodash');

// var ib = new (require('ib'))({
//   // clientId: 0,
//   // host: '127.0.0.1',
//   // port: 7496
// }).on('error', function (err) {
//   console.error(err.message.red);
// }).on('result', function (event, args) {
//   if (!_.contains(['position', 'positionEnd'], event)) {
//     console.log('%s %s', (event + ':').yellow, JSON.stringify(args));
//   }
// }).on('position', function (account, contract, pos, avgCost) {
//   console.log(
//     '%s %s%s %s%s %s%s %s%s',
//     '[position]'.cyan,
//     'account='.bold, account,
//     'contract='.bold, JSON.stringify(contract),
//     'pos='.bold, pos,
//     'avgCost='.bold, avgCost
//   );
// }).on('positionEnd', function () {
//   console.log('[positionEnd]'.cyan);
// });

// ib.connect();

// ib.reqPositions();

// ib.on('positionEnd', function () {
//   ib.disconnect();
// });


// 'use strict';

// require('colors');

// var _ = require('lodash');

// var ib = new (require('ib'))({
//   // clientId: 0,
//   // host: '127.0.0.1',
//   // port: 7496
// }).on('error', function (err) {
//   console.error(err.message.red);
// }).on('result', function (event, args) {
//   if (!_.contains(['accountDownloadEnd', 'updateAccountTime', 'updateAccountValue', 'updatePortfolio'], event)) {
//     console.log('%s %s', (event + ':').yellow, JSON.stringify(args));
//   }
// }).on('accountDownloadEnd', function (accountName) {
//   console.log(
//     '%s %s%s',
//     '[accountDownloadEnd]'.cyan,
//     'accountName='.bold, accountName
//   );
// }).on('updateAccountTime', function (timeStamp) {
//   console.log(
//     '%s %s%s',
//     '[updateAccountTime]'.cyan,
//     'timeStamp='.bold, timeStamp
//   );
// }).on('updateAccountValue', function (key, value, currency, accountName) {
//   console.log(
//     '%s %s%s %s%s %s%s %s%s',
//     '[updateAccountValue]'.cyan,
//     'key='.bold, key,
//     'value='.bold, value,
//     'currency='.bold, currency,
//     'accountName='.bold, accountName
//   );
// }).on('updatePortfolio', function (contract, position, marketPrice, marketValue, averageCost, unrealizedPNL, realizedPNL, accountName) {
//   console.log(
//     '%s %s%s %s%d %s%d %s%d %s%d %s%d %s%d %s%s',
//     '[updatePortfolio]'.cyan,
//     'contract='.bold, JSON.stringify(contract),
//     'position='.bold, position,
//     'marketPrice='.bold, marketPrice,
//     'marketValue='.bold, marketValue,
//     'averageCost='.bold, averageCost,
//     'unrealizedPNL='.bold, unrealizedPNL,
//     'realizedPNL='.bold, realizedPNL,
//     'accountName='.bold, accountName
//   );
// });

// ib.connect();

// ib.reqAccountUpdates(true, 'U1234567');

// ib.on('accountDownloadEnd', function () {
//   console.log('Cancelling account updates subscription...'.yellow);
//   ib.reqAccountUpdates(false, 'All');
//   ib.disconnect();
// });




// var util = require('util');

// require('colors');

// var _ = require('lodash');

// var ib = new (require('ib'))({
//   // clientId: 0,
//   // host: '127.0.0.1',
//   // port: 7496
// }).on('error', function (err) {
//   console.error(err.message.red);
// }).on('result', function (event, args) {
//   if (!_.contains(['tickEFP', 'tickGeneric', 'tickOptionComputation', 'tickPrice',
//                    'tickSize', 'tickString'], event)) {
//     console.log('%s %s', (event + ':').yellow, JSON.stringify(args));
//   }
// }).on('tickEFP', function (tickerId, tickType, basisPoints, formattedBasisPoints,
//                            impliedFuturesPrice, holdDays, futureExpiry, dividendImpact,
//                            dividendsToExpiry) {
//   console.log(
//     'tickEFP %s %s%d %s%d %s%s %s%d %s%d %s%s %s%d %s%d',
//     util.format('[%s]', ib.util.tickTypeToString(tickType)).cyan,
//     'tickerId='.bold, tickerId,
//     'basisPoints='.bold, basisPoints,
//     'formattedBasisPoints='.bold, formattedBasisPoints,
//     'impliedFuturesPrice='.bold, impliedFuturesPrice,
//     'holdDays='.bold, holdDays,
//     'futureExpiry='.bold, futureExpiry,
//     'dividendImpact='.bold, dividendImpact,
//     'dividendsToExpiry='.bold, dividendsToExpiry
//   );
// }).on('tickGeneric', function (tickerId, tickType, value) {
//   console.log(
//     'tickGeneric %s %s%d %s%d',
//     util.format('[%s]', ib.util.tickTypeToString(tickType)).cyan,
//     'tickerId='.bold, tickerId,
//     'value='.bold, value
//   );
// }).on('tickOptionComputation', function (tickerId, tickType, impliedVol, delta, optPrice,
//                                          pvDividend, gamma, vega, theta, undPrice) {
//   console.log(
//     'tickOptionComputation %s %s%d %s%s %s%s %s%s %s%d %s%s %s%s %s%s %s%d',
//     util.format('[%s]', ib.util.tickTypeToString(tickType)).cyan,
//     'tickerId='.bold, tickerId,
//     'impliedVol='.bold, ib.util.numberToString(impliedVol),
//     'delta='.bold, ib.util.numberToString(delta),
//     'optPrice='.bold, ib.util.numberToString(optPrice),
//     'pvDividend='.bold, pvDividend,
//     'gamma='.bold, ib.util.numberToString(gamma),
//     'vega='.bold, ib.util.numberToString(vega),
//     'theta='.bold, ib.util.numberToString(theta),
//     'undPrice='.bold, undPrice
//   );
// }).on('tickPrice', function (tickerId, tickType, price, canAutoExecute) {
//   console.log(
//     'tickPrice %s %s%d %s%d %s%s',
//     util.format('[%s]', ib.util.tickTypeToString(tickType)).cyan,
//     'tickerId='.bold, tickerId,
//     'price='.bold, price,
//     'canAutoExecute='.bold, canAutoExecute
//   );
// }).on('tickSize', function (tickerId, sizeTickType, size) {
//   console.log(
//     'tickSize %s %s%d %s%d',
//     util.format('[%s]', ib.util.tickTypeToString(sizeTickType)).cyan,
//     'tickerId:'.bold, tickerId,
//     'size:'.bold, size
//   );
// }).on('tickString', function (tickerId, tickType, value) {
//   console.log(
//     'tickString %s %s%d %s%s',
//     util.format('[%s]', ib.util.tickTypeToString(tickType)).cyan,
//     'tickerId='.bold, tickerId,
//     'value='.bold, value
//   );
// });

// ib.connect();

// // Forex
// // ib.reqMktData(1, ib.contract.forex('EUR'), '', false);
// // ib.reqMktData(2, ib.contract.forex('GBP'), '', false);
// // ib.reqMktData(3, ib.contract.forex('CAD'), '', false);
// // ib.reqMktData(4, ib.contract.forex('HKD'), '', false);
// // ib.reqMktData(5, ib.contract.forex('JPY'), '', false);
// // ib.reqMktData(6, ib.contract.forex('KRW'), '', false);

// // Stock
// ib.reqMktData(11, ib.contract.stock('AAPL'), '', false);
// // ib.reqMktData(12, ib.contract.stock('AMZN'), '', false);
// // ib.reqMktData(13, ib.contract.stock('GOOG'), '', false);
// // ib.reqMktData(14, ib.contract.stock('FB'), '', false);

// // Option
// // ib.reqMktData(21, ib.contract.option('AAPL', '201407', 500, 'C'), '', false);
// // ib.reqMktData(22, ib.contract.option('AMZN', '201404', 350, 'P'), '', false);
// // ib.reqMktData(23, ib.contract.option('GOOG', '201406', 1000, 'C'), '', false);
// // ib.reqMktData(24, ib.contract.option('FB', '201406', 50, 'P'), '', false);

// // Disconnect after 7 seconds.
// // setTimeout(function () {
// //   console.log('Cancelling market data subscription...'.yellow);

//   // Forex
//   // ib.cancelMktData(1);
//   // ib.cancelMktData(2);
//   // ib.cancelMktData(3);
//   // ib.cancelMktData(4);
//   // ib.cancelMktData(5);
//   // ib.cancelMktData(6);

//   //Stock
//   // ib.cancelMktData(11);
//   // ib.cancelMktData(12);
//   // ib.cancelMktData(13);
//   // ib.cancelMktData(14);

//   // Option
//   // ib.cancelMktData(21);
//   // ib.cancelMktData(22);
//   // ib.cancelMktData(23);
//   // ib.cancelMktData(24);

// //   ib.disconnect();
// // }, 7000);