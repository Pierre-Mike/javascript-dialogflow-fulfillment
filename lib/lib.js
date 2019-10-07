const NodeCache = require("node-cache");
const cache = new NodeCache();

const CONFIG = process.env.CONFIG
	? JSON.parse(process.env.CONFIG)
	: require("./settings.json");

module.exports = { CONFIG, cache };
