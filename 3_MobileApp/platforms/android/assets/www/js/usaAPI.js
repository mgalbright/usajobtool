/**
* @fileoverview API key for usajobs.gov REST API
*/

// Tip: you can request your own free API key from
// usajobs.gov developer website:
// https://developer.usajobs.gov/APIRequest/Index

/**
* HTTP headers for authentication to usajobs.gov REST API.
* @const {Object}
*/ 
var REQUEST_HEADERS = {
  "Host" : "data.usajobs.gov",  
  "User-Agent" : "PASTE-YOUR-USER-AGENT-HERE",
  "Authorization-Key" : "PASTE-YOUR-AUTHORIZATION-KEY-HERE"
};