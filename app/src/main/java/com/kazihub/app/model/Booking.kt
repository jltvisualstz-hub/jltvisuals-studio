package com.kazihub.app.model

enum class BookingType(val label: String) {
    CREATIVE_SERVICE("Creative Talent Service"),
    EQUIPMENT_RENTAL("Cinema Equipment Rental")
}

// 8 Specific Standardized Statuses matching Section 7 of Brief
enum class BookingStatus(val labelEn: String, val labelSw: String) {
    PENDING("Pending", "Inasubiri"),
    QUOTATION_SUBMITTED("Quotation Submitted", "Nukuu Imewasilishwa"),
    CONFIRMED("Confirmed", "Imethibitishwa"),
    IN_PROGRESS("In Progress / On Set", "Kazi Inaendelea"),
    AWAITING_COMPLETION("Awaiting Delivery / Completion", "Inasubiri Kukamilika"),
    COMPLETED("Completed", "Imekamilika"),
    CANCELLED("Cancelled", "Imeghairiwa"),
    DISPUTED("Disputed", "Kwenye Mgogoro")
}

data class BookingStatusEvent(
    val status: BookingStatus,
    val timestamp: String,
    val note: String,
    val actorName: String,
    val actorId: String = ""
)

data class DisputeRecord(
    val raisedByUserId: String,
    val reason: String,
    val evidenceReferences: List<String>,
    val timestamp: String,
    val assignedStaffMember: String? = null,
    val resolutionOutcome: String? = null,
    val isResolved: Boolean = false
)

data class CancellationRecord(
    val cancelledByUserId: String,
    val reason: String,
    val timestamp: String,
    val cancellationPolicyApplied: String
)

// Complete Creative-Service Booking Request Model (Section 5)
data class CreativeServiceBookingRequest(
    val id: String,
    val clientId: String,
    val clientName: String,
    val projectTitle: String,
    val serviceCategory: CreativeCategory,
    val projectDescription: String,
    val requiredProfessionalsCount: Int,
    val crewSizeDescription: String,
    val eventStartDate: String,
    val eventEndDate: String,
    val startTime: String,
    val endTime: String,
    val country: EastAfricanCountry,
    val cityOrRegion: String,
    val preciseServiceArea: String,
    val venueOrMeetingDetails: String,
    val estimatedBudget: Long,
    val currencyCode: String,
    val expectedDeliverables: List<String>,
    val projectDurationDescription: String,
    val requiredEquipmentList: List<String>,
    val additionalRequirements: String,
    val preferredCommunicationMethod: String, // "In-App Chat", "Phone / WhatsApp", "Official Email"
    val createdAtEpochMs: Long = System.currentTimeMillis()
)

// Equipment Rental Booking Request Model (Section 6)
data class EquipmentRentalBookingRequest(
    val id: String,
    val renterId: String,
    val renterName: String,
    val equipmentListingId: String,
    val equipmentTitle: String,
    val ownerId: String,
    val ownerName: String,
    val startDate: String,
    val endDate: String,
    val rentalDurationDays: Int,
    val pickupOrDeliveryPreference: String, // "Warehouse Pickup (Westlands)", "Direct Delivery to Set"
    val shootLocation: String,
    val securityDepositAmount: Long,
    val rentalRateAmount: Long,
    val currencyCode: String,
    val rentalTermsAgreed: Boolean,
    val isOwnerConfirmed: Boolean = false,
    val preHandoverConditionReport: String = "Checked: Optics clean, sensor clean, flight case complete",
    val returnConditionReport: String? = null,
    val expectedReturnTime: String = "06:00 PM",
    val damageOrDiscrepancyNotes: String? = null,
    val createdAtEpochMs: Long = System.currentTimeMillis()
)

// Booking Completion Report Model (Section 8)
data class BookingCompletionReport(
    val id: String,
    val bookingReference: String,
    val actualStartDate: String,
    val actualCompletionDate: String,
    val descriptionOfWorkCompleted: String,
    val agreedDeliverablesSummary: String,
    val deliveryStatus: String, // "Delivered on Frame.io", "Physical SSD Handover", "Complete"
    val deliveryReferenceOrDriveLink: String,
    val finalAgreedAmount: Long,
    val currencyCode: String,
    val additionalChargesAmount: Long = 0,
    val additionalChargesExplanation: String? = null,
    val additionalChargesApprovedByClient: Boolean = false,
    val isClientConfirmed: Boolean = false,
    val isProviderConfirmed: Boolean = false,
    val equipmentHandoverAndReturnStatus: String? = null, // "All Lenses & Drives Returned Intact"
    val equipmentConditionAtReturn: String? = null,
    val missingOrDamagedItemReport: String? = null,
    val clientFeedbackRating: Float? = null,
    val clientFeedbackNotes: String? = null,
    val isDisputeFlagged: Boolean = false,
    val supportingEvidenceUrls: List<String> = emptyList(),
    val submittedAtEpochMs: Long = System.currentTimeMillis()
)

data class Quotation(
    val id: String,
    val jobRequestId: String,
    val providerId: String,
    val providerName: String,
    val lineItems: List<String>,
    val totalAmount: Long,
    val currencyCode: String,
    val notes: String,
    val validUntilDate: String,
    val isAccepted: Boolean = false,
    val isDeclined: Boolean = false
)

data class BookingRecord(
    val id: String,
    val bookingReference: String, // e.g., "KB-2024-8841"
    val bookingType: BookingType,
    val jobRequestId: String?,
    val clientId: String,
    val clientName: String,
    val providerId: String,
    val providerName: String,
    val providerRole: String,
    val title: String,
    val projectBriefAndScope: String,
    val country: EastAfricanCountry,
    val location: EastAfricaLocation,
    val eventStartDate: String,
    val eventEndDate: String,
    val startTime: String? = "08:00 AM",
    val endTime: String? = "06:00 PM",
    val agreedAmount: Long,
    val currencyCode: String,
    val depositAmount: Long = 0,
    val paymentStatusNotice: String = "Payment Gateway Integration Pending (Phase 2)",
    val status: BookingStatus,
    val statusHistory: List<BookingStatusEvent> = emptyList(),
    val isEquipmentRental: Boolean = false,
    val equipmentId: String? = null,
    val equipmentItemName: String? = null,
    val quotation: Quotation? = null,
    val dispute: DisputeRecord? = null,
    val cancellation: CancellationRecord? = null,
    val completionReport: BookingCompletionReport? = null,
    val creativeRequestDetails: CreativeServiceBookingRequest? = null,
    val equipmentRentalDetails: EquipmentRentalBookingRequest? = null,
    val createdAtFormatted: String,
    val updatedAtFormatted: String,
    val isDemonstrationRecord: Boolean = false
)
