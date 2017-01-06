/**
* @fileoverview This code searches usajobs.gov, then sorts jobs 
* by user interest.
*
* This code searches for jobs using the open REST API of usajobs.gov.
* Then machine learning ranks the jobs, from most to least interesting,
* and shows the most interesting jobs first.  The user can also
* rate viewed jobs which updates the machine learning settings, leading
* to improved predictions in the future.  Machine learning settings
* are saved between sessions using HTML5 localStorage.
* Job descriptions are converted to feature vectors using a
* bag of words classifier, and jobs are ranked with an online 
* logistic regression algorithm.
*/


//=========================================================================
//Global variables

/**
* Stores raw jobs data returned by usajobs.gov search, is an object.
* @global 
*/ 
var jobsRawData;

/**
* Stores parsed jobs info in searchable hashtable (key is DocumentID).
* @global 
*/ 
var jobsInfo = {}; 

/**
* Stores app's machine learning settings in memory, is an object.
* @global 
*/      
var jSiteSettings;    

/**
* Stores stringified copy of jSiteSettings.
* @global {string}
*/     
var sSiteSettings = "";   

//=========================================================================
//jQuery code to make the site interactive

$(document).ready(function(){

  //Set the clickable links  
  $("#MoreJobSeriesCodesURL").attr("href", JOB_SERIES_CODES_URL);
  $("#AboutModalUsajobsHomeLink").attr("href", USA_JOBS_HOME_URL);
  $("#AboutModalUsajobsDataLink").attr("href", USA_JOBS_DATA_URL);

  //Turn on tooltips, used for Settings buttons
  $('[data-toggle="tooltip"]').tooltip();

  //-----------------------------------------------------------------------
  //Retrieve machine learning settings from localStorage.
  //If load error, or settings look invalid, this restores defaults.
  GetSettingsFromLocalStorage(); 

  //If localStorage unavailable, warn user.
  if(!LocalStorageAvailable()){
    $("#errorNoLocalStorage").show(); 
  }
  //-------------------------------------------------------------
  //Search for jobs when user clicks basic search button
  $("#basicSearchBtn").click(function(){

    var searchKeyword = $.trim($("#basicKeywordInputBox").val());
    
    if(searchKeyword.length > 0){
      //get and parse job data
      SearchForJobs(searchKeyword, "", "", ""); 
    }
    else{
      $("#errorEmptyBasicSearch").show();
    }

  });

  //If user presses enter in basic search box, click basic search button
  $('#basicKeywordInputBox').keypress(function(key){
    if(key.which === 13)
      $('#basicSearchBtn').click();
  });

  //Search for jobs when user clicks advanced search button
  $("#advSearchBtn").click(function(){

    //Get search data the user entered
    var searchKeyword = $.trim($("#advKeywordInputBox").val());
    var searchSeries = $.trim($("#advSeriesInputBox").val());
    var searchCity = $.trim($("#advCityInputBox").val());
    var searchZipCode = $.trim($("#advZipCodeInputBox").val());

    //Check if Series code looks valid
    var validSeries = ValidateJobSeriesCode(searchSeries);      
    if(searchSeries.length>0 && !(validSeries) ){
      $("#errorInvalidJobSeries").show();  //show Series warning
    }

    if(searchKeyword.length === 0 && searchSeries.length === 0 && 
      searchCity.length === 0 && searchZipCode.length === 0){
      $("#errorEmptyAdvSearch").show(); //show warning: empty search
    }
    else if(validSeries || searchSeries.length===0){
      //Only search if search criteria entered AND 
      //series is either missing or looks valid
      SearchForJobs(searchKeyword, searchSeries, searchCity, 
      searchZipCode);
    }
  });

  //If user presses enter in any advanced search box, 
  //click advanced search button.
  $('.advInputBox').keypress(function(key){
    if(key.which === 13)
      $('#advSearchBtn').click();
  });

  /*In advanced view, if user clicks any job Series code link, 
    place series job Code for that job into the job Series input box.*/
  $(".jobSeriesLink").click(function(){

    var jobSeries = $(this).attr('data-jobseries');

    $('#advSeriesInputBox').val(jobSeries);
  });

  //Hide Bootstrap alerts if user clicked close button.
  $('.alert .close').on('click', function(){
      $(this).parent().hide();
  });

  //When jobInfoModal launches, load data for the requested job into modal.
  $('#jobInfoModal').on('show.bs.modal', function (event){
    var button = $(event.relatedTarget); // Button that triggered the modal
    var docID = button.data('documentid'); // Extract docID from attributes
    
    // Update the modal's content:

    var modal = $(this);

    //Set job title:
    modal.find('#modal_JI_JobTitle').html(jobsInfo[docID].link); 

    //Set Agency:
    modal.find('#modal_JI_Agency').text(jobsInfo[docID].OrganizationName +
      ', ' +  jobsInfo[docID].AgencySubElement);

    //Set salary:
    modal.find('#modal_JI_Salary').text(jobsInfo[docID].SalaryMin +
      '-' + jobsInfo[docID].SalaryMax + ' ' +
      jobsInfo[docID].SalaryBasis);

    //Set location(s):
    modal.find('#modal_JI_Location').text(jobsInfo[docID].Locations);

    //Set job summary
    modal.find('#modal_JI_JobDescript').text(jobsInfo[docID].JobSummary);

    //Update the like/don't like button's data-documentid attribute so that
    //when the button is clicked, the correct documentid is passed to
    //the the online machine learning algorithm.
    modal.find('#modal_JI_Like').attr('data-documentid',docID);
    modal.find('#modal_JI_DontLike').attr('data-documentid',docID);
    
  });

  //When modal opens for exporting siteSettings, show settings
  $('#exportSettingsModal').on('show.bs.modal', function (){

    var modal = $(this);

    //Show settings:
    modal.find('#modalExportSettingsBox').text(sSiteSettings);
  });

  //User clicked to import site settings (JSON string), save them
  $("#importSettingsModal").on("click", "#modalimportImportBtn", 
  function(){

    var sJSONSettings = $('#modalImportSettingsBox').val();
    var jJSONSettings;

    try{
      jJSONSettings = DecodeSettingsJSONString(sJSONSettings);
    }
    catch(error){
      $('#errorBadImportJSONString').show();
      return; //break early
    }

    //Update current settings to use imported settings if can   
    SaveNewSiteSettings(jJSONSettings);
         
    /*If jobsRawData defined, then we need to re-parse and re-sort jobs
      with the new machine learning settings.  */
    if(jobsRawData  && typeof jobsRawData !== 'undefined' ){
      ParseJobsData();
    }

    $('#importSettingsModal').modal("hide");
  });

  //User clicked to create site settings
  $("#createSettingsModal").on("click", "#modalcreateCreateBtn", 
  function(){

    var goodWordStr = $('#modalCreateGoodKWsBox').val();
    var badWordStr = $('#modalCreateBadKWsBox').val();
    
    var dataObject;

    try{
      dataObject = BuildSiteSettingsFromKeywords(goodWordStr, badWordStr);
    }
    catch(error){
      $("#errorBadKeywordStrings").show(); //show warning  
      return;  //break
    }

    //Update settings and save to localStorage if available
    SaveNewSiteSettings(dataObject); 

    /*If jobsRawData defined, then we need to re-parse and re-sort jobs
      with the new machine learning settings.  */
    if(jobsRawData  && typeof jobsRawData !== 'undefined' ){
      ParseJobsData();
    }

    $('#createSettingsModal').modal("hide");
  });

  //user clicked to reset site settings to default
  $('#settingsDefaultBtn').on('click', function(){
    SetSiteDefaultSettings();

    /*If jobsRawData defined, then we need to re-parse and re-sort jobs
      with the new machine learning settings.  */
    if(jobsRawData  && typeof jobsRawData !== 'undefined' ){
      ParseJobsData();
    }

  });
  
  //User clicked a rate button: they like the job
  $("#jobInfoModal").on("click", "#modal_JI_Like", function(){
    var docID = $('#modal_JI_Like').attr('data-documentid');
    
    //Update machine learning settings: the user liked this job
    RateJob(docID, true);

    //Machine learning settings changed, re-sort jobs.  
    if(jobsRawData  && typeof jobsRawData !== 'undefined' ){
      ParseJobsData();
    }

    if(CLOSE_JI_MODAL_AFTER_RATED){
      $('#jobInfoModal').modal("hide");
    }
  });

  //User clicked a rate button: they didn't like the job
  $("#jobInfoModal").on("click", "#modal_JI_DontLike", function(){
    var docID = $('#modal_JI_Like').attr('data-documentid');

    //update machine learning settings: the user didn't like this job
    RateJob(docID, false);

    //Machine learning settings changed, re-sort jobs.
    if(jobsRawData  && typeof jobsRawData !== 'undefined' ){
      ParseJobsData();
    }

    if(CLOSE_JI_MODAL_AFTER_RATED){
      $('#jobInfoModal').modal("hide");
    }
  });

  //---------------------------------------------------------------------------
  //Additions for Cordova native app:

  //Use FastClick to avoid 300ms delay on clicking in when 
  //porting web app to Cordova native app
  FastClick.attach(document.body);

  //Now that DOM is ready, signal that Cordova is ready:
  app.initialize();
  //---------------------------------------------------------------------------

});

