package com.kazihub.app.data.repository

import com.kazihub.app.model.AppNotification
import com.kazihub.app.model.ChatMessage
import com.kazihub.app.model.ConversationSummary
import com.kazihub.app.model.NotificationType
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map

interface MessageRepository {
    fun getConversations(): Flow<List<ConversationSummary>>
    fun getMessagesForConversation(convId: String): Flow<List<ChatMessage>>
    suspend fun sendMessage(convId: String, content: String): ChatMessage
    fun getNotifications(): Flow<List<AppNotification>>
    suspend fun markNotificationAsRead(id: String)
    suspend fun addNotification(notification: AppNotification)
    val isDemoDataSource: Boolean
}

/**
 * Real repository for conversations, messaging, and system notifications.
 * All fictional seeded chats and fake notifications have been removed.
 * Populated exclusively by user exchanges and real booking state changes.
 */
class RealMessageRepository : MessageRepository {
    override val isDemoDataSource: Boolean = false

    private val conversationsList = mutableListOf<ConversationSummary>()
    private val messagesMap = mutableMapOf<String, MutableList<ChatMessage>>()
    private val notificationsList = mutableListOf<AppNotification>()

    private val _conversationsFlow = MutableStateFlow<List<ConversationSummary>>(emptyList())
    private val _notificationsFlow = MutableStateFlow<List<AppNotification>>(emptyList())

    override fun getConversations(): Flow<List<ConversationSummary>> = _conversationsFlow.asStateFlow()

    override fun getMessagesForConversation(convId: String): Flow<List<ChatMessage>> {
        val messages = messagesMap[convId] ?: emptyList()
        return MutableStateFlow(messages.toList()).asStateFlow()
    }

    override suspend fun sendMessage(convId: String, content: String): ChatMessage {
        val newMsg = ChatMessage(
            id = "msg_${System.currentTimeMillis()}",
            conversationId = convId,
            senderId = "current_user",
            senderName = "You",
            content = content,
            timestamp = "Just now"
        )
        val list = messagesMap.getOrPut(convId) { mutableListOf() }
        list.add(newMsg)

        val convIndex = conversationsList.indexOfFirst { it.id == convId }
        if (convIndex >= 0) {
            val conv = conversationsList[convIndex]
            conversationsList[convIndex] = conv.copy(
                lastMessage = content,
                lastTimestamp = "Just now"
            )
            _conversationsFlow.value = conversationsList.toList()
        }

        return newMsg
    }

    override fun getNotifications(): Flow<List<AppNotification>> = _notificationsFlow.asStateFlow()

    override suspend fun markNotificationAsRead(id: String) {
        val index = notificationsList.indexOfFirst { it.id == id }
        if (index >= 0) {
            val notif = notificationsList[index]
            notificationsList[index] = notif.copy(isRead = true)
            _notificationsFlow.value = notificationsList.toList()
        }
    }

    override suspend fun addNotification(notification: AppNotification) {
        notificationsList.add(0, notification)
        _notificationsFlow.value = notificationsList.toList()
    }
}

typealias DemoMessageRepository = RealMessageRepository
