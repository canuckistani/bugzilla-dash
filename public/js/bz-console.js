function dumpResult(result) {
  // console.log(result);
  var reduced = _.map(result, function(bug) {
    return _.pick(bug, 'id', 'summary', 'status', 'priority', 'last_change_time');
  });

  $('#output').html(JSON.stringify(reduced, null, ' '));
}

// https://bugzilla.mozilla.org/show_bug.cgi?id=980408

var bugUrlRx = /^https\:\/\/bugzilla\.mozilla\.org\/show\_bug\.cgi\?id\=[\d]+$/;

function reset() {
  $('#query-form button').html('Submit').toggleClass('btn-warning btn-primary');
  $('.result-container').show();
  $('.key').html('');
}

var statusColours = {
  UNCONFIRMED: '#D28849',
  NEW: '#D2A549',
  ASSIGNED: '#2D467F',
  RESOLVED: '#227272',
  REOPENED: '#BBE5E5'
};

var priorityColours = {
  '--': '#2C7E7E',
  P1: '#BD7539',
  P2: '#BD9139',
  P3: '#97B0E8',
  P4: '#8CE5E5'
};

function render(counts, colours, target) {
  var data = _.map(counts, function(count, key) {
    return {
      value: count,
      color: colours[key]// yankee imperialism
    };
  });

  // console.log(data);

  var ctx = document.querySelector('#'+target).getContext("2d");
  ctx.canvas.height = 300;
  ctx.canvas.width = 300;
  new Chart(ctx).Doughnut(data, {});
  renderKey(colours, function(err, list) {
    $('#'+target).after(list);
  });

}

function renderKey(colours, callback) {
  var list = '<ul class="key-list"><% _.each(colours, function(item) { %> <li><span style="background-color: <%= item.colour %>;"><%= item.label %></span></li> <% }); %></ul>';
  var tplData = _.map(colours, function(c, k) {
    return { colour: c, label: k };
  });
  var listStr = _.template(list, {colours: tplData});
  callback(null, listStr);
}

function renderTable(results) {
  var fields_whitelist = ["last_change_time","creation_time","id","depends_on","status","component","product","blocks","summary","resolution","creator","assigned_to","whiteboard","severity","url","priority","classification","alias"];

  var filtered = _.map(results, function(row) {
    return _.pick(row, fields_whitelist);
  });
  
  // XXX now render a table using this

  // var header_tpl = Handlebars.compile($('#table-header-tpl').html());

  // var header = header_tpl(fields_whitelist);

  var data_tpl = Handlebars.compile($('#table-data-tpl').html());
  var rows = data_tpl({datarows: results});
  $('#bug-table').html(rows);
  console.log(filtered);
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
      // we have a bug number??
      if (/^[\d]/.test(input)) {
        bug_id = input;
      }
    }

    if (bug_id) {

      bugzilla.getBug(bug_id, function(err, bug) {
        if (err) throw err;
        console.log(bug);
        $('#bug-title').html(bug.id + ': ' + bug.summary);
      });

      bugzilla.searchBugs({blocks: bug_id}, function(err, result) {
        reset();
        if (err) throw err;

        // var selected = _.map(result, function(r) {
        //   return _.pick(r,'id', 'priority');
        // });

        // console.log(selected);

        var priorityData = {};
        var statusData = {};

        _.each(result, function(bug) {
          var status = bug.status;

          if (!statusData[status]) {
            statusData[status] = 0;
          }
          statusData[status]++;

          var priority = bug.priority;
          if (!priorityData[priority]) {
             priorityData[priority] = 0;
          }
          priorityData[priority]++;

        });

        // console.log({statusData: statusData, priorityData: priorityData});

        render(statusData, statusColours, 'status-chart');
        render(priorityData, priorityColours, 'priority-chart');

        renderTable(result);
      });
    } else {
      // set error
      reset();
    }
  });

  $('#query-form').submit();
});