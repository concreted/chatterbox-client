// YOUR CODE HERE:
var app = {
  server:'https://api.parse.com/1/classes/chatterbox',
  friends: [],
  init: function(){
    setInterval(function() {
      //console.log('running');
      app.fetch();

    }, 1000);
  },
  send: function(message){
    $.ajax({
      // always use this url
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message');
      }
    });
  },
  fetch: function(){
    $.ajax({
      // always use this url
      url: this.server,
      type: 'GET',
      // data: JSON.stringify(message),
      contentType: 'application/json',
      data: {
        limit: 200,
        order: '-createdAt',
        where: {
          roomname : window.room
        }
      },
      success: function (data) {
         console.log(data);
        // console.log('chatterbox: Message fetched');
        app.clearMessages();
        _.each(data['results'], (function(message) {
          //console.log(this);
          this.addMessage(message);
        }).bind(app));
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to fetch message');
      }
    });
  },

  clearMessages: function(){
    $('#chats').empty();
  },
  addMessage: function(message) {
    if (this.friends.indexOf(message.username) >= 0) {
      $username = $('<span class="username friend">').text(message.username);
    } else {
      $username = $('<span class="username">').text(message.username);
    }
    $text = $('<span class="text">').text(': ' + message.text);
    $full = $('<div class="message">').append($username).append($text);
    $('#chats').append($full);
  },
  addRoom: function(room) {
    if (room.length > 0) {
      $('#roomSelect').append('<span class="roomName">' + room + '</span>');
      window.room = room;
    }
  },
  addFriend: function(friend) {
    console.log(friend);
    this.friends.push(friend);
    $('#chats').find('.username:contains("' + friend + '")').addClass('friend')
  },
  handleSubmit: function(message) {
    console.log('Submit', message);
    var user = window.location.search.slice(10);

    var messageObject = {
      username: user,
      text: message,
      roomname: window.room || 'lobby'
    };

    console.log(messageObject);

    app.send(messageObject);
  },
};

$(document).ready(function() {
  $("#chats").on('click', '.username', function() {
    app.addFriend($(this).text());
  });
  $('#send .submit').click(function(event) {
    app.handleSubmit($('.chatbox').val());
  });
  $('#chooseRoom .submit').click(function(event) {
    app.addRoom($('.roombox').val());
  });
  $("#roomSelect").on('click', '.roomName', function() {
    window.room = $(this).text();
  });

  app.init();
});



