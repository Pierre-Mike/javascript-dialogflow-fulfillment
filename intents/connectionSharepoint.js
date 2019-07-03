const { Card } = require("dialogflow-fulfillment");
const { CONFIG, oauth2 } = require("../lib");

function getUrlLogin(agent, auth, redirect_uri) {
	let state = agent.context.session;
	console.log(state);
	var urlAuthorization = auth.authorizationCode.authorizeURL({
		redirect_uri,
		state
	});
	return urlAuthorization + "&resource=https://graph.microsoft.com/";
}

const setContextAgent = (agent, name, lifespan) => {
	agent.context.set({
		name,
		lifespan
	});
	return agent;
};

function connection(agent) {
	let card = new Card("Connection to SharePoint");
	let urlConnection = getUrlLogin(agent, oauth2, CONFIG.microsoft.redirect_uri);
	card.setImage(
		"http://www.tascmanagement.com/wp-content/uploads/2016/05/course-logo-small-SP-300x250.png"
	);
	card.setText(
		"This is the body text of a card.  You can even use line\nbreaks and emoji! 💁"
	);
	card.setButton({
		text: "Login",
		url: urlConnection
	});

	agent = setContextAgent(agent, "sharepoint_connection", 50);
	agent.add(card); // return agent
}

module.exports = { connection };
