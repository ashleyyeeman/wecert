const {defineConfig} = require('@playwright/test');
module.exports = defineConfig({
  testDir:'./tests',testMatch:'*.spec.cjs',fullyParallel:true,
  use:{baseURL:'http://127.0.0.1:8000',headless:true,
    launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {}},
  webServer:{command:'python3 -m http.server 8000 --bind 127.0.0.1',url:'http://127.0.0.1:8000',reuseExistingServer:!process.env.CI},
});
