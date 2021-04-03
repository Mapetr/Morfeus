const puppeteer = require('puppeteer');
const { launch, getStream } = require("puppeteer-stream");
const path = require("path");
const axios = require('axios');
const data = require('../index').constructor;

// function sleep(ms) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// }
const client_id = '50e8a67bb86f4c0ba623e971f4c0dd45';
const client_secret = '2e6415c47d874da3ab1f7316dec132bf';

module.exports = {
	name: 'playspotify',
    description: 'plays song from spotify!',
    cooldown: 1,
    aliases: ['spotify'],
    async execute(message, args) {
        try {
            const voiceChannel = message.member.voice.channel;
            if (voiceChannel) {
                const connection = await voiceChannel.join();
                /*const authOptions = {
                    headers: {
                        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
                    },
                    form: {
                        grant_type: 'client_credentials',
                        scope: 'streaming user-read-email user-modify-playback-state user-read-private',
                    },
                    json: true
                };
                let token;
                await request.post('https://accounts.spotify.com/api/token', authOptions, async (error, response, body) => {
                    token = body.access_token;
                    if (response.statusCode !== 200) return;
                    console.log(response.body);
                });*/
                data.isSpotify = true;
                data.voiceChannel = voiceChannel;
                data.isPlaying = true;
                const browser = await launch({ headless: false, executablePath: "/usr/bin/google-chrome-stable" });
                const page = await browser.newPage();
                await page.goto(`file://${path.join(__dirname, `../src/index.html`)}`, { waitUntil: 'domcontentloaded' });
                const stream = await getStream(page, { audio: true, video: false });
                const dispatcher = await connection.play(stream, { highWaterMark: 50 });
                await page.waitForTimeout(3000);
                const info = await page.evaluate(() => {
                    let info = [];
                    info.push(document.getElementById('token').innerHTML);
                    info.push(document.getElementById('device_id').innerHTML);
                    return info;
                });
                if (args > 3) return;

                if (args[0] === 'song') {
                    await axios({
                        baseURL: `https://api.spotify.com/v1/me/player/play?&device_id=${info[1]}`,
                        method: 'put',
                        headers: {
                            'Authorization': `Authorization: Bearer ${info[0]}`,
                        },
                        data: {
                            "uris": [args[1]],
                            "offset": {
                                "position": 0
                            },
                            "position_ms": 0
                        }
                    }).catch(err => {
                        console.log(err);
                    });
                } else if (args[0] === 'playlist') {
                    await axios({
                        baseURL: `https://api.spotify.com/v1/me/player/play?&device_id=${info[1]}`,
                        method: 'put',
                        headers: {
                            'Authorization': `Authorization: Bearer ${info[0]}`,
                        },
                        data: {
                            "context_uri": args[1],
                            "offset": {
                                "position": 0
                            },
                            "position_ms": 0
                        }
                    }).catch(err => {
                        console.log(err);
                        message.reply("Internal error: Please try again later");
                    });
                    
                } else {
                    message.reply('Use "song" or "playlist" as your first parameter').then((msg) => { msg.delete({ timeout: 15000 }) });
                }
            } else {
                message.reply('Join a voice channel first!');
            }
        } catch (err) {
            console.error(err);
        }
	},
};