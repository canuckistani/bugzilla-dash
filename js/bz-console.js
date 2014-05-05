console.error('reloaded');

function dumpResult(result) {
  var output = _.map(result, function(bug) {
    return _.map(bug, function(val, prop) {
      return [prop, val].join(': ')+"\n";
    });
  }).join("\n\n----\n");

  $('#output').html(output);
}

$(function() {
  var bugzilla = bz.createClient();

  // bindings
  $('#query-form').submit(function(ev) {
    ev.preventDefault();

    $('#query-form button').html('Loading').toggleClass('btn-warning btn-primary');

    var ids = $('#bug-ids').val();

    var functionList = [];
    _.each(ids, function(_id) {
      functionList.push(function(callback) {
        bugzilla.bugComments(_id, function(err, result) {
          if (err) callback(err);

          callback(null, {id: _id, first_comment: result[0].raw_text});
        });
      });

      functionList.push(function(callback) {
        bugzilla.getBug(_id, function(err, result) {
          if (err) callback(err);

          callback(null, {id: _id, summary: result.summary});
        });
      });
    });

    async.parallel(functionList, function(err, result) {
      if (err) {
        throw err;
      }

      // dumpResult(result);
      var grouped ={};
      _.each(result, function (item) {
        if (!grouped[item.id]) {
          grouped[item.id] = {id: item.id};
        }
        // grouped[item.id].push(item);
        if (item.summary) {
          grouped[item.id].summary = item.summary;
        }
        if (item.first_comment) {
          grouped[item.id].first_comment = item.first_comment;
        }

      });
      $('#query-form > form > button').html('Submit').toggleClass('btn-warning btn-primary');
      dumpResult(grouped);
    });
  });
});