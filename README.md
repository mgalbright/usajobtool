# usajobtool
A web app for searching usajobs.gov

This site is a cross platform, mobile friendly web app for searching usajobs.gov (https://www.usajobs.gov). Beyond searching, this page uses machine learning (online logistic regression) to rank jobs based on job title and summary, then sorts the jobs to display the most interesting jobs first. You may rate jobs (like/don't like), and the machine learning settings will be updated: the app will learn what kinds of jobs you like or don't like.  

Details: 
This page runs entirely locally (in the browser) using javascript, jQuery, and HTML5.  It is styled (mobile friendly) using Bootstrap. It obtains its data using the usajobs.gov open REST API (https://data.usajobs.gov). Machine learning settings are stored in HTML5 local storage. You may export/import settings if using this app across multiple devices. You may also create new machine learning settings by inputting keywords present in jobs that you like and don’t like.  (Try to use root words that are more likely to occur, e.g. mathemat instead of mathematician or mathematics.)

Warning: 
usajobs.gov (https://data.usajobs.gov/) will update their REST API to version 5.2 in October, 2015.  At that time, this application will cease functioning.  Unfortunately, API v5.2 effectively blocks JavaScript-based applications like this one:  first, the new API requires a modified User-Agent in the HTTP header, but web browsers explicitly prevent AJAX from changing the User-Agent for security reasons.  Second, v5.2 does not appear to support cross-origin resource sharing.  I am investigating the feasibility of converting this web app into a Chrome extension to bypass the security restrictions. 