//=========================================================================
//Javascript functions

/**
 * Checks if searchSeries looks like a valid job Series code.
 *
 * @param {string} searchSeries A job Series code for the Federal 
 *        government. Should be 4 characters of integers.
 * @return true if searchSeries looks like a valid code, else false.
 */
function ValidateJobSeriesCode(searchSeries){
  //Check if searchSeries contains exactly 4 digits, nothing else
  var RegExPattern = /^[0-9]{4}$/;   

  if(searchSeries.match(RegExPattern)){
    return true; //Series looks valid
  }
  else{
    return false;
  }
}

/** 
 * Builds site's machine learning settings and saves to local storage.
 *
 * Given 2 strings containing comma-separated good and bad job keywords, 
 * split each string into an array of keywords, then create machine
 * learning settings from those keywords. (These settings are 
 * used to build feature vectors for jobs when analyzing job titles 
 * and summaries.) Returns data structure with array of good keywords and
 * array of machine learning weights.      
 *
 * @param {string} goodKeywordsString Contains keywords found in
 *        good jobs. Keywords should be separated by commas.           
 * @param {string} badKeywordsString Contains keywords found in
 *        bad jobs. Keywords should be separated by commas.
 * @returns An object with elements keywords, weights, which are both 
 *          arrays.
 * @throws A string error message if keyword strings empty or invalid.
 * @throws A string error message if weights.length != keywords.length 
 *          + 1.
 */
