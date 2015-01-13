module.exports =

function($state, User, Empirical, _){
    var sample = this;

    Empirical.getAvailablePrompts().$loaded().then(function(prompts) {
      prompts = _.each(prompts, function(p) {
        p.id = p.$id;
      });
      prompts = _.filter(prompts, function(p) {
        return !p.private;
      });
      sample.availablePrompts = prompts;
    });

    sample.next = function(p, un) {
      $state.go('quill-writer.link', {id: p.id, name: p.name});
    };
};
