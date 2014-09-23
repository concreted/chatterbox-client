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
    //this.render();
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
    this.fetch(room);
  },

  fetch: function(room) {
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
          roomname : room
        }
      },
      success: (function (data) {
        console.log(data);
        // console.log('chatterbox: Message fetched');
        console.log(this);

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
  }
});

var ChatRoomView = Backbone.View.extend({
  tagName: 'ul',
  initialize: function() {
    this.listenTo(this.collection, 'reset', this.render);
  },

  render: function() {
    console.log('rendering chatroom');
    //$('#chats').empty();
    this.collection.each(function(message){
        var messageView = new MessageView({ model: message });
        this.$el.append(messageView.render()); // adding all the person objects.
    }, this);

    return this.$el;
  }
});

var app = {};
app.chatroom = new ChatRoom('lobby');
app.view = new ChatRoomView({collection: app.chatroom});

$(document).ready(function() {
  // var m = new Message('a', 'hello', 'lobby');
  // var mv = new MessageView({model: m});
  // var cr = new ChatRoom();
  // cr.url = '/lobby';

  $('#chats').append(app.view.render());

  // $('#chats').append([
  //   mv.render()
  // ]);

});