function BuildSiteSettingsFromKeywords(goodKeywordsString, 
badKeywordsString){

  //want keywords lowercase
  goodKeywordsString = goodKeywordsString.toLowerCase();
  badKeywordsString = badKeywordsString.toLowerCase();

  //Split string on commas into individual keywords
  var regExSplitPattern = /\s*,\s*/;  

  var goodList = goodKeywordsString.split(regExSplitPattern);
  var badList = badKeywordsString.split(regExSplitPattern);

  var newSettings = {"keywords":[], "weights":[]};

  /*This weight correspongs to the bias term.  
    Its meaning: what dot product value should we give a job that contains
    no keywords, good or bad.  >0 means a job with no keywords is assumed
    good. 0 means neutral. <0 means assume it is bad.*/
  newSettings.weights.push(DEFAULT_BIAS_WEIGHT);

  //Add all valid (good, bad) keywords and default weights to newSettings
  var word = "";
  var i;
  for(i = 0; i < goodList.length; i++){ 
    word = $.trim(goodList[i]);

    if(word.length > 0){
      newSettings.keywords.push(word);
      newSettings.weights.push(DEFAULT_GOOD_KEYWORD_WEIGHT);
    } 
  }

  for(i = 0; i < badList.length; i++){ 
    word = $.trim(badList[i]);

    if(word.length > 0){
      newSettings.keywords.push(word);
      newSettings.weights.push(DEFAULT_BAD_KEYWORD_WEIGHT);
    } 
  } 

  if(newSettings.keywords.length === 0)
    throw "No valid keywords entered for ranking jobs.";

  if(newSettings.weights.length !== newSettings.keywords.length +1)
    throw "In settings, keyword and weight lengths mismatch.";

  return newSettings;     
}

