function reset(agent) {
	console.log(agent);
	agent.context.delete("sharepoint_connection");
	agent.add("reset successful");
}

module.exports = reset;
