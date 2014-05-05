console.error('reloaded');

var firebug_ids = [704094,717749,892935,895887,911209,922146,924692,940950,966468,966895,977128,983600,985597,991810,992947,993416,993445,994055,994555,994559,994729,997092,997198,998933,1004535,1004678];

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

    $('#query-form > form > button').html('Loading').toggleClass('btn-warning btn-primary');

    var ids = $('#bug-ids').html().split(',');

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