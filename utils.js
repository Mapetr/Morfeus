const { createClient } = require('redis');
const { sentry } = require('./index');

module.exports = async function checkBlocked(guildId, memberId) {
	const client = createClient();
	client.on('error', (err) => {
		console.error(err);
		sentry.captureException(err);
	});
	await client.connect();
	let json = await client.get(guildId);
	if (json === null) return false;
	json = JSON.parse(json);
	return json.blocked.includes(memberId);
}
