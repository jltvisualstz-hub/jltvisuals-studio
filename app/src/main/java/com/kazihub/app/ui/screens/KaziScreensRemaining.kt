package com.kazihub.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
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
import com.kazihub.app.ui.navigation.KaziHubDestination
import com.kazihub.app.ui.viewmodel.KaziHubViewModel

// -------------------------------------------------------------
// 5. SEARCH AND FILTERS SCREEN
// -------------------------------------------------------------
@Composable
fun SearchFiltersScreen(
    viewModel: KaziHubViewModel,
    onBack: () -> Unit,
    onApply: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var query by remember { mutableStateOf(uiState.searchQuery) }
    var selectedCategory by remember { mutableStateOf(uiState.selectedCategory) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
    ) {
        OutlinedTextField(
            value = query,
            onValueChange = {
                query = it
                viewModel.setSearchQuery(it)
            },
            placeholder = { Text("Search talent, gear, location...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = KaziGold) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(20.dp))
        Text("Filter by Specialization", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(10.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.weight(1f)) {
            items(CreativeCategory.values()) { category ->
                val isSelected = selectedCategory == category
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) KaziCardElevated else KaziCard)
                        .border(1.dp, if (isSelected) KaziGold else KaziBorder, RoundedCornerShape(8.dp))
                        .clickable { selectedCategory = if (isSelected) null else category }
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = isSelected,
                        onClick = { selectedCategory = if (isSelected) null else category },
                        colors = RadioButtonDefaults.colors(selectedColor = KaziGold)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = category.label, color = KaziTextPrimary, fontSize = 13.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        GoldButton(
            text = "Apply Filters",
            onClick = onApply,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

// -------------------------------------------------------------
// 6. FREELANCER DISCOVERY SCREEN
// -------------------------------------------------------------
@Composable
fun FreelancerDiscoveryScreen(
    viewModel: KaziHubViewModel,
    onSelectCreative: (CreativeProfile) -> Unit
) {
    val creatives by viewModel.creatives.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Vetted East African Talent", color = KaziTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text("Vetted cinematographers, sound engineers & drone pilots across East Africa", color = KaziTextSecondary, fontSize = 12.sp)
        }

        if (creatives.isEmpty()) {
            item {
                KaziEmptyState(
                    title = "No Professionals Available Yet",
                    description = "There are no creative professionals registered in this territory yet. Registered creative talent will be listed here.",
                    icon = Icons.Default.PersonSearch
                )
            }
        } else {
            items(creatives) { creative ->
                KaziCard(onClick = { onSelectCreative(creative) }) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(52.dp)
                                .clip(CircleShape)
                                .background(KaziBackgroundSecondary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Person, contentDescription = null, tint = KaziGold)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(creative.fullName, color = KaziTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.width(6.dp))
                                if (creative.isVerifiedPro) VerifiedBadge()
                            }
                            Text(creative.primaryCategory.label, color = KaziTextSecondary, fontSize = 12.sp)
                            Text(creative.primaryLocation.formattedLocation(), color = KaziBronze, fontSize = 11.sp)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("${creative.currencyCode} ${creative.indicativeDayRate / 1000}k", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            if (creative.reviewsCount > 0) {
                                Text("★ ${creative.averageRating}", color = KaziGoldLight, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// 7. FREELANCER PROFILE SCREEN
// -------------------------------------------------------------
@Composable
fun FreelancerProfileScreen(
    viewModel: KaziHubViewModel,
    onBookNow: () -> Unit,
    onSelectPortfolio: (PortfolioItem) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val creative = uiState.selectedCreative ?: return

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            KaziCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(KaziBackgroundSecondary)
                            .border(1.dp, KaziGold, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = KaziGold, modifier = Modifier.size(32.dp))
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(creative.fullName, color = KaziTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.width(8.dp))
                            VerifiedBadge()
                        }
                        if (creative.reviewsCount > 0) {
                            Text("★ ${creative.averageRating} (${creative.reviewsCount} reviews) • ${creative.completedProjectsCount} completed shoots", color = KaziGold, fontSize = 12.sp)
                        } else {
                            Text("New to Network • 0 reviews yet", color = KaziBronze, fontSize = 12.sp)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(creative.bio, color = KaziTextPrimary, fontSize = 13.sp, lineHeight = 19.sp)
            }
        }

        item {
            Text("Services & Daily Rates", color = KaziGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        }

        items(creative.services) { srv ->
            KaziCard {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(srv.title, color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Text(srv.description, color = KaziTextSecondary, fontSize = 12.sp)
                    }
                    Text("${srv.currencyCode} ${srv.priceAmount / 1000}k", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        item {
            Text("Featured Portfolio Works", color = KaziGold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        }

        items(creative.portfolio) { work ->
            KaziCard(onClick = { onSelectPortfolio(work) }) {
                Text(work.title, color = KaziTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Text("${work.clientOrProduction} • ${work.year}", color = KaziGoldLight, fontSize = 12.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Text(work.description, color = KaziTextSecondary, fontSize = 12.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Gear: ${work.gearUsed}", color = KaziBronze, fontSize = 11.sp)
            }
        }

        item {
            GoldButton(
                text = "Book Creative for Shoot",
                onClick = onBookNow,
                modifier = Modifier.fillMaxWidth(),
                leadingIcon = Icons.Default.CalendarMonth
            )
        }
    }
}

// -------------------------------------------------------------
// 8. PORTFOLIO GALLERY AND DETAILS SCREEN
// -------------------------------------------------------------
@Composable
fun PortfolioDetailScreen(
    viewModel: KaziHubViewModel,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val item = uiState.selectedPortfolioItem ?: return

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(androidx.compose.foundation.rememberScrollState())
    ) {
        KaziCard {
            Text(item.title, color = KaziTextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Text("${item.clientOrProduction} • ${item.year}", color = KaziGold, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(14.dp))
            Text(item.description, color = KaziTextSecondary, fontSize = 14.sp, lineHeight = 20.sp)
            Spacer(modifier = Modifier.height(14.dp))
            Text("Production Cinema Gear:", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            Text(item.gearUsed, color = KaziTextPrimary, fontSize = 13.sp)
            Spacer(modifier = Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                item.tags.forEach { tag ->
                    Surface(color = KaziCardElevated, shape = RoundedCornerShape(4.dp)) {
                        Text(tag, color = KaziGoldLight, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                }
            }
        }
        Spacer(modifier = Modifier.height(20.dp))
        OutlinedGoldButton(text = "Return to Profile", onClick = onBack, modifier = Modifier.fillMaxWidth())
    }
}

// -------------------------------------------------------------
// 9. EQUIPMENT MARKETPLACE SCREEN
// -------------------------------------------------------------
@Composable
fun EquipmentMarketplaceScreen(
    viewModel: KaziHubViewModel,
    onSelectEquipment: (EquipmentItem) -> Unit
) {
    val equipment by viewModel.equipmentList.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Cinema Gear Rental Marketplace", color = KaziTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text("Cinema cameras, anamorphic lenses, sound & lighting across East Africa", color = KaziTextSecondary, fontSize = 12.sp)
        }

        if (equipment.isEmpty()) {
            item {
                KaziEmptyState(
                    title = "No Equipment Listings Yet",
                    description = "No cinema packages, cameras, or audio rigs have been listed in this territory yet. Equipment owners can list cinema gear securely.",
                    icon = Icons.Default.CameraAlt
                )
            }
        } else {
            items(equipment) { gear ->
                KaziCard(onClick = { onSelectEquipment(gear) }) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(gear.title, color = KaziTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                            Text("${gear.currencyCode} ${gear.dailyRate / 1000}k / day", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text("${gear.category.label} • Condition: ${gear.condition.label}", color = KaziTextSecondary, fontSize = 12.sp)
                        Text("Owner: ${gear.owner.name}", color = KaziBronze, fontSize = 11.sp)
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// 10. EQUIPMENT DETAILS SCREEN
// -------------------------------------------------------------
@Composable
fun EquipmentDetailScreen(
    viewModel: KaziHubViewModel,
    onRentNow: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val gear = uiState.selectedEquipment ?: return

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(androidx.compose.foundation.rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        KaziCard {
            Text(gear.title, color = KaziTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text("${gear.currencyCode} ${gear.dailyRate / 1000}k per day", color = KaziGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Text(gear.location.formattedLocation(), color = KaziBronze, fontSize = 12.sp)
        }

        KaziCard {
            Text("Technical Specifications", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(8.dp))
            gear.technicalSpecs.forEach { (spec, value) ->
                Row(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(spec, color = KaziTextSecondary, fontSize = 12.sp)
                    Text(value, color = KaziTextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }
            }
        }

        KaziCard {
            Text("Deposit & Rental Terms", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Security Deposit: ${gear.terms.depositCurrency} ${gear.terms.securityDepositAmount / 1000}k", color = KaziTextPrimary, fontSize = 13.sp)
            Text("Dry Hire Allowed: ${if (gear.terms.allowsDryHire) "Yes" else "Requires Certified Technician"}", color = KaziTextSecondary, fontSize = 12.sp)
            Text("Insurance Included: ${if (gear.terms.insuranceIncluded) "Production Transit Coverage" else "Renter Assumes Liability"}", color = KaziTextSecondary, fontSize = 12.sp)
        }

        GoldButton(
            text = "Reserve Gear Package",
            onClick = onRentNow,
            modifier = Modifier.fillMaxWidth(),
            leadingIcon = Icons.Default.ConfirmationNumber
        )
    }
}

// -------------------------------------------------------------
// 11. POST A JOB REQUEST SCREEN
// -------------------------------------------------------------
@Composable
fun PostJobScreen(
    viewModel: KaziHubViewModel,
    onSubmit: () -> Unit
) {
    var title by remember { mutableStateOf("") }
    var brief by remember { mutableStateOf("") }
    var budget by remember { mutableStateOf("2500000") }
    var location by remember { mutableStateOf("Masaki, Dar es Salaam") }
    var selectedCurrency by remember { mutableStateOf("TZS") }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(androidx.compose.foundation.rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("Post a Production Request", color = KaziTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("Broadcast requirements to verified East African cinematographers & rental houses", color = KaziTextSecondary, fontSize = 13.sp)

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Shoot / Production Title *") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = brief,
            onValueChange = { brief = it },
            label = { Text("Creative Brief & Requirements *") },
            minLines = 4,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = budget,
                onValueChange = { budget = it },
                label = { Text("Estimated Budget Amount") },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = KaziGold,
                    unfocusedBorderColor = KaziBorder,
                    focusedTextColor = KaziTextPrimary,
                    unfocusedTextColor = KaziTextPrimary
                ),
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = selectedCurrency,
                onValueChange = { selectedCurrency = it },
                label = { Text("Currency") },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = KaziGold,
                    unfocusedBorderColor = KaziBorder,
                    focusedTextColor = KaziTextPrimary,
                    unfocusedTextColor = KaziTextPrimary
                ),
                modifier = Modifier.width(100.dp)
            )
        }

        OutlinedTextField(
            value = location,
            onValueChange = { location = it },
            label = { Text("Shoot Location / Hub *") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        errorMsg?.let {
            Text(it, color = KaziRed, fontSize = 11.sp)
        }

        GoldButton(
            text = "Publish Production Brief",
            onClick = {
                if (title.isBlank() || brief.isBlank()) {
                    errorMsg = "Please fill in production title and creative brief."
                } else {
                    viewModel.submitJobRequest(
                        title = title,
                        brief = brief,
                        budget = budget.toLongOrNull() ?: 2500000L,
                        currency = selectedCurrency,
                        startDate = "2024-11-20",
                        endDate = "2024-11-22",
                        locationName = location
                    )
                    onSubmit()
                }
            },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

// -------------------------------------------------------------
// 12. BOOKING OVERVIEW SCREEN
// -------------------------------------------------------------
@Composable
fun BookingOverviewScreen(
    viewModel: KaziHubViewModel
) {
    BookingCenterScreen(
        viewModel = viewModel,
        onSelectBooking = { viewModel.selectBooking(it) },
        onNavigatePostJob = { viewModel.navigateTo(KaziHubDestination.POST_JOB) }
    )
}

// -------------------------------------------------------------
// 13. CLIENT DASHBOARD SCREEN
// -------------------------------------------------------------
@Composable
fun ClientDashboardScreen(
    viewModel: KaziHubViewModel,
    onNavigate: (KaziHubDestination) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(androidx.compose.foundation.rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Client Commissioner Hub", color = KaziTextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Text("Monitor your creative crews, quotations and equipment holds", color = KaziTextSecondary, fontSize = 13.sp)

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            KaziCard(modifier = Modifier.weight(1f)) {
                Text("Active Shoots", color = KaziTextSecondary, fontSize = 11.sp)
                Text("2", color = KaziGold, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            }
            KaziCard(modifier = Modifier.weight(1f)) {
                Text("Pending Quotes", color = KaziTextSecondary, fontSize = 11.sp)
                Text("3", color = KaziGold, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            }
        }

        GoldButton(text = "Go to Booking Center", onClick = { onNavigate(KaziHubDestination.BOOKING_CENTER) }, modifier = Modifier.fillMaxWidth())
        OutlinedGoldButton(text = "Post New Shoot Brief", onClick = { onNavigate(KaziHubDestination.POST_JOB) }, modifier = Modifier.fillMaxWidth())
    }
}

// -------------------------------------------------------------
// 14. FREELANCER DASHBOARD SCREEN
// -------------------------------------------------------------
@Composable
fun FreelancerDashboardScreen(
    viewModel: KaziHubViewModel,
    onNavigate: (KaziHubDestination) -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(androidx.compose.foundation.rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Creative Professional Workspace", color = KaziTextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Text("Availability calendar, incoming job offers, and earnings overview", color = KaziTextSecondary, fontSize = 13.sp)

        KaziCard {
            Text("Availability Status", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(4.dp))
            Text("Available for Bookings across East Africa", color = KaziTextPrimary, fontSize = 14.sp)
        }

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            KaziCard(modifier = Modifier.weight(1f)) {
                Text("Completed Shoots", color = KaziTextSecondary, fontSize = 11.sp)
                Text("48", color = KaziGold, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            }
            KaziCard(modifier = Modifier.weight(1f)) {
                Text("Rating", color = KaziTextSecondary, fontSize = 11.sp)
                Text("4.95 ★", color = KaziGold, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            }
        }

        GoldButton(text = "View My Active Bookings", onClick = { onNavigate(KaziHubDestination.BOOKING_CENTER) }, modifier = Modifier.fillMaxWidth())
    }
}

// -------------------------------------------------------------
// 15. EQUIPMENT OWNER DASHBOARD SCREEN
// -------------------------------------------------------------
@Composable
fun EquipmentOwnerDashboardScreen(
    viewModel: KaziHubViewModel,
    onNavigate: (KaziHubDestination) -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(androidx.compose.foundation.rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Gear Owner & Rental House Hub", color = KaziTextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Text("Manage cinema gear checkouts, security deposits, and maintenance logs", color = KaziTextSecondary, fontSize = 13.sp)

        KaziCard {
            Text("Active Equipment Rentals", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            Text("Cooke SP3 Lens Trio • Currently On Set (Nairobi)", color = KaziTextPrimary, fontSize = 14.sp)
            Text("Return inspection scheduled: Nov 14, 5:00 PM", color = KaziTextSecondary, fontSize = 12.sp)
        }

        GoldButton(text = "Manage Gear Bookings", onClick = { onNavigate(KaziHubDestination.BOOKING_CENTER) }, modifier = Modifier.fillMaxWidth())
    }
}

// -------------------------------------------------------------
// 16. MESSAGES INTERFACE SCREEN
// -------------------------------------------------------------
@Composable
fun MessagesScreen(
    viewModel: KaziHubViewModel
) {
    val conversations by viewModel.conversations.collectAsState()
    var input by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
    ) {
        Text("Production Messages", color = KaziTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.weight(1f)) {
            items(conversations) { conv ->
                KaziCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier.size(42.dp).clip(CircleShape).background(KaziBackgroundSecondary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Person, contentDescription = null, tint = KaziGold)
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(conv.participantName, color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Text(conv.lastMessage, color = KaziTextSecondary, fontSize = 12.sp, maxLines = 1)
                        }
                        Text(conv.lastTimestamp, color = KaziBronze, fontSize = 10.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
                value = input,
                onValueChange = { input = it },
                placeholder = { Text("Type message...") },
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
                    if (input.isNotBlank()) {
                        viewModel.sendMessage("conv_neema_01", input)
                        input = ""
                    }
                }
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = KaziGold)
            }
        }
    }
}

// -------------------------------------------------------------
// 17. NOTIFICATIONS SCREEN
// -------------------------------------------------------------
@Composable
fun NotificationsScreen(
    viewModel: KaziHubViewModel
) {
    val notifs by viewModel.notifications.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Activity & Notifications", color = KaziTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        }

        items(notifs) { n ->
            KaziCard(onClick = { viewModel.markNotificationAsRead(n.id) }) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(n.title, color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Text(n.timestamp, color = KaziBronze, fontSize = 11.sp)
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(n.body, color = KaziTextSecondary, fontSize = 12.sp)
            }
        }
    }
}

// -------------------------------------------------------------
// 18. PROFILE AND SETTINGS SCREEN
// -------------------------------------------------------------
@Composable
fun ProfileSettingsScreen(
    viewModel: KaziHubViewModel,
    onNavigate: (KaziHubDestination) -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(androidx.compose.foundation.rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Account & Preferences", color = KaziTextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)

        val currentUser = uiState.currentUser
        var showPhotoOptions by remember { mutableStateOf(false) }

        // User Profile & Photo Management Card
        KaziCard {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                // Profile Photo or Fallback Initials Avatar
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .clip(CircleShape)
                        .background(KaziBackgroundSecondary)
                        .border(2.dp, KaziGold, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    if (!currentUser?.profileImageUrl.isNullOrBlank()) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = KaziGold, modifier = Modifier.size(36.dp))
                    } else {
                        // Fallback Initials Avatar
                        val initials = currentUser?.displayName?.split(" ")?.mapNotNull { it.firstOrNull() }?.take(2)?.joinToString("") ?: "KH"
                        Text(
                            text = initials.uppercase(),
                            color = KaziGold,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = currentUser?.displayName ?: "Creative User",
                            color = KaziTextPrimary,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        if (currentUser?.isIdentityVerified == true) {
                            VerifiedBadge()
                        }
                    }
                    Text(
                        text = currentUser?.email ?: "user@kazihub.ea",
                        color = KaziTextSecondary,
                        fontSize = 12.sp
                    )
                    Text(
                        text = "Territory: ${currentUser?.country?.displayName ?: "East Africa"}",
                        color = KaziBronze,
                        fontSize = 11.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Photo Management Actions
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedGoldButton(
                    text = "Update Photo",
                    onClick = { showPhotoOptions = !showPhotoOptions },
                    modifier = Modifier.weight(1f)
                )
                if (!currentUser?.profileImageUrl.isNullOrBlank()) {
                    Button(
                        onClick = { viewModel.deleteProfilePhoto { _, _ -> } },
                        colors = ButtonDefaults.buttonColors(containerColor = KaziCardElevated, contentColor = KaziRed),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Remove Photo", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Cloud Storage Status Notice
            Spacer(modifier = Modifier.height(8.dp))
            Surface(
                color = KaziBackgroundSecondary,
                shape = RoundedCornerShape(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CloudQueue, contentDescription = null, tint = KaziBronze, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Cloud Storage: Local cached mode. Live multi-device avatar hosting requires Firebase Storage bucket provisioning.",
                        color = KaziTextSecondary,
                        fontSize = 10.sp
                    )
                }
            }

            if (showPhotoOptions) {
                Spacer(modifier = Modifier.height(10.dp))
                Text("Select Sample Photo (Simulated Android Gallery / Camera Contract):", color = KaziGold, fontSize = 11.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf(
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" to "Portrait 1",
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" to "Portrait 2",
                        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400" to "Portrait 3"
                    ).forEach { (url, label) ->
                        Button(
                            onClick = {
                                viewModel.updateProfilePhoto(url) { _, _ -> }
                                showPhotoOptions = false
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = KaziCardElevated, contentColor = KaziGoldLight),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(label, fontSize = 10.sp)
                        }
                    }
                }
            }
        }

        KaziCard {
            Text("Active Account Role", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(uiState.activeRole.titleEn, color = KaziTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Text(uiState.activeRole.titleSw, color = KaziTextSecondary, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(10.dp))
            OutlinedGoldButton(
                text = "Switch Active Role",
                onClick = { viewModel.setRoleSwitchDialogVisible(true) },
                modifier = Modifier.fillMaxWidth()
            )
        }

        // Dedicated Booking Center Link
        KaziCard(onClick = { onNavigate(KaziHubDestination.BOOKING_CENTER) }) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.EventNote, contentDescription = null, tint = KaziGold, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text("Booking Center", color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text("All confirmed, pending & on-set contracts", color = KaziTextSecondary, fontSize = 11.sp)
                    }
                }
                Text("→", color = KaziGold, fontSize = 14.sp)
            }
        }

        // Dedicated Customer Care Link
        KaziCard(onClick = { onNavigate(KaziHubDestination.CUSTOMER_CARE) }) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.SupportAgent, contentDescription = null, tint = KaziGold, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text("Customer Care & Help Center", color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text("Support tickets, FAQ, dispute mediation", color = KaziTextSecondary, fontSize = 11.sp)
                    }
                }
                Text("→", color = KaziGold, fontSize = 14.sp)
            }
        }

        // Language Selector
        KaziCard {
            Text("Language / Lugha", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(if (uiState.isSwahili) "Kiswahili (Afrika Mashariki)" else "English (East Africa)", color = KaziTextPrimary, fontSize = 14.sp)
                Button(
                    onClick = { viewModel.toggleLanguage() },
                    colors = ButtonDefaults.buttonColors(containerColor = KaziCardElevated, contentColor = KaziGold)
                ) {
                    Text("Change / Badilisha")
                }
            }
        }

        // Legal Terms Link
        KaziCard(onClick = { onNavigate(KaziHubDestination.LEGAL_TERMS) }) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Gavel, contentDescription = null, tint = KaziBronze, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text("Marketplace Legal & Escrow Terms", color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text("Dispute policies, deposit release rules & fee schedules", color = KaziTextSecondary, fontSize = 10.sp)
                    }
                }
                Text("→", color = KaziBronze, fontSize = 14.sp)
            }
        }

        // Restricted Admin Portal Entry
        KaziCard(onClick = { onNavigate(KaziHubDestination.ADMIN_WORKSPACE) }) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Security, contentDescription = null, tint = KaziBronze, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text("Platform Administrator Portal", color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text("Restricted • Verified server admin claims required", color = KaziBronze, fontSize = 10.sp)
                    }
                }
                Text("→", color = KaziBronze, fontSize = 14.sp)
            }
        }

        // Sign Out Button
        Button(
            onClick = { viewModel.logout() },
            colors = ButtonDefaults.buttonColors(containerColor = KaziCardElevated, contentColor = KaziRed),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Default.ExitToApp, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Sign Out / Terminate Session", fontWeight = FontWeight.Bold)
        }
    }
}

// -------------------------------------------------------------
// 19. ADMIN DASHBOARD SHELL SCREEN
// -------------------------------------------------------------
@Composable
fun AdminDashboardScreen(
    viewModel: KaziHubViewModel
) {
    AdminWorkspaceScreen(
        viewModel = viewModel,
        onBackToMarketplace = { viewModel.navigateTo(KaziHubDestination.HOME) }
    )
}
