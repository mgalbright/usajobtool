# Usajobs Search Tool: Mobile App

In this folder, I have ported the usajobs search tool 
to an Android native app using  [Apache Cordova](https://cordova.apache.org/).  


Since native apps have more power than web apps, it is easy to change the 
HTTP headers and access the usajobs.gov open API.
I built this app for Android, but it is easy to rebuild the app 
for ios or other platforms.  

## Quick instructions to rebuild and run the app:

(This assumes you are on a *nix system and have installed
development tools for Cordova and Android.)

1. Download this git repository if you have not already done so.
2. From a terminal cd into *3_MobileApp/*
3. Build the project for Android: From the terminal type:  
 ```bash
 cordova build android
 ```
4. Run the project in an emulator:   
 ```bash
 cordova emulate android
 ```  
 Note that you can debug the running program from Chrome:
 in the address bar paste [chrome://inspect/#devices](chrome://inspect/#devices),
 find the program under *Remote Target*, and click *Inspect*.
5. To install the app on your Android device:  
    1. Make sure you have enabled Developer options and USB debugging on your device.
    2. Connect your device to your PC via USB.
    3. On your phone, change the USB option from *USB for charging* to *Transfer Files*.
    4. From the terminal type:  
        ```bash
        cordova run android --device
        ```

## Extra links:

1. Cordova [documentation](https://cordova.apache.org/docs/en/latest/).
2. Great Microsoft website on developing Cordova apps.  (It's focused on 
Visual Studio, but it's useful for anyone.)  [Link](https://taco.visualstudio.com/).
3. Microsoft page on getting started with Cordova and making your first 
Cordova app: [Link](https://taco.visualstudio.com/en-us/docs/vs-taco-2017-first-app/).
4. Microsoft github page with many 
[Cordova app examples](https://github.com/Microsoft/cordova-samples).
