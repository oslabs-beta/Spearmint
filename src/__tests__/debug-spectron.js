
const { Application } = require('spectron');
const path = require('path');


const electronPath = require('electron');


const appPath = path.join(__dirname, '../..');


const app = new Application({
  path: electronPath,
  args: [appPath],
  connectionRetryCount: 2,

  chromeDriverArgs: [
    '--verbose',
    '--headless=new', /
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-setuid-sandbox',
    '--remote-debugging-port=9222',
  ],
  env: {
    ...process.env,
    ELECTRON_ENABLE_LOGGING: true,
    ELECTRON_ENABLE_STACK_DUMPING: true,
  },
});


console.log('Starting the application with the following configuration:');
console.log('Electron Path:', electronPath);
console.log('Application Path:', appPath);
console.log('App instance:', app);


app
  .start()
  .then(() => {
    console.log('App started successfully.');


    const options = app.options || app._options || {};
    console.log('App options:', options);
    console.log(
      'ChromeDriver Args:',
      options.chromeDriverArgs || 'Not defined'
    );
    console.log('Environment Variables:', options.env || 'Not defined');

    if (app.isRunning()) {
      console.log('The Electron app is running.');
    } else {
      console.error('The Electron app is not running after start.');
    }

    setTimeout(() => {
      console.log('Attempting to stop the app after 5 seconds.');
      app
        .stop()
        .then(() => {
          console.log('App stopped successfully.');
          process.exit(0);
        })
        .catch((stopError) => {
          console.error('Error stopping app:', stopError);
          process.exit(1);
        });
    }, 5000);
  })
  .catch((err) => {
    console.error('Error starting app:', err);
    process.exit(1);
  });