/**
 * Saves current site machine learning settings to localStorage.
 *
 * From settingsData, update global variables jSiteSettings and 
 * sSiteSettings and save new settings to localStorage if can.
 *
 * @param settingsData Is object with array elements keywords, weights.
 */
function SaveNewSiteSettings(settingsData){
  //Do a bit of extra validation, in case input is invalid
  if(('keywords' in settingsData) && ('weights' in settingsData) &&
  (settingsData.weights.length == settingsData.keywords.length + 1)){

    try{
      //update memory first, in case localStorage causes errors
      jSiteSettings = settingsData;
      sSiteSettings = JSON.stringify(jSiteSettings); 

      //update local storage if localStorage available
      localStorage.clear(); 
      localStorage.setItem("siteSettingsData", sSiteSettings); 
    }
    catch(error){
      return;
    } 
  }
  else{
    return;
  }
}

/**
 * Create and save default settings for the machine learning system.
 *
 * This is called if no current settings are saved or if they
 * are corrupted and must be reset. Settings are stored in
 * HTML5 localStorage if it's available, else just in memory.
 */
function SetSiteDefaultSettings(){
  var goodKeywords, badKeywords;

  goodKeywords = 
    "comput, code, algorithm, software, c++, python, javascript, " + 
    "program, matlab, supercomput, cluster, hpc, mpi, openmp, linux, " +
    "unix, neural net, machine learn, analytics, data, technology, " + 
    "modeling, simulation, research, operations research, econom, " + 
    "statistic, information tech, engineer, scientist, " +
    "analyst, math, mathematician, physic, physicist, " +
    "computer scien, data scien, data engineer";

  badKeywords = "bartender, waiter, food, beverage, clerk, cashier," + 
    " hotel, technician, medical physic, health physic, medical, " + 
    "auto, maintenance"; 

  var settingsData;

  try{
    settingsData = BuildSiteSettingsFromKeywords(goodKeywords,badKeywords);
  }
  catch(error){
    //failed for some reason, so use a minimal structure to recover
    settingsData = {"keywords":["job"], "weights":[DEFAULT_BIAS_WEIGHT, 
      DEFAULT_GOOD_KEYWORD_WEIGHT]};
  }

  //Update global variables, update localStorage if can
  SaveNewSiteSettings(settingsData); 
}

/**
 * Try to parse a JSON string w/ the app settings, throw exception if 
 * error occurs.
 *
 * Throws expection if jsonString is empty, fails to parse, or decodes
 * into something that is not a properly formatted settings object.
 *
 * @param {string} jsonString A string containing a JSON structure holding
 *        the app's machine learning settings.
 * @returns Decoded object, should have array elements keywords, weights.
 * @throws Throws exceptions if fails to parse the jsonString.
 */
function DecodeSettingsJSONString(jsonString){
  jsonString = $.trim(jsonString);

  if(jsonString.length === 0)
    throw "JSON string is empty.";

  var jsonObject = JSON.parse(jsonString); //try to parse

  if(('keywords' in jsonObject) && ('weights' in jsonObject) &&
  (jsonObject.weights.length == jsonObject.keywords.length + 1)){
    //Looks ok
    return jsonObject;
  }     
  else{
    throw 'JSON string could not be decoded, must be invalid.';
  }
}

/**
 * Return true if HMTL5 localStorage is available, else false.
 */  
function LocalStorageAvailable(){
  var test = 'test';  
  try{
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
  } catch(error){
      return false;
  }
}

/**
 * Loads settings from localStorage, use defaults if fails.
 *
 * If localStorage unavailable, will load defaults into memory.
 * If saved settings look invaild, will restore default settings.     
 */
