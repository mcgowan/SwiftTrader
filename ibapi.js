var _ = require('lodash');

function IB() {

	require('colors');

	this.subscriptions = [];

	this.ib = new (require('ib'))({
	// clientId: 0,
	// host: '127.0.0.1',
	// port: 7496
	}).on('error', function (err) {
		console.error(err.message.red);
	}).on('orderStatus', function (id, status, filled, remaining, avgFillPrice, permId,
		                               parentId, lastFillPrice, clientId, whyHeld) {
		console.log('orderStatus... ' + id);

	}).on('result', function (event, args) {
		// if (!_.contains(['tickEFP', 'tickGeneric', 'tickOptionComputation', 'tickPrice', 'tickSize', 'tickString'], event)) {
		// 	console.log('%s %s', (event + ':').yellow, JSON.stringify(args));
		// }
	});

	// this.
}

IB.prototype.connect = function () {
	this.ib.connect();
};

IB.prototype.disconnect = function () {
	this.ib.disconnect();
};

IB.prototype.getTickerPrice = function (socket, ticker) {
	var me = this;

	// if already subscribed to symbol (with different ticker id), unsubscribe first
	var sub = _.findWhere(me.subscriptions, { type: 'getTickerPrice', socketId: socket.id, data: { symbol: ticker.symbol } });

	if (sub) {
		sub.cancel();
		me.subscriptions = _.reject(me.subscriptions, function (subscription) {
			return subscription.type === 'getTickerPrice' && subscription.socketId === sub.socketId && subscription.data.tickerId === sub.data.tickerId;
		});
	}

	if (_.findWhere(me.subscriptions, { type: 'getTickerPrice', socketId: socket.id, data: { tickerId: ticker.id } })) {

		// cancel to reuse ticker id

		me.ib.cancelMktData(ticker.id);

		// remove previous subscription

		me.subscriptions = _.reject(me.subscriptions, function (sub) {
			return sub.type === 'getTickerPrice' && sub.socketId === socket.id && sub.data.tickerId === ticker.id;
		});
	}

	me.subscriptions.push({ type: 'getTickerPrice', socketId: socket.id, data: { tickerId: ticker.id, symbol: ticker.symbol }, cancel: function () {
		me.ib.cancelMktData(ticker.id);
	}});

	me.ib.reqMktData(ticker.id, me.ib.contract.stock(ticker.symbol), '', false);

	me.ib.on('tickPrice', function (tickerId, tickType, price, canAutoExecute) {
		if (me.ib.util.tickTypeToString(tickType) === 'LAST') {
			
			// only emit to subscribed sockets

			if (_.findWhere(me.subscriptions, { type: 'getTickerPrice', socketId: socket.id, data: { tickerId: tickerId, symbol: ticker.symbol } }))
				socket.emit('ticker:price', { tickerId: tickerId, symbol: ticker.symbol, price: price });
		}
	});

};

IB.prototype.cancelTickerPrice = function (tickerId) {
	this.ib.cancelMktData(tickerId);
};

IB.prototype.getPositions = function (socket, account) {
	var me = this;

	// get stops

	var stops = [];

	me.ib.reqOpenOrders();

	me.ib.on('openOrder', function (orderId, contract, order, orderState) {
		
		console.log('openOrder');
		if (orderState.status === "PreSubmitted" && !_.findWhere(stops, { orderId: orderId, socketId: socket.id } )) {
			console.log('stop .push');
			
			stops.push({ orderId: orderId, contract: contract, order: order, orderState: orderState });
		}
	}).on('openOrderEnd', function () {

		if (!_.findWhere(me.subscriptions, { type: 'reqAccountUpdates', socketId: socket.id, data: { accountId : account } })) {

			// socket not currently subscribed

			me.subscriptions.push({ type: 'reqAccountUpdates', socketId: socket.id, data: { accountId : account }, cancel: function(){ } });

			me.ib.reqAccountUpdates(true, account); // start-up

			me.ib.on('updatePortfolio', function (contract, position, marketPrice, marketValue, averageCost, unrealizedPNL, realizedPNL, accountName) {
				var position = { 
					socketId: socket.id,
					contract: contract,
				 	quantity: position,
				    marketPrice: marketPrice,
				    marketValue: marketValue,
				    averageCost: averageCost,
				    unrealizedPNL: unrealizedPNL,
				    realizedPNL: realizedPNL,
				    accountName: accountName
				}

				if (position.quantity !== 0)
					if (_.findWhere(me.subscriptions, { type: 'reqAccountUpdates', socketId: socket.id, data: { accountId : account } })) {

						var stop = _.find(stops, function(s) {
							console.log(s.contract.symbol + ' ' + position.contract.symbol);
							return s.contract.symbol === position.contract.symbol;
						});

						if (stop) {
							position.stop = stop;
							position.stopPrice = stop.order.auxPrice;
						}

						socket.emit('positions:get', position);
					}
			});

			me.ib.on('accountDownloadEnd', function () {
				
				// unsubscribe socket

				me.subscriptions = _.reject(me.subscriptions, function (sub) {
					return sub.type === 'reqAccountUpdates' && sub.socketId === socket.id && sub.data.accountId === account;
				});

				me.ib.reqAccountUpdates(false, 'All');
			});
		}
	});
};

