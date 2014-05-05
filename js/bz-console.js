function dumpResult(result) {
  // console.log(result);
  var reduced = _.map(result, function(bug) {
    return _.pick(bug, 'id', 'summary', 'priority', 'last_change_time');
  });

  $('#output').html(JSON.stringify(reduced, null, ' '));
}

// https://bugzilla.mozilla.org/show_bug.cgi?id=980408

var bugUrlRx = /^https\:\/\/bugzilla\.mozilla\.org\/show\_bug\.cgi\?id\=[\d]+$/;

function reset() {
  $('#query-form button').html('Submit').toggleClass('btn-warning btn-primary');
  $('.result-container').show();
}

$(function() {
  var bugzilla = bz.createClient();

  // bindings

  $('#query-form').submit(function(ev) {
    ev.preventDefault();
    $('.result-container').hide();
    $('#query-form button')
      .html('Loading')
      .toggleClass('btn-warning btn-primary');

    var input = $('#input').val();
    var bug_id = false;

    if (bugUrlRx.test(input)) {
        // we have a url
      bug_id = input.split('=').pop();
    }
    else {
      // we have a bug number
      if (/^[\d]/.test(input)) {
        bug_id = input;
      }
    }

    if (bug_id) {
      bugzilla.searchBugs({blocks: bug_id}, function(err, result) {
        reset();
        if (err) throw err;
        dumpResult(result);
      });
    } else {
      // set error
      reset();
    }
  });
});