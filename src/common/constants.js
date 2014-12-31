angular.module("sf.constants", [])

  .constant("appName", "Quill Writer")
  .constant("tagLine", "Learn by Writing Together")
  // TODO: Figure out how to separate environments

  .constant("baseFbUrl", "https://quill-writer.firebaseio.com/")

  // .constant("empiricalBaseURL", "https://staging.quill.org/api/v1")
  .constant("empiricalBaseURL", "http://localhost:3000/api/v1")
;

module.exports = 'sf.constants';
