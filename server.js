var express = require('express');

var app = express();

var tickers = require('./routes/tickers');

app.get('/api/tickers', tickers.search);

app.use(express.static(__dirname + '/public/'));

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('listening at http://%s:%s', host, port);
})