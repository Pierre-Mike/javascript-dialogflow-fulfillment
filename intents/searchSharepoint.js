var { cache } = require("../lib/lib");
var graph = require("@microsoft/microsoft-graph-client");
const { Card } = require("dialogflow-fulfillment");
const microsoft = require("../lib/lib").CONFIG.microsoft;
const getTokenGraph = require("../lib/graph");
function getClientGraph(accessToken, apiUrl, search, filter, select) {
	var client = graph.Client.init({
		authProvider: done => {
			done(null, accessToken);
		}
	}).api(apiUrl);
	if (search) {
		client.search(search);
	}
	if (filter) {
		client.filter(filter);
	}
	if (select) {
		client.select(select);
	}
	return client.get(e => {
		console.log(e);
	});
}

/* function sharepointContext(agent) {  
	if (cache.get(agent.context.session, false)) {
		console.log("set from cache to context");
		agent.context.set({
			name: "sharepoint_connection",
			lifespan: 50,
			parameters: { access_token: cache.get(agent.context.session) }
		});
	}
	return agent.context.get("sharepoint_connection", {}).parameters;
} */

async function search(agent) {
	let token = await getTokenGraph(
		microsoft.clientId,
		microsoft.clientSecret,
		microsoft.tenant
	);
	console.log(token);
	console.log(agent.parameters.name);

	if (token) {
		let res = await getClientGraph(token, "/me")
			.then(e => e)
			.catch(err => console.log(err));
		console.log(res);
		if (res.value.length === 0) {
			agent.add(`No site found for "${agent.parameters.name}".`);
		} else {
			res.value.map(e =>
				agent.add(
					new Card({
						title: e.displayName,
						buttonText: e.name,
						buttonUrl: e.webUrl
					})
				)
			);
		}
	} else {
		console.log(
			"no token provided by MsGraph, ",
			`client id : ${microsoft.clientId},
			tenant : ${microsoft.tenant}`
		);
		agent.add(
			"An error with the Authentication and MsGraph, Contact the It Department."
		);
	}
}

module.exports = search;
