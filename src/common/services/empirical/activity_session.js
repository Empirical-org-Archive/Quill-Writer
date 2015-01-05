module.exports =

['$http', 'empiricalBaseURL', function ActivitySession($http, empiricalBaseURL) {
  var activitySession = this;

  function activitySessionUrl(id) {
    return empiricalBaseURL + '/activity_sessions/' + id;
  }

  function update(id, putData, cb) {
    $http.put(activitySessionUrl(id), putData).then(function(response) {
      // TODO: Pass back an error if status != 200
      cb(null, response);
    });
  }

  /*
   * Mark the activity session as finished. The callback receives
   * the activity session JSON returned from the LMS.
   * 
   * Example:       
   * ActivitySession.finish(User.currentUser.sid, function next(err, activitySession) {
   *   // Do stuff here
   * });
   * 
   * TODO: Serialize concept tag results and send as part of the 
   * request body.
   */
  activitySession.finish = function(sessionId, cb) {
    update(sessionId, {
      state: 'finished' 
    }, function next(err, response) {
          if (!err) {
            cb(null, response.data.activity_session);
          }
    });
  }
}]