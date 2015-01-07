module.exports =

['$http', 'empiricalBaseURL', '_', function ActivitySession($http, empiricalBaseURL, _) {
  var activitySession = this;

  function activitySessionUrl(id) {
    return empiricalBaseURL + '/activity_sessions/' + id;
  }

  function update(id, putData, cb) {
    return $http.put(activitySessionUrl(id), putData);
  }

  /*
   * Mark the activity session as finished. The promise receives
   * the activity session JSON returned from the LMS.
   * 
   * Example:       
   * ActivitySession.finish(User.currentUser.sid).then(function next(activitySession) {
   *   // Do stuff here
   * });
   * 
   * TODO: Serialize concept tag results and send as part of the 
   * request body.
   */
  activitySession.finish = function(sessionId, putData, cb) {
    putData = _.extend(putData, {state: 'finished'});
    return update(sessionId, putData).then(function next(response) {
      return response.data.activity_session;
    });
  }
}]