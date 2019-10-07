async function getTokenGraph(clientId, clientSecret, tenant) {
	const fetch = require("node-fetch");

	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
	myHeaders.append("scope", "https://graph.microsoft.com/calendars.read");

	var urlencoded = new URLSearchParams();
	urlencoded.append("grant_type", "client_credentials");
	urlencoded.append("client_id", clientId);
	urlencoded.append("client_secret", clientSecret);
	urlencoded.append("resource", "https://graph.microsoft.com");

	var requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: urlencoded,
		redirect: "follow"
	};

	let token = null;
	await fetch(
		`https://login.microsoftonline.com/${tenant}/oauth2/token`,
		requestOptions
	)
		.catch(error => console.log("error Fetching", error))
		.then(async response => {
			console.log(response);
			await response
				.json()
				.then(json => {
					console.log(json);
					token = json.access_token;
				})
				.catch(error => console.log("error Fetching", error));
		});

	return token;
}

module.exports = getTokenGraph;
