[Home](./) > [File Structure](#)

# File Structure

Reference for purpose of files and folders. If a file/folder isn't shown, either it isn't important to app functionality, or it was created after version **0.3.1**.

```sh
camcal
|   camcal.xd  # Adobe XD design file for the main UI v2 - for reference
|   electron.prod.js  # Sets environment variables when running the
|                     #  app in production
|   forge.config.js  # Configuration for app packaging
|   gulpfile.js  # CSS parsing config
|   main.js  # Entry point
|   model.xcf  # Initial UI plans - a GIMP project
|   package.json  # Project info/general Node.js config
|   yarn.lock  # See https://yarnpkg.com/en/docs/yarn-lock
|
├───node  # Code in the main process (app backend)
|       board.js  # Connect to the controller board
|       ElectronIPC.js  # Communication between main & renderer process -
|                       #  all commands triggered in the UI come here first
|       Stepper.js  # Class: a motor - initialized for each connected motor
|       UI.js  # Instantiation of windows. Sets size, quit action, colors, etc
|
└───src
    |   # Code in the renderer process (app frontend):
    |   #  The HTML files below contain markup for each app window.
    |
    |   configure.html  # The configuration window
    |   load.html  # The loading window (shown at startup)
    |   main.html  # The main app window
    |
    ├───assets
    |   |   # Contains image and otherwise binary files used in the
    |   |   #  renderer. Mostly icons, although some icons are SVGs, found
    |   |   #  in their corresponding page's HTML file.
    |   |
    |   ├───icons
    |   |       # Different forms of the app icon, including different
    |   |       #  sizes in png/ and an ICO and XCF in root.
    |   |
    |   └───load
    |           # The installation GIF. This appears while the app is
    |           #  being installed/updated.
    |
    ├───css  # App stylesheets, using some libraries
    |       all.css  # General styles for all pages (colors, flexible size)
    |       fonts.css  # Font mapping
    |       main.css  # Styles for the main app window
    |       # All other windows have their styles inside the HTML file.
    |
    ├───fonts
    |       # Fonts used in the software, all in woff2 form. Individual
    |       #  files have randomized names dictated by Google Fonts. A map
    |       #  can be found at /css/fonts.css .
    |
    └───js  # Active code for renderer processes
            configure.js  # All code for the configuration window
            locals.js  # Benign window code for the main window -
                       # right-click menus, etc
            main.js  # Main app UX code
```
