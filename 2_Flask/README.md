# Usajobs Search Tool: Flask App

This folder contains a Usajobs search website (written in Flask)
to retrieve data from the Usajobs.gov API.
(Python/Flask changes HTTP headers to add the API key 
which enables the connection to the Usajobs.gov API.)

Try the app here [usajobtool](https://usajobtool.herokuapp.com/)  
(It's hosted on a free heroku account, so it could be sluggish.)
 

To test this web app on your local computer:

1. Download this git repository if you have not already done so.
2. Request a free API key from the usajobs.gov [developer site](https://developer.usajobs.gov/APIRequest/Index).
 Enter your API key information in *2_Flaskl/app.py*.
3. To run the app locally (for testing only), open a 
 terminal to the folder containing app.py and run  
 ```python
  python app.py
  ```  
 Flask will launch a simple web server on your machine.  Make note of the 
 IP address where the app is served (it's usally [http://127.0.0.1:5000/](http://127.0.0.1:5000/)).  
4. Open a web browser and in the address bar type the IP address
 (e.g. [http://127.0.0.1:5000/](http://127.0.0.1:5000/)).  The web page should load and 
 you should be able to search for jobs.  
5. Press Ctrl+c in the terminal to stop the web server.  
6. Optional: it's possible to deploy the app to the internet.  See the
 Flask [Deployment Options](http://flask.pocoo.org/docs/0.12/deploying/).
