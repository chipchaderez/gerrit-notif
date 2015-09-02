var pollTimer;
var startButton = document.getElementById('start');
startButton.onclick = function () {
    switch (startButton.value) {
        case "start":
            startButtonFunc();
            break;
        case "load":
            break;
        case "stop":
            stopButtonFunc();
            break;
    }

    function startButtonFunc() {
        startButton.value = "load";
        startButton.innerHTML = "Starting...";
        document.getElementById('gerrit_server').disabled = true;
        document.getElementById('gerrit_username').disabled = true;
        var notifications_checkboxes = document.getElementsByName('notifications[]');
        for (var i = 0, l = notifications_checkboxes.length; i < l; i++) {
          notifications_checkboxes[i].disabled = true;
        }
        document.getElementById('interval').disabled = true;
        $fh.cloud(
            {
                path: 'register',
                data: {
                   gerrit_server: document.getElementById('gerrit_server').value,
                   gerrit_username: document.getElementById('gerrit_username').value,
                   interval: document.getElementById('interval').value,
                   notifications: getNotifications()
                }
            },
            function (res) {
                startButton.value = "stop";
                startButton.innerHTML = "Stop Notification Service";
            },
            function (code, errorprops, params) {
                startButton.value = "start";
                startButton.innerHTML = "Start Notification Service";
                alert('An error occured: ' + code + ' : ' + errorprops);
            }
        );
        startInterval(document.getElementById('interval').value);
    }

    function stopButtonFunc() {
        startButton.value = "start";
        startButton.innerHTML = "Start Notification Service";
        document.getElementById('gerrit_server').disabled = false;
        document.getElementById('gerrit_username').disabled = false;
        var notifications_checkboxes = document.getElementsByName('notifications[]');
        for (var i = 0, l = notifications_checkboxes.length; i < l; i++) {
           notifications_checkboxes[i].disabled = false;
        }
        document.getElementById('interval').disabled = false;
        stopInterval();
    }

    function getNotifications() {
        var notifications_checkboxes = document.getElementsByName('notifications[]');
        var notifications = [];
        for (var i = 0, l = notifications_checkboxes.length; i < l; i++) {
            if (notifications_checkboxes[i].checked) {
                notifications.push(notifications_checkboxes[i].value);
            }
        }
        return notifications;
    }

    function startInterval(interval) {
        pollTimer = setInterval(function() {
            $fh.cloud(
                {
                    path: 'poll',
                    data: {
                        gerrit_username: document.getElementById('gerrit_username').value
                    }
                },

                function (res) {
                    if (res.msg != 'success') {
                        bootbox.dialog({
                            title: "No connection to gerrit server",
                            message:"A problem connecting to the gerrit server"
                        });
                        stopButtonFunc();
                    }
                    if (!res.changes.length) {
                        return;
                    }

                    var message = "";
                    var gerrit_server = document.getElementById('gerrit_server').value;
                    for (var i = 0; i < res.changes.length; i++) {
                      var hasScore = (res.changes[i].score != undefined);
                      var hasStatus = (res.changes[i].newStatus != undefined);
                      if (hasScore) {
                        var newScore = res.changes[i].score;
                        newScore = newScore > 0 ? "+" + newScore : newScore;
                        message += "Change got a new score : " + newScore;
                      }
                      if (hasStatus) {
                        var newStatus = res.changes[i].newStatus;
                        message += "Change got a new status : " + newStatus;
                      }
                      if (!hasStatus && !hasScore && (res.changes[i].newUpdated != undefined)) {
                        message += "Change has been updated at " + res.changes[i].newUpdated;
                      }
                      var url = "http://" + gerrit_server + "/" + res.changes[i]._number;
                      message += "<br>Subject : " + res.changes[i].subject + "<br>";
                      message += '<a href="' + url + '">' + url + '</a><br>'
                    }

                    bootbox.dialog({
                        title: "New Notifications!",
                        message: message
                    });
                },
                function (code, errorprops, params) {
                    //alert('An error occured: ' + code + ' : ' + errorprops);
                }
            );
        }, interval * 1000);
    }

    function stopInterval() {
        clearInterval(pollTimer);
        pollTimer = null;
    }
};