function GetSettingsFromLocalStorage(){
  if(!LocalStorageAvailable()){
    //No local storage, loads default settings into memory
    SetSiteDefaultSettings();
  }
  else{
    var sSettings, jSettings;

    //Try to decode the settings, check if settings look valid
    try{
      sSettings = localStorage.getItem('siteSettingsData');

      //Note: this will throw exception if settings look invalid
      jSettings = DecodeSettingsJSONString(sSettings);

      //update global variables
      jSiteSettings = jSettings;
      sSiteSettings = sSettings;
    }
    catch(error){
      //Failed to load valid settings, so restore defaults
      SetSiteDefaultSettings();
    }
  }
}

/**
 * Retrieve job info from usajobs.gov server.
 *
 * Use jQuery and the usajobs.gov REST API to pull in
 * job results.  Store results in the global variable jobsRawData.
 * If successful, call function ParseJobsData().
 * If fail, show user an alert to check their network.
 *
 * NOTE: Not all arguments are needed.  If an argument is blank,
 * simply pass a blank string like "".
 *
 * @param {string} searchKeyword A keyword to search for in job descrips.
 * @param {string} seriesCode 4-charater string of digits.
 * @param {string} city City name.
 * @param {string} zipCode 5 character string of digits for US zipcode.
 */
function SearchForJobs(searchKeyword, seriesCode, city, zipCode){
  var params = {"ResultsPerPage": NUM_JOBS_PER_SEARCH};


  //Extra error checking, only proceed if have search argument(s)
  if(searchKeyword.length>0 || seriesCode.length>0 ||
  city.length>0 || zipCode.length>0){ 

    var location = "";

    //If present, load data into params object
    if(searchKeyword.length>0)
      params.Keyword = searchKeyword;
    if(seriesCode.length>0)
      params.JobCategoryCode = seriesCode;
    if(city.length>0)
      location = city;
    if(zipCode.length>0)
      if(location.length>0)
        location += ";" + zipCode;
      else
        location = zipCode; 

    params.LocationName = location;

    
    var requestHeaders = REQUEST_HEADERS;

    //Use jQuery .ajax() instead of .get() so we can change the
    //http headers (required by the usajobs.gov api). 
    //Note we can change headers in Cordova native apps (like this),
    //but we cannot change the headers in websites due to browser
    //security features.
    $.ajax({
      url: USA_JOBS_SEARCH_URL,
      method: 'GET',
      data: params,
      headers: requestHeaders,
      success: function(data){
        //Store raw jobs data, in case we need again later
        //(For example, if machine learning settings change, then
        //need to re-sort data)
        jobsRawData = data;   
        ParseJobsData();  //process job data, load into dataTable
      },
      error: function(error){
        //Ajax get() failed to retrieve data from usajobs.gov,
        //so show error alert.
        $("#errorAjaxGetFailed").show();
      }
    });

  }
}

/** Process the jobs data retrieved from the usajobs.gov server.
 *
 * Extracts info from data object, then uses machine learning
 * to rank each job from most interesting to least interesting.
 * Then loads sorted list of jobs into the dataTable.
 * For details on the JSON structure returned by usajobs.gov, see
 * https://data.usajobs.gov/Rest.
 *
 * Note: uses global variable jobsRawData: an object storing
 * raw data returned from usajobs.gov.  jobsRawData is set inside
 * SearchForJobs().
 */
