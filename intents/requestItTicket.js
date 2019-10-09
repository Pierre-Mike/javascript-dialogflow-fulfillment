const freshDesk = require("../lib/lib").CONFIG.freshDesk;
const { Card } = require("dialogflow-fulfillment");
const fetch = require("node-fetch");

function createTicket(email, description) {
	var myHeaders = new fetch.Headers();
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
		}
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
		.then(result => {
			if (result) {
				let idTicket = JSON.parse(result).item.helpdesk_ticket.display_id;
				let card = new Card(
					`Your ticket has been raised. you should receive a mail in few seconds.#${idTicket}`
				);
				card.setButton({
					text: `Ticket #${idTicket}`,
					url: `https://logic2020.freshservice.com/helpdesk/tickets/${idTicket}`
				});
				agent.add(card); // return agent
			}
		})

		.catch(error => {
			console.error(error);
			agent.add("I'm sorry an error happen");
		});
	agent.context.delete("request_it_ticket-yes-custom-followup");
}

module.exports = requestItTicket;
