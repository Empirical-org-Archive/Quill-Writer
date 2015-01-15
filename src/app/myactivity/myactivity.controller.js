module.exports =

function($state, User, Empirical){
  var myactivity = this;
  var id = $state.params.id;

  var activity = Empirical.getActivity(id);
  activity.$loaded().then(function(a) {
    myactivity.activity = a;
  });

  myactivity.next = function(un) {
    // FIXME: userName field appears to be unused in LinkCtrl.
    $state.go('quill-writer.link', {id: id, name: myactivity.activity.name, userName: un});
  };
};