function ParseJobsData(){
  var jobsList, jobslen;
  var i, line, jobDescrip, prob;
  var keywordIndices;

  if(jobsRawData && jobsRawData.SearchResult && 
  jobsRawData.SearchResult.SearchResultItems){
    jobsList = jobsRawData.SearchResult.SearchResultItems;
    jobslen = jobsList.length;
  }
  else{
    jobsList = [];
    jobslen = 0;
  }

  for(i = 0; i < jobslen; i++){
    //Rank jobs based on job description
    jobDescrip = jobsList[i].MatchedObjectDescriptor.PositionTitle + 
      " " + jobsList[i].MatchedObjectDescriptor.UserArea.Details.JobSummary;

    /*Build the feature vector for this job using the current machine
      learning settings.  Note feature vector is sparse--only store
      indices of non-zero components.*/
    keywordIndices = BuildFeatureVector(jobDescrip);

    /*Probability user will like this job, using feature vector.*/
    prob = ScoreText(keywordIndices);
    jobsList[i].prob = prob;
    jobsList[i].formattedScore = prob.toFixed(3);//Formatted for display

    //Append a clickable URL to full job description at usajobs.gov:
    jobsList[i].link = '  <a href="' + 
      jobsList[i].MatchedObjectDescriptor.PositionURI + 
      '" target="_blank" > ' +  
      jobsList[i].MatchedObjectDescriptor.PositionTitle + '</a>  ';

    /*For each job, create html code for an action button. Clicking
      the button will launch a modal which stores info on the job.
      Note: data-DocumentID stores the DocumentID, so the modal can load
       the correct job info.  Note class modalLauncher.*/
    jobsList[i].action = '<button type="button" '+
    'data-target="#jobInfoModal" '+
    'data-documentid="' + jobsList[i].MatchedObjectDescriptor.PositionID + 
    '" class="btn-xs '+
    'btn-primary modalLauncher" data-toggle="modal">View</button>';

    /*Build searchable jobsInfo hashtable, uses DocumentID as key.
      Then View buttons can grab the job data here using DocumentID.*/
    
    jobsInfo[ jobsList[i].MatchedObjectDescriptor.PositionID] = {
      'prob' : jobsList[i].prob,
      'keywordIndices' : keywordIndices,
      'Series' : jobsList[i].MatchedObjectDescriptor.JobCategory[0].code,
      'OrganizationName' : jobsList[i].MatchedObjectDescriptor.DepartmentName,
      'AgencySubElement' : jobsList[i].MatchedObjectDescriptor.OrganizationName,
      'SalaryMin' : jobsList[i].MatchedObjectDescriptor.PositionRemuneration[0].MinimumRange,
      'SalaryMax' : jobsList[i].MatchedObjectDescriptor.PositionRemuneration[0].MaximumRange,
      'SalaryBasis' : jobsList[i].MatchedObjectDescriptor.PositionRemuneration[0].RateIntervalCode,
      'Locations' : jobsList[i].MatchedObjectDescriptor.PositionLocation[0].CityName,
      'JobSummary' : jobDescrip,
      'ApplyOnlineURL' : jobsList[i].MatchedObjectDescriptor.ApplyURI,
      'link' : jobsList[i].link
    };
  }

  //now sort jobs by probability user will like the job, from high to low
  jobsList.sort(function(a,b) { return b.prob - a.prob; } );

  //Now fill dataTable      
  var t = $('#jobsTable').DataTable( {
    "searching": false,
    "paging":    DATA_TABLE_PAGINATION, //Can be toggled true/false
    "lengthMenu": [[5, 10, 25, -1], [5, 10, 25, "All"]],  //customize Show # Entries
    "pageLength": DATA_TABLE_PAGE_LENGTH,
    "ordering":  false,
    "retrieve":  true, //If data table already initialized, 
                       //don't reinitialize--can only call constructor 
                       //once--so just return dataTable existing object
    "columns": [
      { "width": "9%", "data": "formattedScore" },   
      { "width": "9%", "data": "action" },
      { "width": "82%", "data": "link" } //link is in jobsList[i].link
    ]
  } );
  
  t.clear();              //clear table, if not empty
  t.rows.add(jobsList)    //Now load data and redraw
    .draw();  

  //show dataTable
  $('#divJobsTable').show();
}

/**
 * Builds sparse feature vector by analyzing text.
 *
 * Scan through the text = title + job description for keywords, then 
 * build a sparse bag of words feature vector: store indices of keywords which
 * were present in the text. 
 *     
 * Example: if keywordIndices[0] == 5, this means the first keyword 
 * present in this job description is the keyword stored in
 * jSiteSettings.keywords[5]. 
 *
 * @param {string} text Job title + job description, text used to rate the 
 *        job.
 * @returns keywordIndices Array storing indices of keywords present
 *          in text.                
 */
function BuildFeatureVector(text){
  text = text.toLowerCase();

  var keywordIndices = [];

  var NumKeys = jSiteSettings.keywords.length;

  var keyword;
  var stringPos = -1;

  for(var i = 0; i < NumKeys; i++){
    keyword = jSiteSettings.keywords[i];

    stringPos = text.indexOf(keyword); 
    if(stringPos > -1){
      //the keyword is present in the job description, so 
      //save this keyword index
      keywordIndices.push(i);
    }
  }
  return keywordIndices;
}

