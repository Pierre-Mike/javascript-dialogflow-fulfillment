const freshDesk = require("../lib").CONFIG.freshDesk;

function createTicket(email, description) {
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	myHeaders.append(
		"Authorization",
		"Basic " +
			Buffer.from(freshDesk.username + ":" + freshDesk.password).toString(
				"base64"
			)
	);

	var ticketJson = {
		helpdesk_ticket: {
			description: description,
			subject: "Test Chatbot",
			email: email,
			priority: 1,
			status: 2,
			source: 2,
			ticket_type: "Incident"
		},
		cc_emails: [email]
	};
	var requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: JSON.stringify(ticketJson),
		redirect: "follow"
	};

	return fetch(freshDesk.url, requestOptions);
}

async function requestItTicket(agent) {
	console.log(agent.parameters);
	let description = await agent.context.contexts[
		"request_it_ticket-yes-custom-followup"
	].parameters.any;
	let email = await agent.context.contexts[
		"request_it_ticket-yes-custom-followup"
	].parameters.email;

	console.log(email);
	console.log(description);
	await createTicket(email, description)
		.then(response => response.text())
		.then(result => agent.add("Your ticket has been raise."))
		.catch(error => agent.add("I'm sorry a error happen"));
}

module.exports = requestItTicket;
