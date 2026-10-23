package com.kazihub.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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

enum class BookingFilterTab(val labelEn: String, val labelSw: String) {
    ALL("All", "Yote"),
    PENDING("Pending", "Inasubiri"),
    QUOTATION_SUBMITTED("Quoted", "Nukuu"),
    CONFIRMED("Confirmed", "Imethibitishwa"),
    IN_PROGRESS("In Progress", "Inaendelea"),
    AWAITING_COMPLETION("Awaiting Wrap", "Inasubiri"),
    COMPLETED("Completed", "Imekamilika"),
    CANCELLED("Cancelled", "Imeghairiwa"),
    DISPUTED("Disputed", "Kwenye Mgogoro")
}

@Composable
fun BookingCenterScreen(
    viewModel: KaziHubViewModel,
    onSelectBooking: (BookingRecord) -> Unit,
    onNavigateCreativeBooking: () -> Unit,
    onNavigateRentalBooking: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val allBookings by viewModel.bookings.collectAsState()
    var selectedTab by remember { mutableStateOf(BookingFilterTab.ALL) }

    val filteredBookings = remember(allBookings, selectedTab) {
        when (selectedTab) {
            BookingFilterTab.ALL -> allBookings
            BookingFilterTab.PENDING -> allBookings.filter { it.status == BookingStatus.PENDING }
            BookingFilterTab.QUOTATION_SUBMITTED -> allBookings.filter { it.status == BookingStatus.QUOTATION_SUBMITTED }
            BookingFilterTab.CONFIRMED -> allBookings.filter { it.status == BookingStatus.CONFIRMED }
            BookingFilterTab.IN_PROGRESS -> allBookings.filter { it.status == BookingStatus.IN_PROGRESS }
            BookingFilterTab.AWAITING_COMPLETION -> allBookings.filter { it.status == BookingStatus.AWAITING_COMPLETION }
            BookingFilterTab.COMPLETED -> allBookings.filter { it.status == BookingStatus.COMPLETED }
            BookingFilterTab.CANCELLED -> allBookings.filter { it.status == BookingStatus.CANCELLED }
            BookingFilterTab.DISPUTED -> allBookings.filter { it.status == BookingStatus.DISPUTED }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = if (uiState.isSwahili) "Kituo cha Makubaliano" else "Booking Center",
                    color = KaziTextPrimary,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = if (uiState.isSwahili) "Mikataba ya utengenezaji, vifaa na nukuu za bei" else "Shoot contracts, quotations & rental agreements",
                    color = KaziTextSecondary,
                    fontSize = 12.sp
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Button(
                    onClick = onNavigateCreativeBooking,
                    colors = ButtonDefaults.buttonColors(containerColor = KaziGold, contentColor = KaziBackground),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(36.dp)
                ) {
                    Text("+ Creative Brief", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 8 Status Filter Tabs Row
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(BookingFilterTab.values()) { tab ->
                val isSelected = selectedTab == tab
                Surface(
                    color = if (isSelected) KaziGold else KaziCard,
                    shape = RoundedCornerShape(20.dp),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(if (isSelected) KaziGold else KaziBorder)
                    ),
                    modifier = Modifier.clickable { selectedTab = tab }
                ) {
                    Text(
                        text = if (uiState.isSwahili) tab.labelSw else tab.labelEn,
                        color = if (isSelected) KaziBackground else KaziTextSecondary,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // List of Bookings
        if (filteredBookings.isEmpty()) {
            KaziEmptyState(
                title = "No Bookings in this Category",
                description = "There are no bookings matching the '${selectedTab.labelEn}' status.",
                icon = Icons.Default.EventBusy
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredBookings) { booking ->
                    KaziCard(onClick = { onSelectBooking(booking) }) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = booking.bookingReference,
                                        color = KaziGold,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 0.5.sp
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Surface(
                                        color = KaziBackgroundSecondary,
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            text = booking.bookingType.label,
                                            color = KaziBronze,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = booking.title,
                                    color = KaziTextPrimary,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Client: ${booking.clientName} • Provider: ${booking.providerName}",
                                    color = KaziTextSecondary,
                                    fontSize = 11.sp
                                )
                            }

                            // Status Tag
                            Surface(
                                color = when (booking.status) {
                                    BookingStatus.CONFIRMED -> KaziGreen.copy(alpha = 0.15f)
                                    BookingStatus.IN_PROGRESS -> KaziBlue.copy(alpha = 0.15f)
                                    BookingStatus.AWAITING_COMPLETION -> KaziBronze.copy(alpha = 0.15f)
                                    BookingStatus.DISPUTED -> KaziRed.copy(alpha = 0.15f)
                                    BookingStatus.CANCELLED -> KaziTextMuted.copy(alpha = 0.2f)
                                    else -> KaziGold.copy(alpha = 0.15f)
                                },
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = if (uiState.isSwahili) booking.status.labelSw else booking.status.labelEn,
                                    color = when (booking.status) {
                                        BookingStatus.CONFIRMED -> KaziGreen
                                        BookingStatus.IN_PROGRESS -> KaziBlue
                                        BookingStatus.DISPUTED -> KaziRed
                                        else -> KaziGold
                                    },
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(6.dp))
                                .background(KaziBackgroundSecondary)
                                .padding(horizontal = 10.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "${booking.eventStartDate} to ${booking.eventEndDate}",
                                    color = KaziTextPrimary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium
                                )
                                Text(
                                    text = booking.location.formattedLocation(),
                                    color = KaziTextSecondary,
                                    fontSize = 10.sp
                                )
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "${booking.currencyCode} ${String.format("%,d", booking.agreedAmount)}",
                                    color = KaziGold,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Inspect Details →",
                                    color = KaziBronze,
                                    fontSize = 10.sp
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// STRUCTURED CREATIVE SERVICE BOOKING REQUEST (Section 5)
// -------------------------------------------------------------
@Composable
fun CreativeBookingRequestScreen(
    viewModel: KaziHubViewModel,
    onSubmitSuccess: () -> Unit,
    onBack: () -> Unit
) {
    var step by remember { mutableStateOf(1) } // 1: Form, 2: Review Screen

    var title by remember { mutableStateOf("Serengeti Wildlife Conservation Campaign") }
    var category by remember { mutableStateOf(CreativeCategory.CINEMATOGRAPHY) }
    var description by remember { mutableStateOf("High-end documentary shoot tracking migration corridors with 4K raw anamorphic lenses.") }
    var crewCount by remember { mutableStateOf("3") }
    var crewDescription by remember { mutableStateOf("1 DoP, 1 Camera Operator, 1 Focus Puller") }
    var startDate by remember { mutableStateOf("2024-11-20") }
    var endDate by remember { mutableStateOf("2024-11-23") }
    var startTime by remember { mutableStateOf("06:00 AM") }
    var endTime by remember { mutableStateOf("06:30 PM") }
    var selectedCountry by remember { mutableStateOf(EastAfricanCountry.TANZANIA) }
    var city by remember { mutableStateOf("Arusha Region") }
    var serviceArea by remember { mutableStateOf("Serengeti National Park Western Corridor") }
    var venueDetails by remember { mutableStateOf("Grumeti River Reserve Base Camp") }
    var budget by remember { mutableStateOf("7200000") }
    var durationDesc by remember { mutableStateOf("4 Full Production Days") }
    var deliverables by remember { mutableStateOf("4K Master ProRes 4444 XQ, raw audio wav stems, b-roll selects") }
    var requiredGear by remember { mutableStateOf("ARRI Alexa Mini LF, 200-400mm cine zoom, drone authorization") }
    var additionalRequirements by remember { mutableStateOf("4x4 off-road safari support vehicle with power inverters") }
    var commMethod by remember { mutableStateOf("In-App Chat & Production Hotline") }
    var validationError by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = KaziGold)
            }
            Text(
                text = if (step == 1) "Creative Production Request" else "Review Booking Brief",
                color = KaziTextPrimary,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }

        if (step == 1) {
            // STEP 1: FORM ENTRY
            Text("Complete all production parameters for vetting and quotation.", color = KaziTextSecondary, fontSize = 12.sp)

            OutlinedTextField(
                value = title,
                onValueChange = { title = it; validationError = null },
                label = { Text("Project / Shoot Title *") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Detailed Creative Brief *") },
                minLines = 3,
                modifier = Modifier.fillMaxWidth()
            )

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = startDate,
                    onValueChange = { startDate = it },
                    label = { Text("Start Date *") },
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = endDate,
                    onValueChange = { endDate = it },
                    label = { Text("End Date *") },
                    modifier = Modifier.weight(1f)
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = startTime,
                    onValueChange = { startTime = it },
                    label = { Text("Call Time") },
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = endTime,
                    onValueChange = { endTime = it },
                    label = { Text("Wrap Time") },
                    modifier = Modifier.weight(1f)
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = budget,
                    onValueChange = { budget = it },
                    label = { Text("Budget Amount (${selectedCountry.currencyCode}) *") },
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it },
                    label = { Text("Region / City *") },
                    modifier = Modifier.weight(1f)
                )
            }

            OutlinedTextField(
                value = serviceArea,
                onValueChange = { serviceArea = it },
                label = { Text("Precise Service Area & Venue *") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = deliverables,
                onValueChange = { deliverables = it },
                label = { Text("Expected Deliverables (e.g. 4K ProRes master)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = requiredGear,
                onValueChange = { requiredGear = it },
                label = { Text("Required Cinema Gear / Packages") },
                modifier = Modifier.fillMaxWidth()
            )

            validationError?.let {
                Text(it, color = KaziRed, fontSize = 12.sp)
            }

            GoldButton(
                text = "Review Production Brief →",
                onClick = {
                    if (title.isBlank() || description.isBlank() || budget.isBlank()) {
                        validationError = "Please fill in title, brief description, and budget."
                    } else {
                        step = 2 // Proceed to review screen
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )
        } else {
            // STEP 2: REVIEW SUMMARY SCREEN BEFORE SUBMISSION
            KaziCard {
                Text(text = "Summary Review", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(10.dp))
                Text(text = title, color = KaziTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Text(text = "Category: ${category.label} • Territory: ${selectedCountry.displayName}", color = KaziBronze, fontSize = 11.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = description, color = KaziTextSecondary, fontSize = 12.sp, lineHeight = 18.sp)
                Divider(modifier = Modifier.padding(vertical = 10.dp), color = KaziBorder)
                Text(text = "Dates: $startDate to $endDate ($startTime to $endTime)", color = KaziTextPrimary, fontSize = 12.sp)
                Text(text = "Location: $serviceArea, $city", color = KaziTextPrimary, fontSize = 12.sp)
                Text(text = "Budget: ${selectedCountry.currencyCode} ${budget}", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Text(text = "Deliverables: $deliverables", color = KaziTextSecondary, fontSize = 11.sp)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedGoldButton(
                    text = "← Edit Details",
                    onClick = { step = 1 },
                    modifier = Modifier.weight(1f)
                )
                GoldButton(
                    text = "Confirm & Submit Brief",
                    onClick = {
                        val req = CreativeServiceBookingRequest(
                            id = "cs_${System.currentTimeMillis()}",
                            clientId = "usr_client",
                            clientName = "Production Commissioner",
                            projectTitle = title,
                            serviceCategory = category,
                            projectDescription = description,
                            requiredProfessionalsCount = crewCount.toIntOrNull() ?: 1,
                            crewSizeDescription = crewDescription,
                            eventStartDate = startDate,
                            eventEndDate = endDate,
                            startTime = startTime,
                            endTime = endTime,
                            country = selectedCountry,
                            cityOrRegion = city,
                            preciseServiceArea = serviceArea,
                            venueOrMeetingDetails = venueDetails,
                            estimatedBudget = budget.toLongOrNull() ?: 5000000L,
                            currencyCode = selectedCountry.currencyCode,
                            expectedDeliverables = deliverables.split(","),
                            projectDurationDescription = durationDesc,
                            requiredEquipmentList = requiredGear.split(","),
                            additionalRequirements = additionalRequirements,
                            preferredCommunicationMethod = commMethod
                        )
                        viewModel.submitStructuredCreativeBooking(req)
                        onSubmitSuccess()
                    },
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

// -------------------------------------------------------------
// EQUIPMENT RENTAL BOOKING REQUEST (Section 6)
// -------------------------------------------------------------
@Composable
fun EquipmentRentalRequestScreen(
    viewModel: KaziHubViewModel,
    onSubmitSuccess: () -> Unit,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val gear = uiState.selectedEquipment ?: return

    var startDate by remember { mutableStateOf("2024-11-18") }
    var endDate by remember { mutableStateOf("2024-11-20") }
    var durationDays by remember { mutableStateOf("3") }
    var pickupPreference by remember { mutableStateOf("Warehouse Pickup (Westlands)") }
    var shootLocation by remember { mutableStateOf("Nairobi National Park & Karen") }
    var returnTime by remember { mutableStateOf("05:30 PM") }
    var agreedTerms by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isSubmitting by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = KaziGold)
            }
            Text("Cinema Gear Rental Request", color = KaziTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }

        KaziCard {
            Text(gear.title, color = KaziTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Text("Daily Rate: ${gear.currencyCode} ${String.format("%,d", gear.dailyRate)} • Deposit: ${gear.terms.depositCurrency} ${String.format("%,d", gear.terms.securityDepositAmount)}", color = KaziGold, fontSize = 12.sp)
            Text("Owner: ${gear.owner.name} (${gear.owner.rating}★)", color = KaziBronze, fontSize = 11.sp)
        }

        OutlinedTextField(
            value = startDate,
            onValueChange = { startDate = it; errorMessage = null },
            label = { Text("Rental Start Date *") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = endDate,
            onValueChange = { endDate = it; errorMessage = null },
            label = { Text("Rental Return Date *") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = durationDays,
            onValueChange = { durationDays = it },
            label = { Text("Duration (Days)") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = shootLocation,
            onValueChange = { shootLocation = it },
            label = { Text("Shoot Operating Location *") },
            modifier = Modifier.fillMaxWidth()
        )

        // Pickup vs Delivery
        Column {
            Text("Pickup / Handover Preference", color = KaziGold, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(4.dp))
            listOf("Warehouse Pickup (Westlands)", "Direct Delivery to Set").forEach { pref ->
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { pickupPreference = pref }) {
                    RadioButton(selected = pickupPreference == pref, onClick = { pickupPreference = pref })
                    Text(pref, color = KaziTextPrimary, fontSize = 12.sp)
                }
            }
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = agreedTerms, onCheckedChange = { agreedTerms = it })
            Spacer(modifier = Modifier.width(6.dp))
            Text("I agree to rental deposit terms & return condition inspection", color = KaziTextSecondary, fontSize = 11.sp)
        }

        errorMessage?.let {
            Text(it, color = KaziRed, fontSize = 12.sp)
        }

        GoldButton(
            text = "Submit Rental Reservation Request",
            onClick = {
                if (!agreedTerms) {
                    errorMessage = "You must agree to the rental terms."
                } else {
                    isSubmitting = true
                    val days = durationDays.toIntOrNull() ?: 1
                    val currentUser = viewModel.uiState.value.currentUser
                    val req = EquipmentRentalBookingRequest(
                        id = "eq_req_${System.currentTimeMillis()}",
                        renterId = currentUser?.id ?: "usr_renter",
                        renterName = currentUser?.displayName ?: "Renter",
                        equipmentListingId = gear.id,
                        equipmentTitle = gear.title,
                        ownerId = gear.owner.ownerId,
                        ownerName = gear.owner.name,
                        startDate = startDate,
                        endDate = endDate,
                        rentalDurationDays = days,
                        pickupOrDeliveryPreference = pickupPreference,
                        shootLocation = shootLocation,
                        securityDepositAmount = gear.terms.securityDepositAmount,
                        rentalRateAmount = gear.dailyRate * days,
                        currencyCode = gear.currencyCode,
                        rentalTermsAgreed = true
                    )

                    viewModel.submitEquipmentRentalBooking(req) { success, err ->
                        isSubmitting = false
                        if (success) {
                            onSubmitSuccess()
                        } else {
                            errorMessage = err ?: "Rental conflict detected."
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

// -------------------------------------------------------------
// DEDICATED BOOKING COMPLETION REPORT (Section 8)
// -------------------------------------------------------------
@Composable
fun BookingCompletionReportScreen(
    viewModel: KaziHubViewModel,
    onSubmitSuccess: () -> Unit,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val booking = uiState.selectedBooking ?: return

    var actualStart by remember { mutableStateOf(booking.eventStartDate) }
    var actualEnd by remember { mutableStateOf(booking.eventEndDate) }
    var workCompletedDesc by remember { mutableStateOf("All scheduled scene setups completed and camera wrap called.") }
    var deliverablesSummary by remember { mutableStateOf("All footage media dumped and dual-backup verified.") }
    var deliveryRef by remember { mutableStateOf("SSD-BACKUP-01 & Cloud Upload") }
    var gearReturnStatus by remember { mutableStateOf("All items returned in mint optical condition") }
    var clientRating by remember { mutableStateOf(5.0f) }
    var isDisputeFlag by remember { mutableStateOf(false) }
    var disputeNotes by remember { mutableStateOf("") }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = KaziGold)
            }
            Text("Booking Completion Report", color = KaziTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }

        KaziCard {
            Text("Booking Reference: ${booking.bookingReference}", color = KaziGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Text(booking.title, color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            Divider(color = KaziBorder)
            Spacer(modifier = Modifier.height(6.dp))
            Text("10% Platform Commission Financial Breakdown:", color = KaziGold, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(4.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Gross Booking Amount:", color = KaziTextSecondary, fontSize = 11.sp)
                Text("${booking.currencyCode} ${String.format("%,d", booking.agreedAmount)}", color = KaziTextPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
            val platformFee = (booking.agreedAmount * 0.10).toLong()
            val netPayout = booking.agreedAmount - platformFee
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("KAZI HUB Fee (10%):", color = KaziTextSecondary, fontSize = 11.sp)
                Text("- ${booking.currencyCode} ${String.format("%,d", platformFee)}", color = KaziRed, fontSize = 11.sp)
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Net Provider Payout:", color = KaziTextSecondary, fontSize = 11.sp)
                Text("${booking.currencyCode} ${String.format("%,d", netPayout)}", color = KaziGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
            if (booking.isEquipmentRental && booking.depositAmount > 0) {
                Spacer(modifier = Modifier.height(4.dp))
                Text("Refundable Security Deposit: ${booking.currencyCode} ${String.format("%,d", booking.depositAmount)} (0% commission)", color = KaziBronze, fontSize = 10.sp)
            }
        }

        OutlinedTextField(
            value = workCompletedDesc,
            onValueChange = { workCompletedDesc = it },
            label = { Text("Description of Work Completed *") },
            minLines = 3,
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = deliverablesSummary,
            onValueChange = { deliverablesSummary = it },
            label = { Text("Agreed Deliverables Summary *") },
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = deliveryRef,
            onValueChange = { deliveryRef = it },
            label = { Text("Delivery Tracking / Drive Link Reference") },
            modifier = Modifier.fillMaxWidth()
        )

        if (booking.isEquipmentRental) {
            OutlinedTextField(
                value = gearReturnStatus,
                onValueChange = { gearReturnStatus = it },
                label = { Text("Equipment Return & Handover Condition *") },
                modifier = Modifier.fillMaxWidth()
            )
        }

        // Dispute Option
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = isDisputeFlag, onCheckedChange = { isDisputeFlag = it })
            Spacer(modifier = Modifier.width(6.dp))
            Text("Flag Discrepancy or Raise Dispute for Administrative Mediation", color = KaziRed, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
        }

        if (isDisputeFlag) {
            OutlinedTextField(
                value = disputeNotes,
                onValueChange = { disputeNotes = it },
                label = { Text("Discrepancy Details & Evidence Notes *") },
                minLines = 3,
                modifier = Modifier.fillMaxWidth()
            )
        }

        errorMsg?.let {
            Text(it, color = KaziRed, fontSize = 12.sp)
        }

        GoldButton(
            text = if (isDisputeFlag) "Submit Completion with Dispute" else "Sign Off & Finalize Completion",
            onClick = {
                val report = BookingCompletionReport(
                    id = "rep_${System.currentTimeMillis()}",
                    bookingReference = booking.bookingReference,
                    actualStartDate = actualStart,
                    actualCompletionDate = actualEnd,
                    descriptionOfWorkCompleted = workCompletedDesc,
                    agreedDeliverablesSummary = deliverablesSummary,
                    deliveryStatus = "Signed Off by Authorized Signee",
                    deliveryReferenceOrDriveLink = deliveryRef,
                    finalAgreedAmount = booking.agreedAmount,
                    currencyCode = booking.currencyCode,
                    isClientConfirmed = true,
                    isProviderConfirmed = true,
                    equipmentHandoverAndReturnStatus = if (booking.isEquipmentRental) gearReturnStatus else null,
                    clientFeedbackRating = clientRating,
                    isDisputeFlagged = isDisputeFlag,
                    supportingEvidenceUrls = if (disputeNotes.isNotBlank()) listOf(disputeNotes) else emptyList()
                )

                viewModel.submitBookingCompletionReport(booking.id, report)
                onSubmitSuccess()
            },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

// -------------------------------------------------------------
// BOOKING DETAIL SCREEN (Quotation Review, Completion & Dispute)
// -------------------------------------------------------------
@Composable
fun BookingDetailScreen(
    viewModel: KaziHubViewModel,
    onBack: () -> Unit,
    onOpenDispute: (BookingRecord) -> Unit,
    onOpenCompletionReport: (BookingRecord) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val booking = uiState.selectedBooking ?: return

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Back Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = KaziGold)
            }
            Text(
                text = "Reference: ${booking.bookingReference}",
                color = KaziGold,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
            Surface(
                color = KaziCardElevated,
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(
                    text = booking.status.labelEn,
                    color = KaziTextPrimary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }

        // Main Summary Card
        KaziCard {
            Text(text = booking.title, color = KaziTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = booking.bookingType.label, color = KaziBronze, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(10.dp))
            Text(text = booking.projectBriefAndScope, color = KaziTextSecondary, fontSize = 13.sp, lineHeight = 19.sp)

            Spacer(modifier = Modifier.height(14.dp))
            Divider(color = KaziBorder)
            Spacer(modifier = Modifier.height(14.dp))

            // Parties info
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text("Client / Commissioner", color = KaziTextSecondary, fontSize = 10.sp)
                    Text(booking.clientName, color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("Service Provider", color = KaziTextSecondary, fontSize = 10.sp)
                    Text("${booking.providerName} (${booking.providerRole})", color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Financial summary
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(KaziBackgroundSecondary)
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Agreed Total Amount", color = KaziTextSecondary, fontSize = 11.sp)
                    Text(
                        text = "${booking.currencyCode} ${String.format("%,d", booking.agreedAmount)}",
                        color = KaziGold,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                if (booking.depositAmount > 0) {
                    Column(horizontalAlignment = Alignment.End) {
                        Text("Security Deposit", color = KaziTextSecondary, fontSize = 11.sp)
                        Text(
                            text = "${booking.currencyCode} ${String.format("%,d", booking.depositAmount)}",
                            color = KaziTextPrimary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }

        // Booking Lifecycle Milestone Tracker (6-Stage Pipeline)
        KaziCard {
            Text(text = "Booking Milestone Pipeline", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(12.dp))

            val stages = listOf(
                "Brief" to (booking.status != BookingStatus.PENDING || booking.quotation != null),
                "Quotation" to (booking.status != BookingStatus.PENDING),
                "Confirmed" to (booking.status == BookingStatus.CONFIRMED || booking.status == BookingStatus.IN_PROGRESS || booking.status == BookingStatus.AWAITING_COMPLETION || booking.status == BookingStatus.COMPLETED),
                "On-Set / Gear" to (booking.status == BookingStatus.IN_PROGRESS || booking.status == BookingStatus.AWAITING_COMPLETION || booking.status == BookingStatus.COMPLETED),
                "Delivery / Wrap" to (booking.status == BookingStatus.AWAITING_COMPLETION || booking.status == BookingStatus.COMPLETED),
                "Completed" to (booking.status == BookingStatus.COMPLETED)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                stages.forEachIndexed { idx, (label, isDone) ->
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                        Box(
                            modifier = Modifier
                                .size(22.dp)
                                .clip(CircleShape)
                                .background(if (isDone) KaziGold else KaziCardElevated)
                                .border(1.dp, if (isDone) KaziGold else KaziBorder, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isDone) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = KaziBackground, modifier = Modifier.size(14.dp))
                            } else {
                                Text("${idx + 1}", color = KaziTextSecondary, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = label,
                            color = if (isDone) KaziGold else KaziTextSecondary,
                            fontSize = 8.sp,
                            fontWeight = if (isDone) FontWeight.Bold else FontWeight.Normal,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            maxLines = 2
                        )
                    }
                }
            }
        }

        // Quotation Review Section
        var showRevisionDialog by remember { mutableStateOf(false) }
        var revisionInput by remember { mutableStateOf("") }
        var showHandoverDialog by remember { mutableStateOf(false) }
        var handoverNotes by remember { mutableStateOf("Pre-shoot optical checklist verified. Gear dispatched to set.") }

        booking.quotation?.let { quote ->
            KaziCard {
                Text(text = "Submitted Quotation Breakdown", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                quote.lineItems.forEach { item ->
                    Text(text = "• $item", color = KaziTextPrimary, fontSize = 12.sp)
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "Notes: ${quote.notes}", color = KaziTextSecondary, fontSize = 11.sp)
                Text(text = "Valid Until: ${quote.validUntilDate}", color = KaziBronze, fontSize = 11.sp)

                // Client Action: Accept, Request Revisions, or Decline Quote
                if (booking.status == BookingStatus.QUOTATION_SUBMITTED) {
                    Spacer(modifier = Modifier.height(14.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            GoldButton(
                                text = "Accept Quotation",
                                onClick = { viewModel.acceptBookingQuotation(booking.id) },
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedGoldButton(
                                text = "Request Revisions",
                                onClick = { showRevisionDialog = true },
                                modifier = Modifier.weight(1f)
                            )
                        }
                        OutlinedGoldButton(
                            text = "Decline Quotation",
                            onClick = { viewModel.declineBookingQuotation(booking.id, "Budget out of scope") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        } ?: run {
            // When no quotation yet exists and status is PENDING
            if (booking.status == BookingStatus.PENDING) {
                KaziCard {
                    Text("Quotation Pending", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Text("Client submitted brief. Service provider / gear owner can prepare and send formal quotation.", color = KaziTextSecondary, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(10.dp))
                    GoldButton(
                        text = "Build & Send Quotation",
                        onClick = { viewModel.navigateTo(KaziHubDestination.QUOTATION_BUILDER) },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }

        // Action: Handover & Dispatch when CONFIRMED
        if (booking.status == BookingStatus.CONFIRMED) {
            KaziCard {
                Text("Pre-Shoot Handover & Dispatch", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("Escrow milestone held. Complete pre-handover equipment condition inspection before set transit.", color = KaziTextSecondary, fontSize = 12.sp)
                Spacer(modifier = Modifier.height(10.dp))
                GoldButton(
                    text = "Confirm Handover / Dispatch to Set",
                    onClick = { showHandoverDialog = true },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }

        // Action: Delivery when IN_PROGRESS
        if (booking.status == BookingStatus.IN_PROGRESS) {
            KaziCard {
                Text("Production In Progress", color = KaziGreen, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("Project is active on set. Once shoot wraps or gear is returned, submit work delivery for sign-off.", color = KaziTextSecondary, fontSize = 12.sp)
                Spacer(modifier = Modifier.height(10.dp))
                GoldButton(
                    text = "Confirm Work Delivery / Gear Return",
                    onClick = { viewModel.markWorkDelivered(booking.id, "Physical delivery verified & cloud proxies uploaded") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }

        // Completion Report Summary (if submitted)
        booking.completionReport?.let { report ->
            KaziCard {
                Text(text = "Completion Sign-Off Record", color = KaziGreen, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(6.dp))
                Text(text = "Delivered: ${report.agreedDeliverablesSummary}", color = KaziTextPrimary, fontSize = 12.sp)
                Text(text = "Tracking: ${report.deliveryReferenceOrDriveLink}", color = KaziBronze, fontSize = 11.sp)
                if (report.isDisputeFlagged) {
                    Text(text = "Status: Mediation Dispute Flagged", color = KaziRed, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Dispute Card (if disputed)
        booking.dispute?.let { disp ->
            KaziCard(onClick = { viewModel.navigateTo(KaziHubDestination.DISPUTE_DETAIL) }) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Formal Dispute Active", color = KaziRed, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text(text = "Reason: ${disp.reason}", color = KaziTextPrimary, fontSize = 12.sp)
                        Text(text = "Mediation Assigned: ${disp.assignedStaffMember ?: "KAZI Resolution Desk"}", color = KaziBronze, fontSize = 11.sp)
                    }
                    Text("View Details →", color = KaziGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Status History Timeline
        KaziCard {
            Text(text = "Booking Timeline & Status History", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(10.dp))
            booking.statusHistory.forEach { event ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(KaziGold)
                            .padding(top = 4.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(text = event.status.labelEn, color = KaziTextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text(text = event.timestamp, color = KaziTextSecondary, fontSize = 10.sp)
                        }
                        Text(text = "${event.note} (by ${event.actorName})", color = KaziTextSecondary, fontSize = 11.sp)
                    }
                }
            }
        }

        // Action Buttons Row
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            if (booking.status == BookingStatus.AWAITING_COMPLETION || booking.status == BookingStatus.IN_PROGRESS) {
                GoldButton(
                    text = "Sign Off Completion Report",
                    onClick = { onOpenCompletionReport(booking) },
                    modifier = Modifier.weight(1f)
                )
            }
            if (booking.status != BookingStatus.COMPLETED && booking.status != BookingStatus.DISPUTED && booking.status != BookingStatus.CANCELLED) {
                OutlinedGoldButton(
                    text = "Raise Dispute",
                    onClick = { onOpenDispute(booking) },
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Revision Dialog
        if (showRevisionDialog) {
            AlertDialog(
                onDismissRequest = { showRevisionDialog = false },
                title = { Text("Request Quotation Revisions", color = KaziGold) },
                text = {
                    Column {
                        Text("Explain requested line-item adjustments or scope modifications:", color = KaziTextSecondary, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = revisionInput,
                            onValueChange = { revisionInput = it },
                            placeholder = { Text("e.g. Please adjust daily rate for 2 shoot days instead of 3") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        if (revisionInput.isNotBlank()) {
                            viewModel.requestQuotationRevisions(booking.id, revisionInput)
                            showRevisionDialog = false
                        }
                    }) {
                        Text("Send Request", color = KaziGold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showRevisionDialog = false }) {
                        Text("Cancel", color = KaziTextSecondary)
                    }
                },
                containerColor = KaziCard
            )
        }

        // Handover Dialog
        if (showHandoverDialog) {
            AlertDialog(
                onDismissRequest = { showHandoverDialog = false },
                title = { Text("Confirm Handover & Dispatch", color = KaziGold) },
                text = {
                    Column {
                        Text("Confirm equipment / crew on-set check-in details:", color = KaziTextSecondary, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = handoverNotes,
                            onValueChange = { handoverNotes = it },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        viewModel.confirmBookingHandover(booking.id, handoverNotes)
                        showHandoverDialog = false
                    }) {
                        Text("Confirm & Start Shoot", color = KaziGold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showHandoverDialog = false }) {
                        Text("Cancel", color = KaziTextSecondary)
                    }
                },
                containerColor = KaziCard
            )
        }
    }
}

// -------------------------------------------------------------
// QUOTATION BUILDER SCREEN (Phase 1.2)
// -------------------------------------------------------------
@Composable
fun QuotationBuilderScreen(
    viewModel: KaziHubViewModel,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val booking = uiState.selectedBooking ?: return

    var lineItem1 by remember { mutableStateOf("Lead Cinema Package & Day Rate (Day 1-2)") }
    var item1Cost by remember { mutableStateOf("2400000") }
    var lineItem2 by remember { mutableStateOf("Pre-shoot location tech scout") }
    var item2Cost by remember { mutableStateOf("400000") }
    var lineItem3 by remember { mutableStateOf("Wireless monitoring & director client monitor") }
    var item3Cost by remember { mutableStateOf("350000") }
    var validUntil by remember { mutableStateOf("2024-12-01") }
    var termsNotes by remember { mutableStateOf("50% escrow deposit required upon confirmation. Transit fees billed at cost.") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val totalCalculated = remember(item1Cost, item2Cost, item3Cost) {
        (item1Cost.toLongOrNull() ?: 0L) + (item2Cost.toLongOrNull() ?: 0L) + (item3Cost.toLongOrNull() ?: 0L)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = KaziGold)
            }
            Text("Official Quotation Builder", color = KaziTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }

        KaziCard {
            Text("Booking Contract: ${booking.title}", color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Text("Client: ${booking.clientName} • Currency: ${booking.currencyCode}", color = KaziBronze, fontSize = 12.sp)
        }

        Text("Line Items & Deliverables", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)

        // Line Item 1
        KaziCard {
            OutlinedTextField(
                value = lineItem1,
                onValueChange = { lineItem1 = it },
                label = { Text("Line Item 1 Description *") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = item1Cost,
                onValueChange = { item1Cost = it },
                label = { Text("Amount (${booking.currencyCode}) *") },
                modifier = Modifier.fillMaxWidth()
            )
        }

        // Line Item 2
        KaziCard {
            OutlinedTextField(
                value = lineItem2,
                onValueChange = { lineItem2 = it },
                label = { Text("Line Item 2 Description") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = item2Cost,
                onValueChange = { item2Cost = it },
                label = { Text("Amount (${booking.currencyCode})") },
                modifier = Modifier.fillMaxWidth()
            )
        }

        // Line Item 3
        KaziCard {
            OutlinedTextField(
                value = lineItem3,
                onValueChange = { lineItem3 = it },
                label = { Text("Line Item 3 Description") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = item3Cost,
                onValueChange = { item3Cost = it },
                label = { Text("Amount (${booking.currencyCode})") },
                modifier = Modifier.fillMaxWidth()
            )
        }

        // Terms & Validity
        KaziCard {
            OutlinedTextField(
                value = validUntil,
                onValueChange = { validUntil = it },
                label = { Text("Quotation Valid Until Date (YYYY-MM-DD) *") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = termsNotes,
                onValueChange = { termsNotes = it },
                label = { Text("Payment Terms & Shoot Notes") },
                minLines = 2,
                modifier = Modifier.fillMaxWidth()
            )
        }

        // Summary Total Box
        Surface(
            color = KaziCardElevated,
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Total Quotation Amount", color = KaziTextSecondary, fontSize = 11.sp)
                    Text("${booking.currencyCode} ${String.format("%,d", totalCalculated)}", color = KaziGold, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
                Text("Escrow Protection Included", color = KaziGreen, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
            }
        }

        errorMessage?.let {
            Text(it, color = KaziRed, fontSize = 12.sp)
        }

        GoldButton(
            text = "Submit Official Quotation to Client",
            onClick = {
                if (lineItem1.isBlank() || totalCalculated <= 0) {
                    errorMessage = "Please enter valid line items and amounts."
                } else {
                    val items = listOfNotNull(
                        if (lineItem1.isNotBlank()) "$lineItem1 - ${booking.currencyCode} $item1Cost" else null,
                        if (lineItem2.isNotBlank() && item2Cost.isNotBlank()) "$lineItem2 - ${booking.currencyCode} $item2Cost" else null,
                        if (lineItem3.isNotBlank() && item3Cost.isNotBlank()) "$lineItem3 - ${booking.currencyCode} $item3Cost" else null
                    )
                    viewModel.prepareAndSendQuotation(
                        bookingId = booking.id,
                        lineItems = items,
                        totalAmount = totalCalculated,
                        notes = termsNotes,
                        validUntil = validUntil
                    )
                }
            },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

// -------------------------------------------------------------
// DISPUTE DETAILS SCREEN (Phase 1.2)
// -------------------------------------------------------------
@Composable
fun DisputeDetailScreen(
    viewModel: KaziHubViewModel,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val booking = uiState.selectedBooking ?: return
    val dispute = booking.dispute

    var additionalEvidenceInput by remember { mutableStateOf("") }
    var evidenceSubmittedNotice by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = KaziGold)
            }
            Text("Dispute Mediation Record", color = KaziTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }

        Surface(
            color = KaziRed.copy(alpha = 0.15f),
            border = ButtonDefaults.outlinedButtonBorder.copy(
                brush = androidx.compose.ui.graphics.SolidColor(KaziRed)
            ),
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("STATUS: FORMAL MEDIATION IN PROGRESS", color = KaziRed, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("Escrow funds are frozen pending administrative resolution. Both parties must submit documentation.", color = KaziTextSecondary, fontSize = 11.sp)
            }
        }

        KaziCard {
            Text("Booking Reference: ${booking.bookingReference}", color = KaziGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Text(booking.title, color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Text("Agreed Escrow Amount: ${booking.currencyCode} ${String.format("%,d", booking.agreedAmount)}", color = KaziBronze, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(10.dp))
            Divider(color = KaziBorder)
            Spacer(modifier = Modifier.height(10.dp))
            Text("Dispute Claim Reason:", color = KaziTextSecondary, fontSize = 11.sp)
            Text(dispute?.reason ?: "On-set scope or equipment condition discrepancy flagged by client.", color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Assigned Staff: ${dispute?.assignedStaffMember ?: "KAZI East Africa Resolution Desk"}", color = KaziGold, fontSize = 11.sp)
        }

        KaziCard {
            Text("Submitted Evidence & Documentation", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            dispute?.evidenceReferences?.forEach { ev ->
                Text("• $ev", color = KaziTextPrimary, fontSize = 12.sp)
            }
            if (dispute?.evidenceReferences.isNullOrEmpty()) {
                Text("• In-app chat transcript\n• Pre-shoot equipment checklist log", color = KaziTextSecondary, fontSize = 12.sp)
            }
        }

        // Additional Evidence Submission
        KaziCard {
            Text("Submit Additional Evidence Reference", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = additionalEvidenceInput,
                onValueChange = { additionalEvidenceInput = it },
                label = { Text("Cloud Storage URL or On-Set Report Notes") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(10.dp))
            GoldButton(
                text = "Add Evidence to Mediation Dossier",
                onClick = {
                    if (additionalEvidenceInput.isNotBlank()) {
                        evidenceSubmittedNotice = true
                        additionalEvidenceInput = ""
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )
            if (evidenceSubmittedNotice) {
                Spacer(modifier = Modifier.height(6.dp))
                Text("Evidence logged into administrative dossier.", color = KaziGreen, fontSize = 11.sp)
            }
        }
    }
}

// -------------------------------------------------------------
// PUBLIC LEGAL & TERMS SCREEN (Phase 1.2)
// -------------------------------------------------------------
@Composable
fun LegalTermsScreen(
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = KaziGold)
            }
            Text("Legal & Marketplace Terms", color = KaziTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }

        KaziCard {
            Text("1. Escrow & Payment Protection Policy", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                "All bookings on KAZI HUB utilize milestone-based escrow holds. Clients deposit the agreed amount into the protected settlement vault. Funds are only released upon mutual sign-off of the completion report.",
                color = KaziTextSecondary,
                fontSize = 12.sp,
                lineHeight = 18.sp
            )
        }

        KaziCard {
            Text("2. Equipment Rental Condition & Security Deposits", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                "Equipment owners and renters must conduct a pre-rental physical check before gear custody transfers. Any existing cosmetic marks must be photographed and submitted in the rental report. Security deposits are released 24 hours after inspection wrap.",
                color = KaziTextSecondary,
                fontSize = 12.sp,
                lineHeight = 18.sp
            )
        }

        KaziCard {
            Text("3. Dispute Mediation & Cancellation Terms", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                "Cancellations requested 48 hours prior to call time qualify for a full refund minus processing fees. Disputed bookings are assigned to the KAZI Hub East Africa mediation desk whose decision is binding based on uploaded timeline evidence.",
                color = KaziTextSecondary,
                fontSize = 12.sp,
                lineHeight = 18.sp
            )
        }

        KaziCard {
            Text("4. Community & Content Standards", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                "All creative portfolios and equipment listings must reflect verified ownership and original credits. Accounts engaging in off-platform payment evasion or non-delivery are subject to permanent suspension.",
                color = KaziTextSecondary,
                fontSize = 12.sp,
                lineHeight = 18.sp
            )
        }
    }
}

