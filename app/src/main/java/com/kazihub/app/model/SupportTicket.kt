package com.kazihub.app.model

enum class SupportCategory(val titleEn: String, val titleSw: String) {
    BOOKING_ISSUE("Booking Complaint / Issue", "Malalamiko ya Kazi"),
    EQUIPMENT_DISPUTE("Equipment Rental Complaint / Damage", "Malalamiko ya Vifaa"),
    VERIFICATION_HELP("Account & National ID Verification", "Uthibitishaji wa Akaunti"),
    PAYMENT_QUESTION("Payment & Invoice Inquiry", "Malipo na Ankara"),
    SAFETY_PRIVACY("Privacy, Fraud & Safety Concern", "Faragha na Usalama"),
    GENERAL_SUPPORT("General Customer Care", "Msaada Mkuu")
}

enum class TicketStatus(val label: String) {
    OPEN("Open"),
    IN_PROGRESS("In Progress"),
    WAITING_FOR_USER("Waiting for User"),
    RESOLVED("Resolved"),
    CLOSED("Closed")
}

data class TicketMessage(
    val id: String,
    val authorId: String,
    val authorName: String,
    val isSupportStaff: Boolean,
    val content: String,
    val timestamp: String
)

data class SupportTicket(
    val id: String,
    val ticketReference: String, // e.g. "TK-2024-819"
    val userId: String,
    val userName: String,
    val userEmail: String,
    val category: SupportCategory,
    val subject: String,
    val description: String,
    val relatedBookingRef: String? = null,
    val status: TicketStatus = TicketStatus.OPEN,
    val assignedStaffName: String? = null,
    val responses: List<TicketMessage> = emptyList(),
    val createdAtFormatted: String,
    val updatedAtFormatted: String,
    val createdAtEpochMs: Long = System.currentTimeMillis()
)

data class PlatformContactSettings(
    val emailPlaceholder: String = "[Official Customer Care Email to be configured by Platform Owner]",
    val phonePlaceholder: String = "[Official Support Hotline to be configured by Platform Owner]",
    val emergencyNotice: String = "For urgent on-set disputes, open a high-priority ticket with booking reference."
)
