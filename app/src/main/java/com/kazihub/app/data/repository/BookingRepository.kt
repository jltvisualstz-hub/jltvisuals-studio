package com.kazihub.app.data.repository

import com.kazihub.app.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map

interface BookingRepository {
    fun getAllBookings(): Flow<List<BookingRecord>>
    fun getBookingsForUser(userId: String): Flow<List<BookingRecord>>
    fun getBookingById(bookingId: String): Flow<BookingRecord?>
    fun getActiveJobRequests(): Flow<List<JobRequest>>

    suspend fun createJobRequest(request: JobRequest): JobRequest
    suspend fun createCreativeBookingRequest(request: CreativeServiceBookingRequest): BookingRecord
    suspend fun createEquipmentRentalBookingRequest(request: EquipmentRentalBookingRequest): Result<BookingRecord>

    suspend fun submitQuotation(bookingId: String, quote: Quotation)
    suspend fun acceptQuotation(bookingId: String, clientId: String)
    suspend fun declineQuotation(bookingId: String, clientId: String, reason: String)
    suspend fun requestQuotationRevisions(bookingId: String, clientId: String, revisionNotes: String)
    suspend fun confirmHandoverAndDispatch(bookingId: String, actorName: String, checklistNotes: String)
    suspend fun markWorkDelivered(bookingId: String, actorName: String, deliveryRef: String)
    suspend fun updateBookingStatus(bookingId: String, newStatus: BookingStatus, note: String, actorName: String, actorId: String = "")
    suspend fun submitCompletionReport(bookingId: String, report: BookingCompletionReport): Result<Unit>
    suspend fun raiseDispute(bookingId: String, raisedByUserId: String, reason: String)
    suspend fun raiseDisputeWithEvidence(bookingId: String, raisedByUserId: String, reason: String, evidenceList: List<String>)
    suspend fun checkEquipmentAvailability(equipmentId: String, startDate: String, endDate: String): Boolean

    val isDemoDataSource: Boolean
}

class DemoBookingRepository : BookingRepository {
    override val isDemoDataSource: Boolean = false

    private val demoBookings = mutableListOf<BookingRecord>()
    private val demoJobRequests = mutableListOf<JobRequest>()
    private val _bookingsFlow = MutableStateFlow<List<BookingRecord>>(emptyList())


    override fun getAllBookings(): Flow<List<BookingRecord>> = _bookingsFlow.asStateFlow()

    override fun getBookingsForUser(userId: String): Flow<List<BookingRecord>> {
        return _bookingsFlow.map { list ->
            list.filter { it.clientId == userId || it.providerId == userId }
        }
    }

    override fun getBookingById(bookingId: String): Flow<BookingRecord?> {
        return _bookingsFlow.map { list -> list.find { it.id == bookingId || it.bookingReference == bookingId } }
    }

    override fun getActiveJobRequests(): Flow<List<JobRequest>> = MutableStateFlow(demoJobRequests.toList()).asStateFlow()

    override suspend fun createJobRequest(request: JobRequest): JobRequest {
        demoJobRequests.add(0, request)
        return request
    }

    override suspend fun createCreativeBookingRequest(request: CreativeServiceBookingRequest): BookingRecord {
        val newRef = "KB-${(2024..2025).random()}-${(1000..9999).random()}"
        val record = BookingRecord(
            id = "bk_${System.currentTimeMillis()}",
            bookingReference = newRef,
            bookingType = BookingType.CREATIVE_SERVICE,
            jobRequestId = request.id,
            clientId = request.clientId,
            clientName = request.clientName,
            providerId = "pending_provider",
            providerName = "Talent Dispatch",
            providerRole = request.serviceCategory.label,
            title = request.projectTitle,
            projectBriefAndScope = request.projectDescription,
            country = request.country,
            location = EastAfricaLocation(
                id = "loc_brief",
                country = request.country,
                primaryDivision = request.cityOrRegion,
                secondaryDivision = request.preciseServiceArea,
                neighbourhoodOrArea = request.venueOrMeetingDetails
            ),
            eventStartDate = request.eventStartDate,
            eventEndDate = request.eventEndDate,
            startTime = request.startTime,
            endTime = request.endTime,
            agreedAmount = request.estimatedBudget,
            currencyCode = request.currencyCode,
            status = BookingStatus.PENDING,
            creativeRequestDetails = request,
            statusHistory = listOf(
                BookingStatusEvent(BookingStatus.PENDING, "Just now", "Production brief submitted", request.clientName, request.clientId)
            ),
            createdAtFormatted = "Just now",
            updatedAtFormatted = "Just now"
        )
        demoBookings.add(0, record)
        _bookingsFlow.value = demoBookings.toList()
        return record
    }

