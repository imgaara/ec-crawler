const cheerio = require("cheerio")
// Crawler-per parser template

// header method is optional
exports.header = function(options, crawler_handle) {
	// The "options" is request option
}

function debug(str) {
	// console.log(str)
}

function parseProduct($, li) {
	var rank = li.attr('data-result-rank')
	var id = li.attr('data-asin')
	var detailPageTitle = ''
	var detailPageLink = ''
	var representImgLink = ''
	var priceSymbolPrime = ''
	var pricePrime = -1
	var priceSymbol = ''
	var price = -1
	var rate = -1
	var commentNum = -1
	var isBestSeller = -1
	var category = ''

	if (!id) {
		return null;
	}

	li.find('.s-item-container').children('div').each(function(i, elem) {
		var div = $(this)

		if (div.hasClass('a-spacing-top-micro')) {
			// console.log(div.html())
			if (div.html().indexOf('ベストセラー') !== -1) {
				isBestSeller = 1
				debug("best seller " + id)
			} else {
				isBestSeller = 0
			}

			var categoryBlock = div.find('.a-badge-supplementary-text')
			if (categoryBlock) {
				category = categoryBlock.text()
			}
			debug("get category " + category)
			return;
		}

		var detailPage = div.find('.s-access-detail-page')
		if (detailPage.length > 0) {
			detailPageTitle = detailPage.text()
			detailPageLink = detailPage.attr('href')
			if (!detailPageLink.startsWith("http")) {
				detailPageLink = 'https://www.amazon.co.jp' + detailPageLink
			}
			debug("detailPageTitle " + detailPageTitle)
			debug("detailPageLink " + detailPageLink)
			return;
		}

		if (div.hasClass('a-spacing-base')) {
			var representImgBlock = div.find('a')
			representImgLink = representImgBlock.find('img').first().attr('src')
			debug("representImgLink " + representImgLink)
			return;
		}

		var priceDiv = div.find('.a-price-whole')
		if (priceDiv.length > 0) {
			priceSymbolDiv = div.find('.a-price-symbol')
			primeTag = div.find('.a-icon-prime-jp')
			if (primeTag.length > 0) {
				priceSymbolPrime = priceSymbolDiv.text()
				pricePrime = priceDiv.text()
				debug("priceSymbolPrime " + priceSymbolPrime + " pricePrime " + pricePrime)
			} else {
				priceSymbol = priceSymbolDiv.text()
				price = priceDiv.text()
				debug("priceSymbol " + priceSymbol + " price " + price)
			}

			return;
		}

		var rateBlock = div.find('.a-icon-star .a-icon-alt')
		if (rateBlock.length > 0) {
			rate = rateBlock.text()
			commentNum = div.find('.a-link-normal').text()
			debug("rate " + rate + " comment " + commentNum)
			return;
		}
	});

	priceSymbol = priceSymbol !== '' ? priceSymbol : priceSymbolPrime

	var product = {
		'rank': rank,
		'id': id,
		'isBestSeller' : isBestSeller,
		'detailPageTitle': detailPageTitle,
		'detailPageLink': detailPageLink,
		'representImgLink': representImgLink,
		'price_symbol': priceSymbol,
		'price': price,
		'price_prime': pricePrime,
		'rate': rate,
		'commentNum' : commentNum
	}

	return product;
}

exports.body = function(url, body, response, crawler_handle) {
	const re = /\b(href|src)\s*=\s*["']([^'"#]+)/ig
	var m = null;
	const $ = cheerio.load(body);


	$('#resultsCol .s-result-item').each(function(i, el){
		var item = $(this)
		var product = parseProduct($, item)
		if (product === null) {
			console.log("parse product failed");
		} else {
			console.log("product : " + JSON.stringify(product))
			// if (product.representImgLink) {
			// 	crawler_handle.addDown(product.representImgLink)
			// }
		}
	});

	// while (m = re.exec(body)){
	// 	let href = m[2]
	// 	if (/\.(png|gif|jpg|jpeg|mp4)\b/i.test(href)) {
	// 		crawler_handle.addDown(href)
	// 	}else if(!/\.(css|js|json|xml|svg)/.test(href)){
	// 		crawler_handle.addPage(href)
	// 	}
	// }
	crawler_handle.over()
}
