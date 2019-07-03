const NodeCache = require("node-cache");
const cache = new NodeCache();

const CONFIG = process.env.CONFIG
	? JSON.parse(process.env.CONFIG)
	: require("./settings.json");

const credentials = {
	client: {
		id: CONFIG.microsoft.clientId,
		secret: CONFIG.microsoft.secret
	},
	auth: {
		tokenHost: CONFIG.microsoft.loginUrl,
		tokenPath: "/" + CONFIG.microsoft.tenant + CONFIG.microsoft.tokenPath,
		authorizePath:
			"/" + CONFIG.microsoft.tenant + CONFIG.microsoft.authorizePath
	}
};
const oauth2 = require("simple-oauth2").create(credentials);

module.exports = { CONFIG, cache, oauth2 };
