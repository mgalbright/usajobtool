
/**
* @fileoverview Rewrites HTTP headers for Usajobs.gov REST API access.

  Release 5.7 of the Usajobs.gov REST API requires HTTP headers
  be modified to include an API key.  This is unfortunate since web 
  browsers prevent javascript apps from altering HTTP headers (for security
  reasons)--javascript based web apps will never be able to use the
  Usajobs API!

  This browser extension (background.js) intercepts data requests to the usajobs.gov
  API URL and rewrites the HTTP headers to include the API key from usaAPI.js,
  thus enabling javascript web apps to use the Usajobs.gov API.

  Based on
    https://github.com/mdn/webextensions-examples/tree/master/user-agent-rewriter
    https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Intercept_HTTP_requests
*/



//IMPORTANT: UPDATE THIS IF THE USAJOBS.GOV API LOCATION IS CHANGED
//IN THE FUTURE
var TARGET_URL = "https://data.usajobs.gov/api/*";


chrome.webRequest.onBeforeSendHeaders.addListener(function(details){

  for (var header of details.requestHeaders) {
    if (header.name.toLowerCase() === "Host") {
      header.value = REQUEST_HEADERS['Host'];
    }
    else if (header.name.toLowerCase() === "user-agent") {
      header.value = REQUEST_HEADERS['User-Agent'];
    }
  }

  //Add extra entry which is not contained in headers by default
  details.requestHeaders.push({'name':"Authorization-Key",
      "value": REQUEST_HEADERS['Authorization-Key']});

  return {requestHeaders: details.requestHeaders};

  //Listen to all requests to TARGET_URL,
  //use this function to rewrite HTTP headers.
}, {urls: [TARGET_URL]}, ["blocking", "requestHeaders"]);

