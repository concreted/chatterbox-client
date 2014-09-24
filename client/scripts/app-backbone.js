var Message = Backbone.Model.extend({
  initialize: function(username, message, room) {
    this.set('username', username);
    this.set('message', message);
    this.set('room', room);
    this.set('isFriend', false);
  }
});

var MessageView = Backbone.View.extend({
  tagName: 'li',
  initialize: function() {
    this.model.on('change:isFriend', function() {
      this.render();
    }, this);
  },

  render: function() {
    $username = $('<span class="username">').text(this.model.get('username'));
    $text = $('<span class="text">').text(': ' + this.model.get('message'));
    $full = $('<div class="message">').append($username).append($text);
    return this.$el.html($full.html());
  }
});

var ChatRoom = Backbone.Collection.extend({
  model: Message,
  url: '',
  initialize: function(room){
    //fetch messages from server for the room
    this.room = room;
    this.fetch(room);

    app.chatroomStore[room] = this;
  },

  fetch: function() {
    $.ajax({
      // always use this url
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      // data: JSON.stringify(message),
      contentType: 'application/json',
      data: {
        limit: 50,
        order: '-createdAt',
        where: {
          roomname : this.room
        }
      },
      success: (function (data) {
        var newMessages = [];
        for (var i = 0; i < data['results'].length; i++) {
          var message = data['results'][i];
          // Make a new Message (aka make new Message models)
          var m = new Message(message.username, message.text, message.roomname);
          // Add new Message model to collection
          newMessages.push(m);
        }

        this.reset(newMessages);
      }).bind(this),
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to fetch message');
      }
    });
  },
  send: function(message){
    $.ajax({
      // always use this url
      url: 'https://api.parse.com/1/classes/chatterbox',
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
  handleSubmit: function(message) {
    console.log('Submit', message);
    var user = window.location.search.slice(10);

    var messageObject = {
      username: user,
      text: message,
      roomname: this.room || 'lobby'
    };

    console.log(messageObject);

    this.send(messageObject);
  }
});

var ChatRoomView = Backbone.View.extend({
  tagName: 'ul',
  initialize: function() {
    this.collection.on('reset', this.render, this);
    var roomDiv = '<span class="roomName">' + this.collection.room + '</span>';
    $('#roomSelect').append(roomDiv);
    app.chatroom = this.collection;
  },

  render: function() {
    this.$el.empty();
    this.collection.each(function(message){
        var messageView = new MessageView({ model: message });
        this.$el.append(messageView.render()); // adding all the person objects.

    }, this);

    return this.$el.html();
  }
});


var App = Backbone.Model.extend({
  initialize: function() {
    this.chatroomStore = {};
    this.selectRoom = function(room) {
      app.chatroom = app.chatroomStore[room];
      app.chatroom.fetch();
    }
  }
});

var app = new App();

$(document).ready(function() {
  $('#send .submit').click(function(event) {
    app.chatroom.handleSubmit($('.chatbox').val());
  });
  $('#chooseRoom .submit').click(function(event) {
    var room = $('.roombox').val();
    if (!app.chatroomStore.hasOwnProperty(room)) {
      var newChatroom = new ChatRoom(room);
      var newView = new ChatRoomView({ el: $('#chats'), collection: newChatroom}, room);
    }
  });
  $("#roomSelect").on('click', '.roomName', function() {
    var room = $(this).text();
    app.selectRoom(room);
  });

  app.chatroom = new ChatRoom('lobby');
  app.view = new ChatRoomView({ el: $('#chats'), collection: app.chatroom });
  app.chatroomStore['lobby'] = app.chatroom;
  setInterval(function() {app.chatroom.fetch()}, 1000);
});

