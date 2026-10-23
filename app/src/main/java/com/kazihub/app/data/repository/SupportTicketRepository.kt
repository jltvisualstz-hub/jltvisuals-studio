package com.kazihub.app.data.repository

import com.kazihub.app.model.SupportCategory
import com.kazihub.app.model.SupportTicket
import com.kazihub.app.model.TicketMessage
import com.kazihub.app.model.TicketStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map

interface SupportTicketRepository {
    fun getUserTickets(userId: String): Flow<List<SupportTicket>>
    fun getAllTickets(): Flow<List<SupportTicket>>
    fun getTicketById(ticketId: String): Flow<SupportTicket?>
    suspend fun createTicket(
        userId: String,
        userName: String,
        userEmail: String,
        category: SupportCategory,
        subject: String,
        description: String,
        relatedBookingRef: String?
    ): SupportTicket
    suspend fun addTicketResponse(
        ticketId: String,
        authorId: String,
        authorName: String,
        isStaff: Boolean,
        message: String
    )
    suspend fun updateTicketStatus(ticketId: String, status: TicketStatus)
    val isDemoDataSource: Boolean
}

/**
 * Real repository for customer support and dispute resolution tickets.
 * All fictional seeded support tickets and fake staff logs have been removed.
 * Tickets are created exclusively by users through Customer Care.
 */
class RealSupportTicketRepository : SupportTicketRepository {
    override val isDemoDataSource: Boolean = false

    private val ticketsList = mutableListOf<SupportTicket>()
    private val _ticketsFlow = MutableStateFlow<List<SupportTicket>>(emptyList())

    override fun getUserTickets(userId: String): Flow<List<SupportTicket>> {
        return _ticketsFlow.map { list ->
            list.filter { it.userId == userId }
        }
    }

    override fun getAllTickets(): Flow<List<SupportTicket>> = _ticketsFlow.asStateFlow()

    override fun getTicketById(ticketId: String): Flow<SupportTicket?> {
        return _ticketsFlow.map { list -> list.find { it.id == ticketId || it.ticketReference == ticketId } }
    }

    override suspend fun createTicket(
        userId: String,
        userName: String,
        userEmail: String,
        category: SupportCategory,
        subject: String,
        description: String,
        relatedBookingRef: String?
    ): SupportTicket {
        val newRef = "TK-${(2024..2025).random()}-${(100..999).random()}"
        val ticket = SupportTicket(
            id = "tkt_${System.currentTimeMillis()}",
            ticketReference = newRef,
            userId = userId,
            userName = userName,
            userEmail = userEmail,
            category = category,
            subject = subject,
            description = description,
            relatedBookingRef = relatedBookingRef,
            status = TicketStatus.OPEN,
            assignedStaffName = "Unassigned (Queued)",
            responses = listOf(
                TicketMessage(
                    id = "msg_${System.currentTimeMillis()}",
                    authorId = userId,
                    authorName = userName,
                    isSupportStaff = false,
                    content = description,
                    timestamp = "Just now"
                )
            ),
            createdAtFormatted = "Just now",
            updatedAtFormatted = "Just now"
        )
        ticketsList.add(0, ticket)
        _ticketsFlow.value = ticketsList.toList()
        return ticket
    }

    override suspend fun addTicketResponse(
        ticketId: String,
        authorId: String,
        authorName: String,
        isStaff: Boolean,
        message: String
    ) {
        val index = ticketsList.indexOfFirst { it.id == ticketId }
        if (index >= 0) {
            val ticket = ticketsList[index]
            val newMsg = TicketMessage(
                id = "tm_${System.currentTimeMillis()}",
                authorId = authorId,
                authorName = authorName,
                isSupportStaff = isStaff,
                content = message,
                timestamp = "Just now"
            )
            ticketsList[index] = ticket.copy(
                responses = ticket.responses + newMsg,
                updatedAtFormatted = "Just now",
                status = if (isStaff) TicketStatus.WAITING_ON_USER else TicketStatus.IN_PROGRESS
            )
            _ticketsFlow.value = ticketsList.toList()
        }
    }

    override suspend fun updateTicketStatus(ticketId: String, status: TicketStatus) {
        val index = ticketsList.indexOfFirst { it.id == ticketId }
        if (index >= 0) {
            val ticket = ticketsList[index]
            ticketsList[index] = ticket.copy(
                status = status,
                updatedAtFormatted = "Just now"
            )
            _ticketsFlow.value = ticketsList.toList()
        }
    }
}

typealias DemoSupportTicketRepository = RealSupportTicketRepository
