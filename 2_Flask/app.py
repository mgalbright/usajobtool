"""Flask app to serve usajob search tool.
"""


#IMPORTANT: FILL IN YOUR API KEY INFORMATION HERE.
#Request a free API key from
#  https://developer.usajobs.gov/APIRequest/Index
REQUEST_HEADERS = {
  'Host' : 'data.usajobs.gov',
  'User-Agent': 'PASTE-YOUR-USER-AGENT-HERE',
  'Authorization-Key' : 'PASTE-YOUR-AUTHORIZATION-KEY-HERE'}

#IMPORTANT: UPDATE THIS URL IF THE USAJOBS API CHANGES
USA_JOBS_SEARCH_URL = 'https://data.usajobs.gov/api/search?'


#------------------------------------------------------------------------------
import requests
from flask import Flask, request, jsonify, current_app

app = Flask(__name__)




@app.route('/')
def loac():
  """Render the html page.  I use send_static_file since I don't need
     templating."""
  return current_app.send_static_file('index.html')


@app.route('/usajobs-api-5-7', methods=['GET'])
def SearchJobs():
  """Respond to GET requests from the front end by returning jobs."""
  #Get search Keyword
  searchKeyword = request.args.get('Keyword')
  jobCode = request.args.get('JobCategoryCode')
  location = request.args.get('LocationName')
  numResults = request.args.get('ResultsPerPage')
  page = request.args.get('Page')

  if page is None:
    page = 1

  payload = {'Keyword' : searchKeyword, 'JobCategoryCode': jobCode,
    'LocationName' : location, 'ResultsPerPage' : numResults,
    'Page' : page}

  #pull data from USAjobs.gov website
  #NOTE: here we rewrite the headers to include the API key info.
  r = requests.get(USA_JOBS_SEARCH_URL, headers=REQUEST_HEADERS, params=payload)

  result = r.json()
  response = jsonify(result)


  return response

if __name__ == '__main__':
  #app.run(debug=True)
  app.run()
