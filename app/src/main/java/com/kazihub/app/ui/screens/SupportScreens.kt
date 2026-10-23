package com.kazihub.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kazihub.app.model.*
import com.kazihub.app.theme.*
import com.kazihub.app.ui.components.*
import com.kazihub.app.ui.viewmodel.KaziHubViewModel

@Composable
fun CustomerCareScreen(
    viewModel: KaziHubViewModel,
    onNavigateNewTicket: () -> Unit,
    onSelectTicket: (SupportTicket) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val userTickets by viewModel.userTickets.collectAsState()

    var selectedFaqIndex by remember { mutableStateOf<Int?>(null) }

    val faqs = remember {
        listOf(
            "How does quotation and booking work?" to "Clients post production briefs or request quotes directly from verified creatives. Service providers submit detailed line-item quotes. Once accepted by the client, the project schedule and equipment holds are locked in.",
            "What are the cinema gear rental terms and deposit policies?" to "Equipment listings clearly specify required security deposits, dry hire conditions (or certified technician requirement), and transit insurance coverage. On-set condition inspections are documented before release.",
            "How do cross-border shoots work in East Africa?" to "KAZI HUB creatives in Tanzania, Kenya, Uganda, and Rwanda specify their travel readiness. Currency figures are shown in their native local currency (TZS, KES, UGX, RWF).",
            "How are disputes and cancellations resolved?" to "Users can raise a formal dispute through the Booking Center or Customer Care. Platform administrators intervene, review logged status histories and condition photos, and mediate according to agreed contract terms."
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(androidx.compose.foundation.rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Column {
            Text(
                text = if (uiState.isSwahili) "Huduma kwa Wateja na Msaada" else "Customer Care & Help Center",
                color = KaziTextPrimary,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = if (uiState.isSwahili) "Msaada wa uzalishaji, masuala ya vifaa na tiketi za dharura" else "Creative production support, gear resolution & official assistance",
                color = KaziTextSecondary,
                fontSize = 12.sp
            )
        }

        // Contact Placeholder Card
        KaziCard {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.SupportAgent, contentDescription = null, tint = KaziGold, modifier = Modifier.size(28.dp))
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text("Official Customer Care Contacts", color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Text("Centrally Managed Platform Settings", color = KaziBronze, fontSize = 11.sp)
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            Surface(
                color = KaziBackgroundSecondary,
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("• Email: [Official Customer Care Email to be configured by Platform Owner]", color = KaziTextSecondary, fontSize = 11.sp)
                    Text("• Hotline: [Official Support Phone / WhatsApp to be configured by Platform Owner]", color = KaziTextSecondary, fontSize = 11.sp)
                    Text("• Operational Territory: Tanzania, Kenya, Uganda, Rwanda", color = KaziTextSecondary, fontSize = 11.sp)
                }
            }
        }

        // Quick Ticket Action
        GoldButton(
            text = "Submit a New Support Ticket",
            onClick = onNavigateNewTicket,
            modifier = Modifier.fillMaxWidth(),
            leadingIcon = Icons.Default.ConfirmationNumber
        )

        // My Tickets Section
        KaziCard {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "My Submitted Tickets (${userTickets.size})",
                    color = KaziGold,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.height(10.dp))

            if (userTickets.isEmpty()) {
                Text(
                    text = "You have no active support tickets.",
                    color = KaziTextSecondary,
                    fontSize = 12.sp
                )
            } else {
                userTickets.forEach { ticket ->
                    Surface(
                        color = KaziBackgroundSecondary,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clickable { onSelectTicket(ticket) }
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(ticket.ticketReference, color = KaziGold, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                Surface(
                                    color = when (ticket.status) {
                                        TicketStatus.OPEN -> KaziGold.copy(alpha = 0.2f)
                                        TicketStatus.IN_PROGRESS -> KaziBlue.copy(alpha = 0.2f)
                                        TicketStatus.RESOLVED -> KaziGreen.copy(alpha = 0.2f)
                                        else -> KaziCardElevated
                                    },
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = ticket.status.label,
                                        color = KaziTextPrimary,
                                        fontSize = 10.sp,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(ticket.subject, color = KaziTextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                            Text("Category: ${ticket.category.titleEn} • ${ticket.createdAtFormatted}", color = KaziTextSecondary, fontSize = 10.sp)
                        }
                    }
                }
            }
        }

        // FAQs Section
        KaziCard {
            Text(text = "Frequently Asked Questions", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(10.dp))
            faqs.forEachIndexed { index, (question, answer) ->
                val isExpanded = selectedFaqIndex == index
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(KaziBackgroundSecondary)
                        .clickable { selectedFaqIndex = if (isExpanded) null else index }
                        .padding(10.dp)
                ) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(question, color = KaziTextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        Text(if (isExpanded) "−" else "+", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }
                    if (isExpanded) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(answer, color = KaziTextSecondary, fontSize = 11.sp, lineHeight = 16.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun SubmitSupportTicketScreen(
    viewModel: KaziHubViewModel,
    onSubmitted: () -> Unit,
    onBack: () -> Unit
) {
    var category by remember { mutableStateOf(SupportCategory.BOOKING_ISSUE) }
    var subject by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var relatedBookingRef by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(androidx.compose.foundation.rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = KaziGold)
            }
            Text("Submit Support Ticket", color = KaziTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }

        Text(
            text = "Please provide details regarding your inquiry, complaint, or dispute. Private support threads are never shown to unrelated users.",
            color = KaziTextSecondary,
            fontSize = 12.sp
        )

        // Category Picker
        Column {
            Text("Issue Category", color = KaziGold, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            SupportCategory.values().forEach { cat ->
                val isSelected = category == cat
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (isSelected) KaziCardElevated else KaziCard)
                        .border(1.dp, if (isSelected) KaziGold else KaziBorder, RoundedCornerShape(6.dp))
                        .clickable { category = cat }
                        .padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = isSelected,
                        onClick = { category = cat },
                        colors = RadioButtonDefaults.colors(selectedColor = KaziGold)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(cat.titleEn, color = KaziTextPrimary, fontSize = 12.sp)
                }
            }
        }

        OutlinedTextField(
            value = subject,
            onValueChange = { subject = it },
            label = { Text("Subject / Brief Summary *") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = relatedBookingRef,
            onValueChange = { relatedBookingRef = it },
            label = { Text("Related Booking Reference (Optional)") },
            placeholder = { Text("e.g. KB-2024-8841") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Detailed Explanation *") },
            minLines = 4,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        errorMessage?.let {
            Text(it, color = KaziRed, fontSize = 11.sp)
        }

        GoldButton(
            text = "Submit Ticket",
            onClick = {
                if (subject.isBlank() || description.isBlank()) {
                    errorMessage = "Please enter both a subject and detailed explanation."
                } else {
                    viewModel.createSupportTicket(category, subject, description, relatedBookingRef)
                    onSubmitted()
                }
            },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
fun SupportTicketDetailScreen(
    viewModel: KaziHubViewModel,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val ticket = uiState.selectedTicket ?: return
    var replyText by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = KaziGold)
            }
            Text(ticket.ticketReference, color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Surface(color = KaziCardElevated, shape = RoundedCornerShape(4.dp)) {
                Text(ticket.status.label, color = KaziTextPrimary, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Initial ticket description
        KaziCard {
            Text(ticket.subject, color = KaziTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Text("Category: ${ticket.category.titleEn} • ${ticket.createdAtFormatted}", color = KaziTextSecondary, fontSize = 11.sp)
            ticket.relatedBookingRef?.let {
                Text("Related Booking: $it", color = KaziBronze, fontSize = 11.sp)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(ticket.description, color = KaziTextPrimary, fontSize = 12.sp, lineHeight = 18.sp)
        }

        Spacer(modifier = Modifier.height(12.dp))
        Text("Conversation & Support Responses", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(8.dp))

        // Responses Thread
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(ticket.responses) { msg ->
                Surface(
                    color = if (msg.isSupportStaff) KaziCardElevated else KaziBackgroundSecondary,
                    shape = RoundedCornerShape(8.dp),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(if (msg.isSupportStaff) KaziBorderGold else KaziBorder)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(msg.authorName, color = if (msg.isSupportStaff) KaziGold else KaziTextPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            Text(msg.timestamp, color = KaziTextSecondary, fontSize = 10.sp)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(msg.content, color = KaziTextPrimary, fontSize = 12.sp)
                    }
                }
            }
        }

        // Reply input
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 8.dp)) {
            OutlinedTextField(
                value = replyText,
                onValueChange = { replyText = it },
                placeholder = { Text("Reply to support...") },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = KaziGold,
                    unfocusedBorderColor = KaziBorder,
                    focusedTextColor = KaziTextPrimary,
                    unfocusedTextColor = KaziTextPrimary
                ),
                modifier = Modifier.weight(1f)
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = {
                    if (replyText.isNotBlank()) {
                        viewModel.replyToTicket(ticket.id, replyText)
                        replyText = ""
                    }
                }
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = KaziGold)
            }
        }
    }
}
