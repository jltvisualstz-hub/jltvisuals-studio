package com.kazihub.app.model

enum class MessageDeliveryStatus {
    SENDING, SENT, DELIVERED, READ
}

data class ChatMessage(
    val id: String,
    val conversationId: String,
    val senderId: String,
    val senderName: String,
    val content: String,
    val timestamp: String,
    val status: MessageDeliveryStatus = MessageDeliveryStatus.READ,
    val isSystemNotice: Boolean = false,
    val attachmentUrl: String? = null
)

data class ConversationSummary(
    val id: String,
    val participantId: String,
    val participantName: String,
    val participantRole: String,
    val participantAvatar: String,
    val lastMessage: String,
    val lastTimestamp: String,
    val unreadCount: Int = 0,
    val relatedProjectTitle: String? = null
)
