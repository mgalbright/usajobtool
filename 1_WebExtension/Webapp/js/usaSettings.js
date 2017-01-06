/**
* @fileoverview Adjustable program constants/settings
*/


/**
* Gradient descent learning rate for online machine learning algorithm.
* Larger values cause faster learning.
* @const {number}
*/  
var LEARNING_RATE = 0.35;   

/**
* Default weight vector component for good keywords, should be > 0.
* @const {number}
*/   
var DEFAULT_GOOD_KEYWORD_WEIGHT = 0.7; 

/**
* Default weight vector component for bad keywords, should be < 0.
* @const {number}
*/   
var DEFAULT_BAD_KEYWORD_WEIGHT = -0.7; 

/**
* Default weight vector component for the bias term, for rating jobs 
* with no matching keywords.  0 is a good value.
* @const {number}
*/   
var DEFAULT_BIAS_WEIGHT =  0.0; 

/**
* Auto close JobInfo modal when user rates a job?
* @const {boolean}
*/  
var CLOSE_JI_MODAL_AFTER_RATED = true; 

/**
* Max number jobs to retrieve from the server at a time?
* @const {number}
*/ 
var NUM_JOBS_PER_SEARCH = 100;      

/**
* Should the dataTable split the jobs list into multiple pages?
* @const {boolean}
*/ 
var DATA_TABLE_PAGINATION = true;

/**
* Number of jobs shown in each dataTable page.
* @const {number}
*/ 
var DATA_TABLE_PAGE_LENGTH = 25;  
