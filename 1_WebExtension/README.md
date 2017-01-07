# Usajobs Search Tool: Browser Extension

This folder contains a Usajobs search web app which uses
a web extension to change HTTP headers.
The web extension can run in either Chrome or Firefox.  
(Tested in Chrome 55 and Firefox 50.0.2.)

The web extension rewrites HTTP headers for GET requests to the Usajobs.gov
API URL to include the API key information.  

To use this web app:  

1. Download this git repository if you have not already done so.
2. Request a free API key from the usajobs.gov [developer site](https://developer.usajobs.gov/APIRequest/Index).
Enter your API key information in *1_WebExtension/WebExtension/usaAPI.js*.
3. Install the web extension from *1_WebExtension/WebExtension*:  
  * In Chrome, in the address bar type [chrome://extensions/](chrome://extensions/),
  then click *Load unpacked extension*, and click on the folder  *1_WebExtension/WebExtension*.
  * In Firefox, in the address bar type [about:debugging](about:debugging), then
  click *Load Temporary Add-on*, and click on the folder  *1_WebExtension/WebExtension*.  
  (You can disable the extension from [about:addons](about:addons).)
4. Navigate to *1_WebExtension/Webapp* and open index.html in your browser.

You can search for jobs in the index.html page, and the web extension will rewrite the HTTP
headers behind the scenes.

The WebExtension is based heavily upon MDN's [user-agent-rewriter](https://github.com/mdn/webextensions-examples/tree/master/user-agent-rewriter) example.

## Extra links:

* Developing browser extensions in [Chrome](https://developer.chrome.com/extensions/getstarted).
* Developing browser extensions for [Firefox](https://developer.mozilla.org/en-US/Add-ons/WebExtensions).
* WebRequest [API](https://developer.chrome.com/extensions/webRequest).
* Intercepting HTTP requests ([MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Intercept_HTTP_requests)).