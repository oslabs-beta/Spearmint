const { Application } = require('spectron');
const path = require('path');

// specifies the path of the application to launch
const electronPath = require('electron');

// tell spectron to look and use the main.js file + package.json located 2 levels above
const appPath = path.join(__dirname, '../..');

let app; // <-- hoist app so it's visible throughout the describe block

xdescribe('Application Accessibility Audit', function () {
  //app.timeout(10000);
  //this.timeout(10000);
  //this.startTimeout(10000);

  beforeAll(async function () {
    // instantiates the spearmint application given the optional paramaters of the Application API
    app = new Application({
      path: electronPath, // string path to the Electron application executable to launch
      args: [appPath], // array of paths to find the executable files and package.json
      chromeDriverArgs: [
        //'--headless=new',
        '--headless',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--disable-extensions',
        '--remote-debugging-port=9222',
      ],
      env: {
        ...process.env,
        ELECTRON_ENABLE_LOGGING: true,
        ELECTRON_ENABLE_STACK_DUMPING: true,
      },
    });
    await app.start();
  });

  // beforeEach(function () {
  //   return app.start();
  // });

  // afterEach(function () {
  //   if (app && app.isRunning()) {
  //     return app.stop();
  //   }
  // });

  afterAll(async function () {
    if (app && app.isRunning()) {
      await app.stop();
    }
  });

  it('Audits Accessibility', function () {
    return app.client.auditAccessibility().then(function (audit) {
      if (audit.failed) {
        console.error(
          'Please address the following accessibility issues in your application: \n',
          audit.results
        );
      } else {
        console.log('No accessibility issues have been found.');
      }
    });
  });
});
