exports.list = function (req, res) {







DECEMBER 22, 2009
GREENIDO
API, FINANCE, YAHOO
5 COMMENTS
London vis a vis Finance
I was looking for long time after a way to get some finance data from sources like: google, yahoo etc’ without the need to parse long html pages. Then a friend point me to some simple pipe that fetch this information. From there the (short) step to gain access to this nice (hidden) API was inevitable.

In a nutshell, if you want to get data on some stocks you can use this request:
http://finance.yahoo.com/d/quotes.csv?s=GE+PTR+MSFT&f=snd1l1yr



http://d.yimg.com/autoc.finance.yahoo.com/autoc?query=Valtech&callback=YAHOO.Finance.SymbolSuggest.ssCallback