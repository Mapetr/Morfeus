const puppeteer = require('puppeteer');
const path =  require("path");

(async () => {
  const browser = await puppeteer.launch({ headless: false, executablePath: "/usr/bin/google-chrome-stable" });
  const page = await browser.newPage();
  await page.goto(`file://${path.join(__dirname, "./src", "index.html")}`);

  //await browser.close();
})();
