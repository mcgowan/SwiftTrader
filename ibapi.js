var _ = require('lodash');
var moment = require('moment');

function IB(clientId) {

	require('colors');

	this.subscriptions = [];
	this.orderIds = [];
	this.alerts = [];
	this.falses = [
		'Order Canceled - reason:'
	];

	this.ib = new (require('ib'))({
	clientId: clientId,
	// host: '127.0.0.1',
	// port: 7496
	}).on('error', function (err) {


		console.log(err);

		console.error(err.message.red);



	}).on('orderStatus', function (id, status, filled, remaining, avgFillPrice, permId,
		                               parentId, lastFillPrice, clientId, whyHeld) {
		// console.log('orderStatus... ' + id);

	}).on('result', function (event, args) {
		// if (!_.contains(['tickEFP', 'tickGeneric', 'tickOptionComputation', 'tickPrice', 'tickSize', 'tickString'], event)) {
		// 	console.log('%s %s', (event + ':').yellow, JSON.stringify(args));
		// }
	});
}

IB.prototype.orderTypes = Object.freeze({ Market: { }, Stop: { } });
IB.prototype.actions = Object.freeze({ Put: { }, Pop: { } });

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
				socket.emit('ticker:price', { socketId: socket.id, tickerId: tickerId, symbol: ticker.symbol, price: price });
		}
	});

};

IB.prototype.cancelTickerPrice = function (socket, tickerId) {
	var me = this;
	

	//remove from subscription...

	// if already subscribed to symbol (with different ticker id), unsubscribe first
	var sub = _.findWhere(me.subscriptions, { type: 'getTickerPrice', socketId: socket.id, data: { tickerId: tickerId } });

	if (sub) {
		sub.cancel();
		me.subscriptions = _.reject(me.subscriptions, function (subscription) {
			return subscription.type === 'getTickerPrice' && subscription.socketId === sub.socketId && subscription.data.tickerId === sub.data.tickerId;
		});
	}


	// this.ib.cancelMktData(tickerId);



};

