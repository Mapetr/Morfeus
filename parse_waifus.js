const { createClient } = require('redis');
const fs = require('fs');
const { DownloaderHelper } = require('node-downloader-helper');

const dl = new DownloaderHelper('https://cdn.mapetr.cz/images/waifus.json', './');
dl.on('end', () => console.log('Download completed'));
dl.on('error', err => console.error('Download failed! ' + err));
dl.start();

const client = createClient();

client.on('error', (err) => console.log(err));

client.connect();

fs.readFile('./waifus.json', 'utf8', (err, data) => {
	const database = JSON.parse(data);
	let counter = 0;
	database.forEach(async db => {
		counter++;
		await client.set(counter.toString(), JSON.stringify(db));
	});
	console.log('Data added');
	process.exit(0);
});
process.exit(1);