// Save/retrieve concept tag results from firebase
function ConceptTagResult($firebase, baseFbUrl) {
  var conceptTagResult = this;

  var resultsRef = new Firebase(baseFbUrl + "/concept_tag_results");

  // Load the list of results from firebase, return a promise that receives
  // the loaded list.
  function getResultList(activitySessionId) {
    var resultList = $firebase(resultsRef.child(activitySessionId)).$asArray();
    return resultList.$loaded();    
  }

  // All concept tag results should be stored in firebase as 
  // arrays that are keyed off the activity session ID.
  //
  // Example usage:
  // ConceptTagResult.save(User.currentUser.sid, {
  //   foo: 'bar'
  // }).then(function() {
  //   console.log('successfully saved');
  // });
  //
  // TODO: Don't store the same result multiple times.
  conceptTagResult.save = function(activitySessionId, data, cb) {
    return getResultList(activitySessionId).then(function(list) {
      return list.$add(data);
    });
  };

  // Retrieve all concept tag results in a plain JSON form that can be used
  // to post back to the LMS. Returns a promise that receives the JSON object.
  //
  // Example usage:
  //
  // ConceptTagResult.findAsJsonByActivitySessionId(User.currentUser.sid).then(function(json) {
  //  console.log('here is the prepared json', json);
  // });
  conceptTagResult.findAsJsonByActivitySessionId = function(activitySessionId) {
    return getResultList(activitySessionId).then(function(list) {
      // Need to strip out $id and $priority fields from the JSON, because we do not want the LMS
      // to store that data.
      return list.map(function(fbResultObject) {
        var clean = JSON.parse(JSON.stringify(fbResultObject));
        delete clean.$id;
        delete clean.$priority;
        return clean;
      });
    });
  };
}

ConceptTagResult.$inject = ['$firebase', 'baseFbUrl'];

module.exports = ConceptTagResult;


