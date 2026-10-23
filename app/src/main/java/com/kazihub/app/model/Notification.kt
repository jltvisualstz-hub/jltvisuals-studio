package com.kazihub.app.model

enum class NotificationType {
    BOOKING_REQUEST,
    QUOTE_RECEIVED,
    BOOKING_CONFIRMED,
    GEAR_RETURN_REMINDER,
    PAYMENT_ESCROW,
    SYSTEM_ALERT
}

data class AppNotification(
    val id: String,
    val title: String,
    val body: String,
    val timestamp: String,
    val type: NotificationType,
    val isRead: Boolean = false,
    val deepLinkDestination: String? = null
)

enum class ModerationActionType {
    VERIFY_CREATIVE,
    APPROVE_EQUIPMENT_LISTING,
    REVIEW_DISPUTE,
    SUSPEND_ACCOUNT,
    SYSTEM_AUDIT
}

data class AdminAuditRecord(
    val id: String,
    val adminUserId: String,
    val actionType: ModerationActionType,
    val targetEntityId: String,
    val targetEntityType: String,
    val reasonOrNotes: String,
    val ipAddressOrOrigin: String,
    val timestampEpochMs: Long = System.currentTimeMillis()
)
