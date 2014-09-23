var Message = Backbone.Model.extend({
  initialize: function(username, message, room, isFriend) {
    this.set('username', username);
    this.set('message', message);
    this.set('room', room);
    this.set('isFriend', isFriend);
  }
});

var MessageView = Backbone.View.extend({
  initialize: function() {
    this.model.on('change:')
  },
});
