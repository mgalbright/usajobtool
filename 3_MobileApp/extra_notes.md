# Extra cordova notes

Here are some extra notes on converting a web app to a native 
apps with Cordova.  (Mostly these are for my own documentation--use at
your own risk.  Note also I only tried this on *nix machines.)

## Convert a web app to a Cordova native app:

1. Install and configure Cordova and native app development
environments (e.g. Android, IOS, ...). See the
[Cordova guide](https://cordova.apache.org/docs/en/latest/guide/cli/index.html).
2. Create a blank cordova project: from a terminal type  
 ```bash
    cordova create FOLDER-NAME com.yourdomain.projectname APP-NAME  
 ```  
 This creates a folder *FOLDER-NAME* with a hello world project 
 inside.  *APP-NAME* is the app name.  Replace com.yourdomain.projectname
 with your project identifier.  
 Note: Cordova follows the Android package naming convention.
 See [Stackoverflow](http://stackoverflow.com/questions/6273892/android-package-name-convention).  
3. From a terminal, cd into the folder just created.  (You should see a file *config.xml*.)
4. Add platforms.  Since I want Android, type  
 ```bash
 cordova platform add android --save
 ```  
5. Edit *config.xml* to configure the project: E.g., add your contact info, app version, etc.
   Make sure you configure the settings for the cordova-plugin-whitelist 
   in config.xml to configure the app security.
   
   Here's the Cordova docs for [config.xml](https://cordova.apache.org/docs/en/latest/config_ref/).

   Also see the [Cordova docs](https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-whitelist/)
   and the [github page](https://github.com/apache/cordova-plugin-whitelist) for further details on 
   configuring the whitelist in *config.xml*.
   
   For further details, read my comments in my *config.xml* file in this git repository.
6. Now you are ready to insert your web app into the cordova project.  
   First, cd into the *www/* folder.  Edit *index.html* to add the html code for your web page.
   Paste javascript, css, and image files into their folders as needed.
7. (For this app only): To change HTTP headers in Ajax requests, simply include the headers 
 in the Ajax call in the function `SearchForJobs()` in 
 *usaMain.js*.  I store the headers with the API key in usaAPI.js for easy access.
 (Since this is a native app and not a web app, changing HTTP headers is no problem.)  
 (A side note: Cordova also enables you to access the device hardware
 features like the camera, gps, sensors, etc. )

8. Configure the Content-Security Policy <meta> tag in *index.html*.  It looks like  
 ```html
 <meta http-equiv="Content-Security-Policy" content="...">
 ```
 This gives you extra control over app security.  
 See my comments at the top of my *index.html* file for more info and links
 to examples and documentation.  
9. Initializing Cordova: After the DOM is initialized, we need to 
 set an event listener for 'deviceready' and finish initializing the 
 Cordova app.  The code for this is in *index.js* and looks like this:  
 ```javascript
 document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
 ```  
 This will call the `onDeviceReady()` function to carry out any further
 device initialization--feel free to add code there.
 The 'deviceready' listener can be set by calling `app.initialize()`.
 In the hello world example, `app.initialize()`
 is called from *index.js*.  However, since I use jQuery, and I want that 
 to happen only once the DOM is loaded, I call `app.initialize()` from 
 the end of  
```javascript
 $(document).ready(function(){  
   ...  
   app.initialize();  
 });  
 ```
 in *usaMain.js*.  
 Further references: Stackoverflow [1](http://stackoverflow.com/a/23201738),
 [2](http://stackoverflow.com/a/12576086),
 [3](http://stackoverflow.com/a/14109006), netbeans.org
 [4](https://netbeans.org/kb/docs/webclient/cordova-gettingstarted.html).  
10. (Optional) In index.js, you could also set listeners for other events,
 such as app pause and resume or phone back button presses. For details
 see the Cordova docs for [Events](https://cordova.apache.org/docs/en/latest/cordova/events/events.html).
11. (Optional) For faster responsiveness on mobile devices 
 (avoid a possible 300ms click delay), add the 
 [fastclick](https://github.com/ftlabs/fastclick) library to your project:
  Simply add *fastclick.js* to the *js* folder and include 
  *fastclick.js* in index.html.  Also intialize fastclick after the 
  DOM has finished loading.  In jQuery, it looks like this:
```javascript
 $(document).ready(function(){
   ...
   app.initialize();
   FastClick.attach(document.body);
 });
 ```
 See *usaMain.js* for details.


## Build the native app

Now we can build and test the app:

1. In a terminal, cd to the top level directory for the app.  (The directory containing config.xml.)
2. Build the app from the terminal by typing:  
 ```bash
 cordova build android
 ```
3. Test the app in an emulator by typing from the terminal:
 ```bash
 cordova emulate android
 ``` . 
4. While the emulator is running, you can debug the app with Chrome: in the 
 Chrome address bar paste [chrome://inspect/#devices](chrome://inspect/#devices).  You should see the app
 listed under Remote Target--click *Inspect*.  You can now use the Chrome debugging tools.

## Transfer the app to your mobile device

When you are ready to test the app on your Android device:

1. Enable Developer options.  Then enable USB debugging.
2. Connect the device via USB cable to the computer.  
3. On the mobile device, change the USB option from *USB for charging* to *Transfer Files*.
3. From the terminal, type
 ```bash
 cordova run android --device
 ```
 This will install the app on the Android device and launch it.
