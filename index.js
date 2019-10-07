"use strict";
const { WebhookClient } = require("dialogflow-fulfillment");
const express = require("express");
const bodyParser = require("body-parser");
const { CONFIG, cache, oauth2 } = require("./lib/lib");

const PORT = process.env.PORT || 8080;
const intents = require("./intents");

const basicAuth = require("express-basic-auth");

const app = express();
/* require an authentication */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function WebhookProcessing(request, response) {
	const agent = new WebhookClient({ request, response });
	agent.handleRequest(intents());
}

// Webhook
app.post("/", basicAuth(CONFIG.auth), (req, res) => {
	console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
	WebhookProcessing(req, res);
});

app.get("/", (req, res) => {
	res.send(JSON.stringify({ Hello: `word` }));
});

app.get("/getAToken", async (req, res) => {
	const options = {
		code: req.query.code,
		redirect_uri: CONFIG.microsoft.redirect_uri
	};
	const result = await oauth2.authorizationCode
		.getToken(options)
		.catch(e => console.log(e));
	const access_token = oauth2.accessToken.create(result).token.access_token;

	cache.set(req.query.state, access_token, 100000000);
	console.log("store token into the cache");
	res.send(JSON.stringify(cache.get(req.query.state)));
});

app.listen(PORT, () => {
	console.info(`Webhook listening on port ${PORT}!`);
});
