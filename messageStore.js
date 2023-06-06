/* abstract */ class MessageStore {
  saveMessage(message) {}
  findMessagesForUser(userID) {}
}

class InMemoryMessageStore extends MessageStore {
  constructor() {
    super();
    this.messages = [];
  }

  saveMessage(message) {
    this.messages.push(message);
  }

  findMessagesForUsers(userID, otherUserID) {
    return this.messages.filter(
      ({ from, to }) => (from === userID && to.user_id === otherUserID) || (to.user_id === userID && from === otherUserID)
    );
  }
}

const CONVERSATION_TTL = 24 * 60 * 60;

class RedisMessageStore extends MessageStore {
  constructor(redisClient) {
    super();
    this.redisClient = redisClient;
  }

  saveMessage(message) {
    const value = JSON.stringify(message);
    this.redisClient
      .multi()
      .rpush(`messages:${message.from}`, value)
      .rpush(`messages:${message.to.user_id}`, value)
      .expire(`messages:${message.from}`, CONVERSATION_TTL)
      .expire(`messages:${message.to.user_id}`, CONVERSATION_TTL)
      .exec();
  }

  findMessagesForUser(userID, otherUserID) {
    return this.redisClient
      .lrange(`messages:${userID}`, 0, -1)
      .then((results) => {
        return results.map((result) => JSON.parse(result)).filter(
          ({ from, to }) => (from === userID && to.user_id === otherUserID) || (to.user_id === userID && from === otherUserID)
        );
      });
  }
}

module.exports = {
  InMemoryMessageStore,
  RedisMessageStore,
};