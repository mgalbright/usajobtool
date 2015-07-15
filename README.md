# usajobtool
A web app for searching usajobs.gov

This site is a cross platform, mobile friendly web app for searching usajobs.gov (https://www.usajobs.gov). Beyond searching, this page uses machine learning (online logistic regression) to rank jobs based on job title and summary, then sorts the jobs to display the most interesting jobs first. You may rate jobs (like/don't like), and the machine learning settings will be updated: the app will learn what kinds of jobs you like or don't like.  

Details: 
This page runs entirely locally (in the browser) using javascript, jQuery, and HTML5.  It is styled (mobile friendly) using Bootstrap. It obtains its data using the usajobs.gov open REST API (https://data.usajobs.gov). Machine learning settings are stored in HTML5 local storage. You may export/import settings if using this app across multiple devices. You may also create new machine learning settings by inputting keywords present in jobs that you like and don’t like.  (Try to use root words that are more likely to occur, e.g. mathemat instead of mathematician or mathematics.)