IB.prototype.getPositions = function (socket, account) {
	var me = this;

	// get stops

	var stops = [];

	me.ib.reqOpenOrders();

	me.ib.on('openOrder', function (orderId, contract, order, orderState) {
		if (orderState.status === "PreSubmitted" && !_.findWhere(stops, { orderId: orderId, socketId: socket.id } )) {
			stops.push({ orderId: orderId, contract: contract, order: order, orderState: orderState });
		}
	}).on('openOrderEnd', function () {

		if (!_.findWhere(me.subscriptions, { type: 'reqAccountUpdates', socketId: socket.id, data: { accountId : account } })) {

			// socket not currently subscribed

			me.subscriptions.push({ type: 'reqAccountUpdates', socketId: socket.id, data: { accountId : account }, cancel: function(){ } });

			me.ib.reqAccountUpdates(true, account); // start-up

			me.ib.on('updatePortfolio', function (contract, position, marketPrice, marketValue, averageCost, unrealizedPNL, realizedPNL, accountName) {
				

				// console.log('updatePortfolio');

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

IB.prototype.placeOrder = function (socket, sockets, type, order) {
	var me = this;
	
	me.ib.reqIds(1);

	// console.log('placeOrder=ioioioioioioioio-->' + socket.id);

	// var socketId = socket.id;

	// var blah = function (alert) {
	// 				// socket.emit('alert', alert);
	// 				// console.log(socket.id + ' ' + me.alerts.length);
	// 				//return socket;
	// 			socket.emit('alert', alert);
	// 			console.log(socketId + ' ' + socket.id + ' ' + me.alerts.length);


	// }


	me.ib.once('nextValidId', function (orderId) {
		
		
		me.ib.on('error', function (error, type) {

			if (type && type.id > 0 && !_.find(me.falses, function(f) { return f === error.message })) {

				var alert = { id: type.id, socketId: socket.id, type: 'Error', code: type.code, message: error.message, time: moment() };

					// console.log(alert);

				if (!_.find(me.alerts, function (a) { return a.id === alert.id && a.code === alert.code && a.socketId === alert.socketId && alert.time.diff(a.time) < 500 })) {
					me.alerts.push(alert);
					

					// blah(alert);

					// var io = blah();

					socket.emit('alert', alert);
					// console.log(socketId + ' ' + socket.id + ' ' + me.alerts.length);



				}
			}

		});


		if (type === me.orderTypes.Market) {
			
			console.log('me.orderTypes.Market');
			console.log(order);

			me.ib.placeOrder(orderId, me.ib.contract.stock(order.symbol), me.ib.order.market(order.action, order.quantity, true));


		} else if (type === me.orderTypes.Stop) {
			console.log('me.orderTypes.Stop');
			console.log(order);

			me.ib.placeOrder(orderId, me.ib.contract.stock(order.symbol), me.ib.order.stop(order.action, order.quantity, order.stopPrice, true));

		}
		

		me.ib.on('orderStatus', function (id, status, filled, remaining, avgFillPrice, permId,
			parentId, lastFillPrice, clientId, whyHeld) {
			
			// console.log('orderStatus');

			if (id === orderId) {
				
				if (status === 'Filled' && remaining === 0) {
					setTimeout(function () {
						if (!_.find(me.orderIds, function (id) { return id === orderId })) {
							me.orderIds.push(orderId);

							console.log('sockets.emit -> positions:update (Filled)');


							sockets.emit('positions:update', { orderId: orderId, symbol: order.symbol, quantity: order.action === 'SELL' ? order.quantity * -1 : order.quantity });

							if (order.stop && !isNaN(order.stop) && order.stop > 0) {
								
								console.log('will place stop');
								
								// me.ib.placeOrder(orderId + 1, me.ib.contract.stock(order.symbol), me.ib.order.stop(order.action === 'SELL' ? 'BUY' : 'SELL', order.stopQuantity ? order.stopQuantity : order.quantity, order.stop, true));

								me.placeOrder(socket, sockets, me.orderTypes.Stop, { 
									symbol: order.symbol, 
									
									// action: order.action === 'SELL' ? 'BUY' : 'SELL', 
									action: order.stopAction ? order.stopAction : order.action === 'SELL' ? 'BUY' : 'SELL',


									quantity: order.stopQuantity && order.stopQuantity > 0 ? order.stopQuantity : order.quantity, 
									stopPrice: order.stop 
								});
							} 
						}
					}, 2000);
				} else if (status === 'PreSubmitted') {
					
						console.log('---before-----------sockets.emit -> positions:update (PreSubmitted)');

					if (!_.find(me.orderIds, function (id) { return id === orderId })) {
						me.orderIds.push(orderId);

						console.log('sockets.emit -> positions:update (PreSubmitted)');

						// console.log(output);
						sockets.emit('stop:updated', { orderId: orderId, symbol: order.symbol, stopPrice: order.stopPrice });

					}
				}
			}
		});
	});
}

IB.prototype.reversePosition = function (socket, sockets, position) {

	// if (position.stop) 
	// 	this.ib.cancelOrder(position.stop.orderId);

	// this.placeOrder(sockets, this.orderTypes.Market, { symbol: position.contract.symbol, action: position.quantity > 0 ? 'SELL' : 'BUY', quantity: Math.abs(position.quantity) });

	// position.reverse = true;

	// this.closePosition(sockets, position);

	if (position.stop) 
		this.ib.cancelOrder(position.stop.orderId);

	this.placeOrder(socket, sockets, this.orderTypes.Market, { symbol: position.contract.symbol, action: position.quantity > 0 ? 'SELL' : 'BUY', quantity: Math.abs(position.quantity) * 2 });


}

IB.prototype.closePosition = function (socket, sockets, position) {
	if (position.stop) 
		this.ib.cancelOrder(position.stop.orderId);

	this.placeOrder(socket, sockets, this.orderTypes.Market, { symbol: position.contract.symbol, action: position.quantity > 0 ? 'SELL' : 'BUY', quantity: Math.abs(position.quantity) });
}

IB.prototype.updatePosition = function (socket, sockets, action, position) {
	console.log('updatePosition');
	console.log(position);


	var put = Math.abs(position.put);
	var pop = Math.abs(position.pop);
	var qty = Math.abs(position.quantity);

	if (position.stop) {
		console.log('updatePosition - cancelling stop');
		
		this.ib.cancelOrder(position.stop.orderId);
	}

	var order = { 
		symbol: position.contract.symbol, 
		stop: parseFloat(position.stopPrice),
		stopAction: position.quantity > 0 ? 'SELL' : 'BUY'
	};

	if (action === this.actions.Put) {
		order.action = position.quantity > 0 ? 'BUY' : 'SELL';
		order.quantity = put;
		order.stopQuantity = qty + put;

	} else {
		order.action = position.quantity > 0 ? 'SELL' : 'BUY'; 
		order.quantity = pop;
		order.stopQuantity = qty - pop;
	}

	console.log(order);

	this.placeOrder(socket, sockets, this.orderTypes.Market, order);
}

IB.prototype.updateStop = function (socket, sockets, stop) {
	var me = this;

	console.log('updateStop');

	if (stop.orderId)
		me.ib.cancelOrder(stop.orderId);

	me.placeOrder(socket, sockets, me.orderTypes.Stop, { 
		symbol: stop.symbol, 
		action: stop.quantity > 0 ? 'SELL' : 'BUY', 
		quantity: Math.abs(parseInt(stop.quantity, 10)), 
		stopPrice: parseFloat(stop.stopPrice)
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
