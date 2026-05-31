class Conversation {
  final String id;
  final List<String> participants;
  final String lastMessage;
  final DateTime updatedAt;

  Conversation({
    required this.id,
    required this.participants,
    required this.lastMessage,
    required this.updatedAt,
  });
}
