const openUI = async () => {
	await browser.tabs.create({
		"url": "assert/main.html"
	});
};

browser.browserAction.onClicked.addListener(openUI);