IB.prototype.placeOrder = function (sockets, order) {
	var me = this;
	
	me.ib.reqIds(1);
	
	me.ib.once('nextValidId', function (orderId) {

		me.ib.placeOrder(orderId, me.ib.contract.stock(order.symbol), me.ib.order.market(order.action, order.quantity, true));

		if (order.stop && order.stop > 0) {
			me.ib.placeOrder(orderId + 1, me.ib.contract.stock(order.symbol), me.ib.order.stop(order.action === 'SELL' ? 'BUY' : 'SELL', order.quantity, order.stop, true));
		}

		me.ib.on('orderStatus', function (id, status, filled, remaining, avgFillPrice, permId,
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


			if (id === orderId && status === 'Filled' && remaining === 0) {

				// console.log(
				// 	'%s %s%d %s%s %s%d %s%d %s%d %s%d %s%d %s%d %s%d %s%s',
				// 	'[orderStatus]'.cyan,
				// 	'id='.bold, id,
				// 	'status='.bold, status,
				// 	'filled='.bold, filled,
				// 	'remaining='.bold, remaining,
				// 	'avgFillPrice='.bold, avgFillPrice,
				// 	'permId='.bold, permId,
				// 	'parentId='.bold, parentId,
				// 	'lastFillPrice='.bold, lastFillPrice,
				// 	'clientId='.bold, clientId,
				// 	'whyHeld='.bold, whyHeld
				// );

				setTimeout(function () {
					sockets.emit('positions:update', { orderId: orderId, symbol: order.symbol, quantity: order.action === 'SELL' ? order.quantity * -1 : order.quantity });
				}, 2000);
			}
		});
	});
}

IB.prototype.closePosition = function (sockets, position) {
	if (position.stop) 
		this.ib.cancelOrder(position.stop.orderId);

	this.placeOrder(sockets, { symbol: position.contract.symbol, action: position.quantity > 0 ? 'SELL' : 'BUY', quantity: Math.abs(position.quantity) });
}

IB.prototype.test = function () {
	console.log('test succeeded');
}

IB.prototype.getOpenOrders = function (socket) {
	var me = this;

	this.test();

	me.ib.reqOpenOrders();


	me.ib.on('openOrder', function (orderId, contract, order, orderState) {
	  console.log(
	    '%s %s%d %s%s %s%s %s%s',
	    '[openOrder]'.cyan,
	    'orderId='.bold, orderId,
	    'contract='.bold, JSON.stringify(contract),
	    'order='.bold, JSON.stringify(order),
	    'orderState='.bold, JSON.stringify(orderState)
	  );
	});

	me.ib.on('orderStatus', function (id, status, filled, remaining, avgFillPrice, permId,
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

	me.ib.on('openOrderEnd', function () {
	  console.log('[openOrderEnd]'.cyan);
	});



}

IB.prototype.clean = function (socket) {

	var subscriptions = this.subscriptions;

	_.each(subscriptions, function (subscription) {
		if (subscription.socketId === socket.id) {
			subscription.cancel();
		}
	});

	this.subscriptions = _.reject(subscriptions, function (subscription) {
		return subscription.socketId === socket.id;
	});
};

module.exports = IB;
