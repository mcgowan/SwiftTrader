function ib(clientId) {

	// require('colors');

	// this.subscriptions = [];
	// this.orderIds = [];
	// this.alerts = [];
	// this.falses = [
	// 	'Order Canceled - reason:'
	// ];

	// this.ib = new (require('ib'))({
	// clientId: clientId,
	// // host: '127.0.0.1',
	// // port: 7496
	// }).on('error', function (err) {


	// 	console.log(err);

	// 	console.error(err.message.red);



	// }).on('orderStatus', function (id, status, filled, remaining, avgFillPrice, permId,
	// 	                               parentId, lastFillPrice, clientId, whyHeld) {
	// 	// console.log('orderStatus... ' + id);

	// }).on('result', function (event, args) {
	// 	// if (!_.contains(['tickEFP', 'tickGeneric', 'tickOptionComputation', 'tickPrice', 'tickSize', 'tickString'], event)) {
	// 	// 	console.log('%s %s', (event + ':').yellow, JSON.stringify(args));
	// 	// }
	// });

}

module.exports = ib;