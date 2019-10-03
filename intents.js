const search = require("./intents/searchSharepoint");
const { connection } = require("./intents/connectionSharepoint");
const welcome = require("./intents/welcome");
const reset = require("./intents/reset");
const fallback = require("./intents/fallback");
const requestItTicket = require("./intents/requestItTicket");

function getMapIntents() {
	let intentMap = new Map();
	intentMap.set("Default Welcome Intent", welcome);
	intentMap.set("Login SharePoint", connection);
	intentMap.set("Search SharePoint", search);
	intentMap.set("Fallback", fallback);
	intentMap.set("reset", reset);
	intentMap.set("Request_IT_ticket - yes - custom - custom", requestItTicket);
	intentMap.set("create it ticket simple", requestItTicket);
	return intentMap;
}

module.exports = getMapIntents;
