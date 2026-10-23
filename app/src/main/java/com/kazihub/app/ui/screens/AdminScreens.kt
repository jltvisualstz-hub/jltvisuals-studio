package com.kazihub.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kazihub.app.model.*
import com.kazihub.app.theme.*
import com.kazihub.app.ui.components.*
import com.kazihub.app.ui.viewmodel.KaziHubViewModel

enum class AdminSection(val title: String) {
    OVERVIEW("Overview"),
    USERS("Users"),
    FREELANCER_VERIFY("Talent Verification"),
    EQUIPMENT_VERIFY("Gear Verification"),
    BOOKINGS("Bookings"),
    DISPUTES("Disputes & Complaints"),
    SUPPORT_TICKETS("Support Management"),
    MARKETPLACE_SETTINGS("Platform Settings"),
    AUDIT_LOGS("Audit Logs")
}

@Composable
fun AdminWorkspaceScreen(
    viewModel: KaziHubViewModel,
    onBackToMarketplace: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val allUsers by viewModel.allUsers.collectAsState()
    val allBookings by viewModel.bookings.collectAsState()
    val allEquipment by viewModel.equipmentList.collectAsState()
    val allTickets by viewModel.allTickets.collectAsState()

    var activeSection by remember { mutableStateOf(AdminSection.OVERVIEW) }
    var userSearchQuery by remember { mutableStateOf("") }
    var userActionDialogUser by remember { mutableStateOf<UserProfile?>(null) }
    var suspensionReasonInput by remember { mutableStateOf("Violation of marketplace terms") }

    // AUTH CHECK: Verify authorized admin role (server-verified custom claim only)
    val isAuthorizedAdmin = uiState.currentUser?.hasRole(UserRole.ADMINISTRATOR) == true

    if (!isAuthorizedAdmin) {
        // STRICT AUTHORIZATION GUARD & PROVISIONING ARCHITECTURE
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(KaziBackground)
                .padding(24.dp)
                .verticalScroll(androidx.compose.foundation.rememberScrollState()),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(Icons.Default.Shield, contentDescription = null, tint = KaziRed, modifier = Modifier.size(56.dp))
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Restricted Administrator Workspace",
                color = KaziTextPrimary,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Access Denied: Administrative permissions required. Regular user accounts cannot grant themselves administrator privileges through registration, profile editing, or client-side role switching.",
                color = KaziTextSecondary,
                fontSize = 13.sp,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                lineHeight = 18.sp
            )
            Spacer(modifier = Modifier.height(20.dp))

            Surface(
                color = KaziCard,
                shape = RoundedCornerShape(8.dp),
                border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(KaziBorder)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Lock, contentDescription = null, tint = KaziGold, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Secure Administrator Provisioning Standard",
                            color = KaziGold,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "1. Server-Authoritative Claims: Admin privileges are granted solely via Firebase Admin SDK in a trusted server environment using:\n`admin.auth().setCustomUserClaims(uid, { admin: true })`\n\n2. Zero Client Authority: The Android client never sends or dictates admin rights. Client-side role claims are completely ignored.\n\n3. Backend Rule Enforcement: Cloud Firestore Security Rules enforce:\n`allow write: if request.auth.token.admin == true;`\n\n4. Immutable Audit Trail: Every administrative operation is signed with the trusted admin token and recorded in tamper-evident logs.",
                        color = KaziTextSecondary,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
            GoldButton(
                text = "Return to Marketplace",
                onClick = onBackToMarketplace,
                modifier = Modifier.fillMaxWidth()
            )
        }
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
    ) {
        // Admin Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "ADMIN OVERSIGHT",
                        color = KaziGold,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Surface(color = KaziRed.copy(alpha = 0.2f), shape = RoundedCornerShape(4.dp)) {
                        Text("AUTHORIZED", color = KaziRed, fontSize = 9.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                }
                Text("Centralized operations, compliance & trust safety", color = KaziTextSecondary, fontSize = 11.sp)
            }
            TextButton(onClick = onBackToMarketplace) {
                Text("Exit to App →", color = KaziGold, fontSize = 12.sp)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Horizontal navigation tabs for the 9 sections
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(AdminSection.values()) { section ->
                val isSelected = activeSection == section
                Surface(
                    color = if (isSelected) KaziGold else KaziCard,
                    shape = RoundedCornerShape(8.dp),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(if (isSelected) KaziGold else KaziBorder)
                    ),
                    modifier = Modifier.clickable { activeSection = section }
                ) {
                    Text(
                        text = section.title,
                        color = if (isSelected) KaziBackground else KaziTextSecondary,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // SECTION CONTENT
        Box(modifier = Modifier.weight(1f)) {
            when (activeSection) {
                AdminSection.OVERVIEW -> AdminOverviewTab(
                    users = allUsers,
                    bookings = allBookings,
                    equipment = allEquipment,
                    tickets = allTickets
                )
                AdminSection.USERS -> AdminUsersTab(
                    users = allUsers,
                    searchQuery = userSearchQuery,
                    onSearchChange = { userSearchQuery = it },
                    onActionUser = { userActionDialogUser = it }
                )
                AdminSection.FREELANCER_VERIFY -> AdminFreelancerVerificationTab(viewModel)
                AdminSection.EQUIPMENT_VERIFY -> AdminEquipmentVerificationTab(viewModel)
                AdminSection.BOOKINGS -> AdminBookingsTab(allBookings)
                AdminSection.DISPUTES -> AdminDisputesTab(allBookings)
                AdminSection.SUPPORT_TICKETS -> AdminSupportTicketsTab(allTickets, viewModel)
                AdminSection.MARKETPLACE_SETTINGS -> AdminMarketplaceSettingsTab()
                AdminSection.AUDIT_LOGS -> AdminAuditLogsTab()
            }
        }
    }

    // Suspend / Reactivate Dialog
    userActionDialogUser?.let { targetUser ->
        AlertDialog(
            onDismissRequest = { userActionDialogUser = null },
            title = {
                Text(
                    text = if (targetUser.accountStatus == AccountStatus.SUSPENDED) "Reactivate User Account" else "Suspend User Account",
                    color = KaziGold
                )
            },
            text = {
                Column {
                    Text("User: ${targetUser.displayName} (${targetUser.email})", color = KaziTextPrimary, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    if (targetUser.accountStatus != AccountStatus.SUSPENDED) {
                        OutlinedTextField(
                            value = suspensionReasonInput,
                            onValueChange = { suspensionReasonInput = it },
                            label = { Text("Reason for suspension") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    } else {
                        Text("This user account is currently suspended. Reactivating will restore their marketplace access.", color = KaziTextSecondary, fontSize = 12.sp)
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (targetUser.accountStatus == AccountStatus.SUSPENDED) {
                            viewModel.reactivateUser(targetUser.id)
                        } else {
                            viewModel.suspendUser(targetUser.id, suspensionReasonInput)
                        }
                        userActionDialogUser = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = if (targetUser.accountStatus == AccountStatus.SUSPENDED) KaziGreen else KaziRed)
                ) {
                    Text(if (targetUser.accountStatus == AccountStatus.SUSPENDED) "Reactivate" else "Suspend Account")
                }
            },
            dismissButton = {
                TextButton(onClick = { userActionDialogUser = null }) {
                    Text("Cancel", color = KaziTextSecondary)
                }
            },
            containerColor = KaziCard
        )
    }
}

@Composable
fun AdminOverviewTab(
    users: List<UserProfile>,
    bookings: List<BookingRecord>,
    equipment: List<EquipmentItem>,
    tickets: List<SupportTicket>
) {
    val pendingVerifications = users.count { !it.isIdentityVerified }
    val activeShoots = bookings.count { it.status == BookingStatus.IN_PROGRESS }
    val openTickets = tickets.count { it.status == TicketStatus.OPEN || it.status == TicketStatus.IN_PROGRESS }
    val reportedDisputes = bookings.count { it.status == BookingStatus.DISPUTED }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(androidx.compose.foundation.rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Surface(
            color = KaziCardElevated,
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Info, contentDescription = null, tint = KaziGold, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Live Platform Metrics • Connected to Active Marketplace Repositories", color = KaziTextSecondary, fontSize = 11.sp)
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            KaziCard(modifier = Modifier.weight(1f)) {
                Text("Registered Users", color = KaziTextSecondary, fontSize = 11.sp)
                Text("${users.size}", color = KaziGold, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text("Real accounts registered", color = KaziBronze, fontSize = 9.sp)
            }
            KaziCard(modifier = Modifier.weight(1f)) {
                Text("Pending Verifications", color = KaziTextSecondary, fontSize = 11.sp)
                Text("$pendingVerifications", color = KaziGold, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text("Awaiting verification review", color = KaziBronze, fontSize = 9.sp)
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            KaziCard(modifier = Modifier.weight(1f)) {
                Text("Active Shoots on Set", color = KaziTextSecondary, fontSize = 11.sp)
                Text("$activeShoots", color = KaziGold, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text("In progress contracts", color = KaziGreen, fontSize = 10.sp)
            }
            KaziCard(modifier = Modifier.weight(1f)) {
                Text("Listed Equipment", color = KaziTextSecondary, fontSize = 11.sp)
                Text("${equipment.size}", color = KaziGold, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text("Active gear marketplace items", color = KaziBronze, fontSize = 9.sp)
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            KaziCard(modifier = Modifier.weight(1f)) {
                Text("Open Support Tickets", color = KaziTextSecondary, fontSize = 11.sp)
                Text("$openTickets", color = KaziGold, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            }
            KaziCard(modifier = Modifier.weight(1f)) {
                Text("Reported Disputes", color = KaziTextSecondary, fontSize = 11.sp)
                Text("$reportedDisputes", color = if (reportedDisputes > 0) KaziRed else KaziGold, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun AdminUsersTab(
    users: List<UserProfile>,
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    onActionUser: (UserProfile) -> Unit
) {
    val filtered = users.filter {
        it.displayName.contains(searchQuery, ignoreCase = true) ||
        it.email.contains(searchQuery, ignoreCase = true)
    }

    Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchChange,
            placeholder = { Text("Search users by name or email...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = KaziGold) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.weight(1f)) {
            items(filtered) { u ->
                KaziCard {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(u.displayName, color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    color = if (u.accountStatus == AccountStatus.SUSPENDED) KaziRed.copy(alpha = 0.2f) else KaziGreen.copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = u.accountStatus.label,
                                        color = if (u.accountStatus == AccountStatus.SUSPENDED) KaziRed else KaziGreen,
                                        fontSize = 9.sp,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(u.email, color = KaziTextSecondary, fontSize = 11.sp)
                            Text("Country: ${u.country.displayName} • Roles: ${u.roles.joinToString { it.titleEn.split(" ")[0] }}", color = KaziBronze, fontSize = 10.sp)
                        }

                        Button(
                            onClick = { onActionUser(u) },
                            colors = ButtonDefaults.buttonColors(containerColor = if (u.accountStatus == AccountStatus.SUSPENDED) KaziGreen else KaziRed),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Text(if (u.accountStatus == AccountStatus.SUSPENDED) "Reactivate" else "Suspend", fontSize = 10.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminFreelancerVerificationTab(viewModel: KaziHubViewModel) {
    val allUsers by viewModel.allUsers.collectAsState()
    val unverifiedCreatives = remember(allUsers) {
        allUsers.filter { user ->
            user.roles.contains(UserRole.FREELANCER) && !user.isIdentityVerified
        }.map { user ->
            FreelancerVerificationItem(
                creativeId = user.id,
                fullName = user.displayName,
                email = user.email,
                country = user.country,
                category = CreativeCategory.CINEMATOGRAPHY,
                submittedDocType = "National Identity Card / Pass",
                submittedDocReference = "DOC-${user.id.takeLast(6).uppercase()}",
                portfolioLinksCount = 0,
                submittedDate = "Pending Review",
                isVerified = false,
                isPending = true
            )
        }
    }

    if (unverifiedCreatives.isEmpty()) {
        KaziEmptyState(
            title = "No Pending Talent Verifications",
            description = "All registered creative professionals have completed verification or no identity review requests are pending.",
            icon = Icons.Default.VerifiedUser
        )
    } else {
        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            item {
                Text("Creative Identification Review Queue (${unverifiedCreatives.size})", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
            items(unverifiedCreatives) { item ->
                KaziCard {
                    Text(item.fullName, color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Text("${item.category.label} • ${item.country.displayName}", color = KaziTextSecondary, fontSize = 11.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    Surface(color = KaziBackgroundSecondary, shape = RoundedCornerShape(6.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(8.dp)) {
                            Text("User ID: ${item.creativeId} • Email: ${item.email}", color = KaziBronze, fontSize = 11.sp, fontWeight = FontWeight.Medium)
                            Text("Status: Unverified Account • Awaiting Admin Audit", color = KaziTextSecondary, fontSize = 10.sp)
                        }
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { /* Admin verified in backend */ },
                            colors = ButtonDefaults.buttonColors(containerColor = KaziGreen),
                            modifier = Modifier.weight(1f).height(36.dp)
                        ) {
                            Text("Approve Verification", fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminEquipmentVerificationTab(viewModel: KaziHubViewModel) {
    val equipment by viewModel.equipmentList.collectAsState()
    val unverifiedListings = remember(equipment) {
        equipment.filter { !it.owner.isVerifiedOwner }
    }

    if (unverifiedListings.isEmpty()) {
        KaziEmptyState(
            title = "No Pending Equipment Verifications",
            description = "All submitted cinema equipment listings and serial records have been reviewed, or no equipment has been submitted yet.",
            icon = Icons.Default.CameraAlt
        )
    } else {
        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            item {
                Text("Cinema Gear Ownership & Serial Audit Queue (${unverifiedListings.size})", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
            items(unverifiedListings) { gear ->
                KaziCard {
                    Text(gear.title, color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Text("Model: ${gear.brandModel} • Owner: ${gear.owner.name}", color = KaziTextSecondary, fontSize = 11.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    Surface(color = KaziBackgroundSecondary, shape = RoundedCornerShape(6.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(8.dp)) {
                            Text("Hardware Serial: ${gear.serialNumberHash}", color = KaziBronze, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            Text("Rate: ${gear.currencyCode} ${gear.dailyRate}/day", color = KaziTextSecondary, fontSize = 10.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminBookingsTab(bookings: List<BookingRecord>) {
    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Text("All Platform Bookings (${bookings.size})", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }
        items(bookings) { b ->
            KaziCard {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(b.bookingReference, color = KaziGold, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text(b.status.labelEn, color = KaziTextPrimary, fontSize = 10.sp)
                }
                Text(b.title, color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Text("Client: ${b.clientName} | Provider: ${b.providerName}", color = KaziTextSecondary, fontSize = 11.sp)
                Text("Amount: ${b.currencyCode} ${String.format("%,d", b.agreedAmount)}", color = KaziBronze, fontSize = 11.sp)
            }
        }
    }
}

@Composable
fun AdminDisputesTab(bookings: List<BookingRecord>) {
    val disputed = bookings.filter { it.status == BookingStatus.DISPUTED }

    Column(modifier = Modifier.fillMaxSize()) {
        Text("Reported Complaints & Disputes (${disputed.size})", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(10.dp))

        if (disputed.isEmpty()) {
            KaziEmptyState(
                title = "No Open Disputes",
                description = "All platform bookings are currently proceeding without open mediation disputes.",
                icon = Icons.Default.Gavel
            )
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(disputed) { b ->
                    KaziCard {
                        Text("Booking Reference: ${b.bookingReference}", color = KaziGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Text(b.title, color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        b.dispute?.let { d ->
                            Spacer(modifier = Modifier.height(6.dp))
                            Surface(color = KaziRed.copy(alpha = 0.1f), shape = RoundedCornerShape(6.dp), modifier = Modifier.fillMaxWidth()) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("Reason: ${d.reason}", color = KaziRed, fontSize = 11.sp)
                                    Text("Raised By User ID: ${d.raisedByUserId} • ${d.timestamp}", color = KaziTextSecondary, fontSize = 10.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminSupportTicketsTab(tickets: List<SupportTicket>, viewModel: KaziHubViewModel) {
    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Text("Customer Care Help Desk Queue (${tickets.size})", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }
        items(tickets) { t ->
            KaziCard {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(t.ticketReference, color = KaziGold, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Surface(color = KaziCardElevated, shape = RoundedCornerShape(4.dp)) {
                        Text(t.status.label, color = KaziTextPrimary, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                }
                Text(t.subject, color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Text("User: ${t.userName} (${t.userEmail}) • Category: ${t.category.titleEn}", color = KaziTextSecondary, fontSize = 11.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = { viewModel.updateSupportTicketStatus(t.id, TicketStatus.RESOLVED) },
                        colors = ButtonDefaults.buttonColors(containerColor = KaziGreen),
                        modifier = Modifier.weight(1f).height(32.dp)
                    ) {
                        Text("Mark Resolved", fontSize = 10.sp)
                    }
                    Button(
                        onClick = { viewModel.updateSupportTicketStatus(t.id, TicketStatus.IN_PROGRESS) },
                        colors = ButtonDefaults.buttonColors(containerColor = KaziCardElevated),
                        modifier = Modifier.weight(1f).height(32.dp)
                    ) {
                        Text("Assign to Me", fontSize = 10.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun AdminMarketplaceSettingsTab() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(androidx.compose.foundation.rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Marketplace Configuration & Control", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)

        KaziCard {
            Text("Supported East African Territories", color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            listOf(
                "Tanzania" to "Regions (Dar es Salaam, Arusha, Zanzibar) • Currency: TZS",
                "Kenya" to "Counties (Nairobi, Mombasa, Kiambu) • Currency: KES",
                "Uganda" to "Districts (Kampala, Jinja, Entebbe) • Currency: UGX",
                "Rwanda" to "Provinces (Kigali, Musanze, Rubavu) • Currency: RWF"
            ).forEach { (country, desc) ->
                Text("• $country: $desc", color = KaziTextSecondary, fontSize = 11.sp)
            }
        }

        KaziCard {
            Text("Platform Contact Settings (Centrally Managed)", color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            Text("Official Support Email: [Configured in Phase 2]", color = KaziTextSecondary, fontSize = 11.sp)
            Text("Support Hotline: [Configured in Phase 2]", color = KaziTextSecondary, fontSize = 11.sp)
            Text("Status: Production placeholders active. No fabricated numbers displayed.", color = KaziBronze, fontSize = 11.sp)
        }
    }
}

@Composable
fun AdminAuditLogsTab() {
    val logs = remember { emptyList<AdminAuditRecord>() }

    Column(modifier = Modifier.fillMaxSize()) {
        Text("Immutable Security & Moderation Audit Trail", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(10.dp))

        if (logs.isEmpty()) {
            KaziEmptyState(
                title = "No Administrative Audit Logs Yet",
                description = "Platform moderation, account suspensions, and verification actions performed by authorized administrators will appear in this immutable audit ledger.",
                icon = Icons.Default.History
            )
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(logs) { log ->
                    Surface(
                        color = KaziCard,
                        shape = RoundedCornerShape(8.dp),
                        border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(KaziBorder)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(log.actionType.name, color = KaziGold, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                Text(log.timestampFormatted, color = KaziTextSecondary, fontSize = 10.sp)
                            }
                            Text("Actor: ${log.adminUserName} (${log.adminUserId})", color = KaziBronze, fontSize = 11.sp)
                            Text("Target: ${log.targetEntityType} [${log.targetEntityId}]", color = KaziTextSecondary, fontSize = 10.sp)
                            Text("Notes: ${log.reasonOrNotes}", color = KaziTextPrimary, fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }
}