    override suspend fun createEquipmentRentalBookingRequest(request: EquipmentRentalBookingRequest): Result<BookingRecord> {
        // Concurrency check preventing overlapping confirmed bookings
        val isAvailable = checkEquipmentAvailability(request.equipmentListingId, request.startDate, request.endDate)
        if (!isAvailable) {
            return Result.failure(IllegalStateException("Selected equipment is already reserved for an overlapping period ($request.startDate to $request.endDate)."))
        }

        val newRef = "KB-EQ-${(1000..9999).random()}"
        val record = BookingRecord(
            id = "bk_eq_${System.currentTimeMillis()}",
            bookingReference = newRef,
            bookingType = BookingType.EQUIPMENT_RENTAL,
            jobRequestId = null,
            clientId = request.renterId,
            clientName = request.renterName,
            providerId = request.ownerId,
            providerName = request.ownerName,
            providerRole = "Equipment Owner",
            title = request.equipmentTitle,
            projectBriefAndScope = "Rental Package: ${request.rentalDurationDays} Days. Handover: ${request.pickupOrDeliveryPreference}. Location: ${request.shootLocation}",
            country = EastAfricanCountry.KENYA,
            location = EastAfricaLocation("loc_rent", EastAfricanCountry.KENYA, "Nairobi County", "Westlands", request.shootLocation),
            eventStartDate = request.startDate,
            eventEndDate = request.endDate,
            agreedAmount = request.rentalRateAmount,
            currencyCode = request.currencyCode,
            depositAmount = request.securityDepositAmount,
            isEquipmentRental = true,
            equipmentId = request.equipmentListingId,
            equipmentItemName = request.equipmentTitle,
            equipmentRentalDetails = request,
            status = BookingStatus.PENDING,
            statusHistory = listOf(
                BookingStatusEvent(BookingStatus.PENDING, "Just now", "Rental request submitted to owner", request.renterName, request.renterId)
            ),
            createdAtFormatted = "Just now",
            updatedAtFormatted = "Just now"
        )
        demoBookings.add(0, record)
        _bookingsFlow.value = demoBookings.toList()
        return Result.success(record)
    }

    override suspend fun submitQuotation(bookingId: String, quote: Quotation) {
        val idx = demoBookings.indexOfFirst { it.id == bookingId }
        if (idx != -1) {
            val current = demoBookings[idx]
            val newEvent = BookingStatusEvent(BookingStatus.QUOTATION_SUBMITTED, "Just now", "Quotation submitted (${quote.currencyCode} ${quote.totalAmount})", quote.providerName)
            demoBookings[idx] = current.copy(
                quotation = quote,
                agreedAmount = quote.totalAmount,
                currencyCode = quote.currencyCode,
                status = BookingStatus.QUOTATION_SUBMITTED,
                statusHistory = current.statusHistory + newEvent,
                updatedAtFormatted = "Just now"
            )
            _bookingsFlow.value = demoBookings.toList()
        }
    }

    override suspend fun acceptQuotation(bookingId: String, clientId: String) {
        val idx = demoBookings.indexOfFirst { it.id == bookingId }
        if (idx != -1) {
            val current = demoBookings[idx]
            val newEvent = BookingStatusEvent(BookingStatus.CONFIRMED, "Just now", "Quotation accepted by client", current.clientName, clientId)
            demoBookings[idx] = current.copy(
                status = BookingStatus.CONFIRMED,
                statusHistory = current.statusHistory + newEvent,
                quotation = current.quotation?.copy(isAccepted = true),
                updatedAtFormatted = "Just now"
            )
            _bookingsFlow.value = demoBookings.toList()
        }
    }

    override suspend fun declineQuotation(bookingId: String, clientId: String, reason: String) {
        val idx = demoBookings.indexOfFirst { it.id == bookingId }
        if (idx != -1) {
            val current = demoBookings[idx]
            val newEvent = BookingStatusEvent(BookingStatus.CANCELLED, "Just now", "Quotation declined: $reason", current.clientName, clientId)
            demoBookings[idx] = current.copy(
                status = BookingStatus.CANCELLED,
                statusHistory = current.statusHistory + newEvent,
                quotation = current.quotation?.copy(isDeclined = true),
                updatedAtFormatted = "Just now"
            )
            _bookingsFlow.value = demoBookings.toList()
        }
    }

    override suspend fun requestQuotationRevisions(bookingId: String, clientId: String, revisionNotes: String) {
        val idx = demoBookings.indexOfFirst { it.id == bookingId }
        if (idx != -1) {
            val current = demoBookings[idx]
            val newEvent = BookingStatusEvent(
                BookingStatus.PENDING,
                "Just now",
                "Revisions requested by client: $revisionNotes",
                current.clientName,
                clientId
            )
            demoBookings[idx] = current.copy(
                status = BookingStatus.PENDING,
                statusHistory = current.statusHistory + newEvent,
                updatedAtFormatted = "Just now"
            )
            _bookingsFlow.value = demoBookings.toList()
        }
    }

    override suspend fun confirmHandoverAndDispatch(bookingId: String, actorName: String, checklistNotes: String) {
        val idx = demoBookings.indexOfFirst { it.id == bookingId }
        if (idx != -1) {
            val current = demoBookings[idx]
            val newEvent = BookingStatusEvent(
                BookingStatus.IN_PROGRESS,
                "Just now",
                "Check-in & dispatch confirmed: $checklistNotes",
                actorName
            )
            demoBookings[idx] = current.copy(
                status = BookingStatus.IN_PROGRESS,
                statusHistory = current.statusHistory + newEvent,
                updatedAtFormatted = "Just now"
            )
            _bookingsFlow.value = demoBookings.toList()
        }
    }

