[Home](./) > [Contributing to CAMCAL](#)

# Contributing to CAMCAL

## Overview of Infrastructure

CAMCAL is an [Electron](https://electronjs.org/) app, and therefore is based on the Node.js runtime and written primarily in Javascript ES6.

If you aren't already familiar with Electron or ES6, it'd be a good idea to read up on how those differ from standard Javascript before you dive in.

Communication with the hardware is done through the [Johnny Five](http://johnny-five.io/) library. They have extensive documentation as well.

## Explanation of Files

A great way to become more familiar with the app and where to find what you're looking for is to look at the [File Structure](tree). It's a great place to start.

## Installing Required Software

Before you begin, you'll need to install a few things:

- **[Node.js](https://nodejs.org/en/download/)** - The main runtime. Make sure it's at least v10.6, and keep in mind that versions later than v12.5 have not been tested.
- **[Yarn](https://yarnpkg.com/en/docs/install)** - The better node package manager.

## Downloading and Preparing the Code

[Git](https://git-scm.org) is highly recommended if you'd like to make changes. If you don't want to use Git, you'll have to manually submit your changes file by file using the Github website.

1. **Download the code** using Git (want to upload your changes? Fork the repository and clone your personal copy instead.)

   ```sh
   $ git clone https://github.com/hingobway/camcal.git
   ```

   No Git? [Click here](https://github.com/hingobway/camcal/archive/master.zip) for a ZIP download (Although you can't upload your changes, you can still package the app yourself and use it.)

1. **Install app dependencies**. Using yarn, just enter the project folder in a terminal, and run...

   ```sh
   $ yarn
   ```

1. **Build CSS**. CSS is processed using Gulp and PostCSS. Just run...

   ```sh
   $ npx gulp css
   ```

   That's all it takes to prepare the app. Now, onto running it.

## Running CAMCAL in Development Mode

1. You now have everything you need to start the app. To run it, just run...

   ```sh
   $ yarn dev
   ```

   The app should open immediately.

1. If you plan to make any changes to the CSS (styling) of the app, you'll need to also make Gulp watch for changes. To do this, in a separate terminal window, run...

   ```sh
   $ npx gulp dev
   ```

## Additional Development Tools

When running in development, some additional tools are available to assist in development. To see available tools, click anywhere inside CAMCAL and press **Alt** on the keyboard.

### Hot Reloading

While in development, any changes to the main process code will trigger a restart of the app. If you change renderer code, however, it will not restart. Instead, press Ctrl+R in CAMCAL to reload just the renderer (also available from the Tools menu mentioned above.)

## Packaging the App

All configuration for app packaging has already been done, so it's very simple to make a new release of CAMCAL.

1. **Update the version number** in `/package.json`. A new version will ensure that the app is properly updated on machines that already have CAMCAL installed.
1. **Delete any previous packaged versions**, otherwise packaging may fail. Just delete the `/out` directory if you have it.
1. **Package the app** by running...

   ```sh
   $ yarn dist
   ```

   After the script completes, you can find the installer in `/out/make/squirrel.windows/x64`.
