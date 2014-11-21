// var IB = require("./ibapi");
// var ib = new IB();

function SocketManager() {
	
	console.log('SocketManager awake...');

	var io = require('socket.io').listen(app.listen(3000));
	var ib = require("./ib");

	io.on('connection', function (socket) {
		
		socket.on('error', function (err) {
			console.error(err);

		}).on('disconnect',function(){
			// any cleanup tasks over here....

		}).on('ticker:price', function (data) {



			// ib.getTickerPrice(socket, data);

			// var price = 99.98;

			// setInterval(function() { 
			// 	socket.emit('ticker:price', { tickerId: data.id, price: price++ });
			// }, 1000);

		}).on('ticker:cancel', function (data) {
			ib.cancelTickerPrice(socket, data);



		}).on('positions:get', function (data) {
			// ib.getPositions(socket, 'U1234567'); //TODO
			ib.getPositions(socket, 'DU210102'); //TODO

		}).on('position:reverse', function (data) {
			ib.reversePosition(socket, io.sockets, data);

		}).on('position:close', function (data) {
			ib.closePosition(socket, io.sockets, data);

		}).on('position:put', function (data) {
			ib.updatePosition(socket, io.sockets, ib.actions.Put, data);


		}).on('position:pop', function (data) {
			ib.updatePosition(socket, io.sockets, ib.actions.Pop, data);

		}).on('stop:update', function (data) {
			ib.updateStop(socket, io.sockets, data);
			
		
		}).on('order:place', function (data) {
			ib.placeOrder(socket, io.sockets, ib.orderTypes.Market, data);

		}).on('orders:open', function () {
			console.log('orders:open');
			ib.getOpenOrders(socket);

		});
	});
}

module.exports = SocketManager;