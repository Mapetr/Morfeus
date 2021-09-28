const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
const { getQueue } = require('./play.js');

String.prototype.toHHMMSS = function() {
	const sec_num = parseInt(this, 10);
	let hours = Math.floor(sec_num / 3600);
	let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	let seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours < 10) {hours = '0' + hours;}
	if (minutes < 10) {minutes = '0' + minutes;}
	if (seconds < 10) {seconds = '0' + seconds;}
	if (hours == '00') {
		return minutes + ':' + seconds;
	}
	else {
		return hours + ':' + minutes + ':' + seconds;
	}
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Shows the queue'),
	async execute(interaction) {
		const queue = getQueue();
		let result = '';
		let info;
		if (queue == []) {
			interaction.editReply({ content: 'Nothing in queue' });
			return;
		}
		queue.forEach(async (url) => {
			info = await ytdl.getInfo(url);
			console.log(`${url} ${info}`);
			result = result + `${info.videoDetails.title} [${info.videoDetails.lengthSeconds.toHHMMSS()}]\n`;
		});
		if (result == '') {
			console.error('Tried to send empty string');
			return;
		}
		interaction.editReply({ content: result });
	},
};