    override suspend fun markWorkDelivered(bookingId: String, actorName: String, deliveryRef: String) {
        val idx = demoBookings.indexOfFirst { it.id == bookingId }
        if (idx != -1) {
            val current = demoBookings[idx]
            val newEvent = BookingStatusEvent(
                BookingStatus.AWAITING_COMPLETION,
                "Just now",
                "Work delivered / Gear returned: $deliveryRef",
                actorName
            )
            demoBookings[idx] = current.copy(
                status = BookingStatus.AWAITING_COMPLETION,
                statusHistory = current.statusHistory + newEvent,
                updatedAtFormatted = "Just now"
            )
            _bookingsFlow.value = demoBookings.toList()
        }
    }

    override suspend fun raiseDisputeWithEvidence(
        bookingId: String,
        raisedByUserId: String,
        reason: String,
        evidenceList: List<String>
    ) {
        val idx = demoBookings.indexOfFirst { it.id == bookingId }
        if (idx != -1) {
            val current = demoBookings[idx]
            val dispute = DisputeRecord(
                raisedByUserId = raisedByUserId,
                reason = reason,
                evidenceReferences = evidenceList.ifEmpty { listOf("In-app transaction notes") },
                timestamp = "Just now",
                assignedStaffMember = "Official KAZI Dispute Mediation Team"
            )
            val newEvent = BookingStatusEvent(
                BookingStatus.DISPUTED,
                "Just now",
                "Formal dispute filed for administrative mediation: $reason",
                "User: $raisedByUserId",
                raisedByUserId
            )
            demoBookings[idx] = current.copy(
                status = BookingStatus.DISPUTED,
                dispute = dispute,
                statusHistory = current.statusHistory + newEvent,
                updatedAtFormatted = "Just now"
            )
            _bookingsFlow.value = demoBookings.toList()
        }
    }

    override suspend fun updateBookingStatus(
        bookingId: String,
        newStatus: BookingStatus,
        note: String,
        actorName: String,
        actorId: String
    ) {
        val idx = demoBookings.indexOfFirst { it.id == bookingId }
        if (idx != -1) {
            val current = demoBookings[idx]
            val newEvent = BookingStatusEvent(newStatus, "Just now", note, actorName, actorId)
            demoBookings[idx] = current.copy(
                status = newStatus,
                statusHistory = current.statusHistory + newEvent,
                updatedAtFormatted = "Just now"
            )
            _bookingsFlow.value = demoBookings.toList()
        }
    }

    override suspend fun submitCompletionReport(bookingId: String, report: BookingCompletionReport): Result<Unit> {
        val idx = demoBookings.indexOfFirst { it.id == bookingId }
        if (idx != -1) {
            val current = demoBookings[idx]
            val nextStatus = if (report.isDisputeFlagged) BookingStatus.DISPUTED else BookingStatus.COMPLETED
            val note = if (report.isDisputeFlagged) "Completion report submitted with dispute flag" else "Completion report submitted and verified"
            val newEvent = BookingStatusEvent(nextStatus, "Just now", note, "Authorized Signee")
            demoBookings[idx] = current.copy(
                status = nextStatus,
                completionReport = report,
                statusHistory = current.statusHistory + newEvent,
                updatedAtFormatted = "Just now"
            )
            _bookingsFlow.value = demoBookings.toList()
            return Result.success(Unit)
        }
        return Result.failure(IllegalArgumentException("Booking reference not found."))
    }

    override suspend fun raiseDispute(bookingId: String, raisedByUserId: String, reason: String) {
        val idx = demoBookings.indexOfFirst { it.id == bookingId }
        if (idx != -1) {
            val current = demoBookings[idx]
            val dispute = DisputeRecord(
                raisedByUserId = raisedByUserId,
                reason = reason,
                evidenceReferences = listOf("In-app condition notes", "Conversation thread"),
                timestamp = "Just now"
            )
            val newEvent = BookingStatusEvent(BookingStatus.DISPUTED, "Just now", "Dispute raised: $reason", "User: $raisedByUserId", raisedByUserId)
            demoBookings[idx] = current.copy(
                status = BookingStatus.DISPUTED,
                dispute = dispute,
                statusHistory = current.statusHistory + newEvent,
                updatedAtFormatted = "Just now"
            )
            _bookingsFlow.value = demoBookings.toList()
        }
    }

    override suspend fun checkEquipmentAvailability(
        equipmentId: String,
        startDate: String,
        endDate: String
    ): Boolean {
        val activeGearBookings = demoBookings.filter {
            it.isEquipmentRental &&
            it.equipmentId == equipmentId &&
            (it.status == BookingStatus.CONFIRMED || it.status == BookingStatus.IN_PROGRESS)
        }
        for (b in activeGearBookings) {
            val hasOverlap = !(endDate < b.eventStartDate || startDate > b.eventEndDate)
            if (hasOverlap) return false
        }
        return true
    }
}
