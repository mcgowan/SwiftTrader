var URL = 'http://d.yimg.com/autoc.finance.yahoo.com/autoc?query={0}&callback=YAHOO.Finance.SymbolSuggest.ssCallback';

exports.search = function (req, res) {
    var request = require('request'),
    	strformat = require('strformat'),
    	_ = require('underscore');

    var url = strformat(URL, req.query.search); 

    var s = request(url, function (error, response, body) {
        
        if (error) throw error;

        if (response.statusCode == 200) {

        	var result = [];

        	body = JSON.parse(body.substring(body.indexOf('(') + 1, body.lastIndexOf(')')));

        	var _ = require('underscore');

        	_.each(body.ResultSet.Result, function(item) {
        		result.push({ symbol: item.symbol, name: item.name, price: 0 });
                // result.push(item.name);

        	});

    		res.type('application/json');
            res.status(200).json(result)
        };
    });
}
