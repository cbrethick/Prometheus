const { chromium } = require('playwright');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR] ${msg.text()}`);
    } else {
      console.log(`[BROWSER LOG] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`[BROWSER CRASH] ${err.toString()}`);
  });

  try {
    console.log("Navigating to http://localhost:3000/?t=" + Date.now());
    await page.goto('http://localhost:3000/?t=' + Date.now(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  } catch (e) {
    console.error("Navigation failed:", e);
  }

  await browser.close();
  console.log("Done.");
})();
