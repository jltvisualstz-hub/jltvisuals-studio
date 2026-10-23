package com.kazihub.app.model

enum class ModerationActionType {
    VERIFY_CREATIVE,
    REJECT_CREATIVE,
    APPROVE_EQUIPMENT_LISTING,
    REJECT_EQUIPMENT_LISTING,
    SUSPEND_USER,
    REACTIVATE_USER,
    RESOLVE_DISPUTE,
    SYSTEM_SETTINGS_UPDATE,
    AUDIT_INSPECTION
}

data class AdminAuditRecord(
    val id: String,
    val adminUserId: String,
    val adminUserName: String,
    val actionType: ModerationActionType,
    val targetEntityId: String,
    val targetEntityType: String,
    val reasonOrNotes: String,
    val outcome: String, // e.g. "SUCCESS", "REJECTED"
    val timestampFormatted: String,
    val timestampEpochMs: Long = System.currentTimeMillis()
)

data class FreelancerVerificationItem(
    val creativeId: String,
    val fullName: String,
    val email: String,
    val country: EastAfricanCountry,
    val category: CreativeCategory,
    val submittedDocType: String, // "National Identification Card", "Passport"
    val submittedDocReference: String,
    val portfolioLinksCount: Int,
    val submittedDate: String,
    val isVerified: Boolean = false,
    val isPending: Boolean = true,
    val rejectionReason: String? = null
)

data class EquipmentVerificationItem(
    val equipmentId: String,
    val title: String,
    val brandModel: String,
    val ownerName: String,
    val serialNumber: String,
    val proofOfOwnershipDoc: String, // "Invoice / Customs Clearance Declaration"
    val submittedDate: String,
    val isApproved: Boolean = false,
    val isPending: Boolean = true
)

data class AdminOverviewStats(
    val totalRegisteredUsers: Int = 0,
    val pendingVerifications: Int = 0,
    val activeBookings: Int = 0,
    val completedBookings: Int = 0,
    val equipmentListingsCount: Int = 0,
    val openSupportTickets: Int = 0,
    val reportedDisputes: Int = 0,
    val isDemonstrationData: Boolean = false
)
