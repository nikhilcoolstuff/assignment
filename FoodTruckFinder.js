var request = require('request');
var prompt = require('prompt');
var table = require('console.table');

const BASE_URL = 'https://data.sfgov.org/resource/bbb8-hzi6.json'
const PER_PAGE_COUNT = 10

callFoodTruckApi(0);

// Fetch food truck data
function callFoodTruckApi(currentPage) {
  request(BASE_URL + apiParams(currentPage), function (error, response, body) {

    if (error || response.statusCode != 200) { return onErr(error); }
    var json = JSON.parse(body);
    displayResults(json);

    if (json.length >= PER_PAGE_COUNT) {
      var properties = [{
          name: 'continueKey',
          description: 'Press any key to see more results, X to cancel'
      }];
      prompt.start();
      prompt.get(properties, function (err, result) {
        if (err) { return onErr(err); }
        if (result.continueKey.toUpperCase() == 'X') {
          console.log('Program aborted');
        } else {
          callFoodTruckApi(++currentPage);
        }
      });
    } else {
      console.log('No More Data')
    }
  });
}

// Construct API Params
function apiParams (currentPage){
  var offset = currentPage*PER_PAGE_COUNT;
  var today =  new Date();
  var dayOrder = today.getDay();
  var time = ('0' + today.getHours()).slice(-2) + ':' + ('0' + today.getMinutes()).slice(-2); // doing this to make sure we keep the leading zero for single digit hour and minute
  return `?$limit=`+PER_PAGE_COUNT+`&$offset=`+offset+`&dayorder=`+dayOrder+`&$order=applicant&$where=start24 <= '`+time+`' AND end24 >= '`+time+`'`;
}

// log any errors
function onErr(err) {
  console.log(err);
  return 1;
}

// Display results with proper formatting
function displayResults(results) {
  var resultsDisplayArray = results.map(function(obj) {
     var rObj = {};
     rObj.NAME = obj.applicant;
     rObj.ADDRESS = obj.location;
     return rObj;
  });
  console.table(resultsDisplayArray);
}