/**
 * Compute dot product between a feature vector and the weight vector.
 *
 * Note: technically, the feature vector components X[i] === 1.0 if the
 * keyword is present, === 0.0 if not. I use a sparse representation so
 * just store the indices of nonzero X[i] components in the array
 * keywordIndices.
 *
 * @param keywordIndices Array storing integer indices of keywords present
 *        in text.
 * @returns Dot product, a real number.
 */  
function DotProduct(keywordIndices){
  var dotProduct = 0.0; 

  //Handle the bias term: the first feature vector element is
  //implicitly 1.0:
  dotProduct = jSiteSettings.weights[0];
  var index;

  for(var i = 0; i < keywordIndices.length; i++){
    index = keywordIndices[i];

    //X[i] is 1.0 for keywords present, 0.0 else. 
    //Note: (index+1) is because weight[0] is the bias term
    dotProduct += 1.0 * jSiteSettings.weights[index+1];
  }

  return dotProduct;
}

/**
 * Probability user likes a job. (Logistic regression sigmoid function.)
 *
 * @param {number} dotProduct A real number, should be the dot product 
 *        between the current weight vector (which stores the app's 
 *        machine learning settings) and a job's feature vector.
 * @returns Probability, real number 0-1.
 */  
function LogRegProb(dotProduct){ 
  var prob = 1.0/(1.0 + Math.exp(-dotProduct)); 

  return prob;
}

/**
 * Computes probability user likes job, given a feature vector.
 *
 * @param keywordIndices Array of integers holding indices of non-zero
 *        elements of feature vector.  (A sparse representation of the 
 *        feature vector of a job.)        
 * @returns A real number 0-1.
 */
function ScoreText(keywordIndices){
  //Compute dot product between weight and feature vector
  var dotProd = DotProduct(keywordIndices);

  //Chance a user likes this job, float between 0 and 1
  var prob = LogRegProb(dotProd);  

  return prob;
}

/**
 * Updates machine learning settings when user rates a job.
 *
 * @param documentID ID number for this job.
 * @param likeJob true if user likes job, else false.
 */
function RateJob(documentID, likeJob){
  //Predicted probability that the user would like this job
  var ProbLR = jobsInfo[documentID].prob;

  //Indices of keywords that appeared in this job description.
  var keywordIndices = jobsInfo[documentID].keywordIndices;

  var y = 0.0;   
  if(likeJob){
    y = 1.0;    
  }

  //Update machine learning algorithm weights
  OnlineLRUpdateWeights(keywordIndices, ProbLR, y);
}

/**
 * Updates weight vector for online logistic regression with job rating.
 *
 * Uses online gradient descent learning algorithm. Updates weights
 * each time a user rates a job.
 *
 * @param keywordIndices Array of indices of nonzero elements of feature
 *        vector for a job (for sparse representation).
 * @param ProbLR Logistic regression classifier's predicted probability
 *        that user likes this job, real number 0-1.     
 * @param y Is the user's job rating (the training data): is 1.0 if the 
 *        user liked the job, 0.0 if not.
 */
function OnlineLRUpdateWeights(keywordIndices, ProbLR, y){

  /* Weight vector update formula is
    weight[i] -= LEARNING_RATE*X[i]*(ProbLR - y)
  but X[i] is 1 or 0, so only update weights with X[i] = 1. Those
  indices of i (with X[i] != 0) are stored in keywordIndices array.
  (This is a sparse representation to save memory and time.) */

  //Common math factor:
  var factor = LEARNING_RATE*(ProbLR - y);

  //Update bias term
  jSiteSettings.weights[0] -= factor;

  //Loop over indices of non-zero feature vector elements, which have val 1
  for(var i = 0; i < keywordIndices.length; i++){
    jSiteSettings.weights[keywordIndices[i]+1] -= factor;
  }

  //Save these updated settings to localStorage if can  
  SaveNewSiteSettings(jSiteSettings);
}