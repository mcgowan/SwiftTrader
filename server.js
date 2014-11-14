var express = require('express');

var app = express();


// web api methods...

var yahoo = require('./routes/tickers');
app.get('/api/tickers', yahoo.search);


// static resources...
app.use(express.static(__dirname + '/public/'));


// socket.io gateway to IB...

var IB = require("./ibapi");
var ib = new IB();

ib.connect();

var io = require('socket.io').listen(app.listen(3000));

io.on('connection', function (socket) {
	socket.on('error', function (err) {
		console.error(err.message.red);
	}).on('disconnect',function(){
		ib.clean(socket);

	// TODO: convert api to socket method...
	// }).on('tickers:search', function (data) {
	// 	yahoo.search(data);

	}).on('ticker:price', function (data) {
		
		ib.getTickerPrice(socket, data);

		// var price = 99.98;

		// setInterval(function() { 
		// 	socket.emit('ticker:price', { tickerId: data.id, price: price++ });
		// }, 1000);

	}).on('positions:get', function (data) {
		// ib.getPositions(socket, 'U1234567'); //TODO
		ib.getPositions(socket, 'DU210102'); //TODO

	}).on('position:close', function (data) {
		ib.closePosition(io.sockets, data);
	}).on('position:put', function (data) {
		ib.updatePosition(io.sockets, ib.actions.Put, data);
	}).on('position:pop', function (data) {
		ib.updatePosition(io.sockets, ib.actions.Pop, data);
	}).on('stop:update', function (data) {
		ib.updateStop(io.sockets, data);
	}).on('order:place', function (data) {
		ib.placeOrder(io.sockets, ib.orderTypes.Market, data);
	}).on('orders:open', function () {
		console.log('orders:open');
		ib.getOpenOrders(socket);
	});
});

function exitHandler(options, err) {
    if (options.cleanup) {
    	ib.disconnect();
	}	
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
