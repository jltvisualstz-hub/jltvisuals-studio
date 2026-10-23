package com.kazihub.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kazihub.app.model.*
import com.kazihub.app.theme.*
import com.kazihub.app.ui.components.*
import com.kazihub.app.ui.navigation.KaziHubDestination
import com.kazihub.app.ui.viewmodel.KaziHubViewModel

// -------------------------------------------------------------
// 1. WELCOME / ONBOARDING SCREEN
// -------------------------------------------------------------
@Composable
fun WelcomeScreen(
    onGetStarted: () -> Unit,
    onSignIn: () -> Unit,
    isSwahili: Boolean
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(KaziBackground, KaziBackgroundSecondary, KaziBackground)
                )
            )
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 32.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header Brand
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "KAZI HUB",
                    color = KaziGold,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp
                )
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(KaziCard)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "EAST AFRICA",
                        color = KaziBronze,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Cinematic Hero Statement
            Column {
                Text(
                    text = if (isSwahili) "Kuinua Kiwango cha Sinema na Uzalishaji Afrika Mashariki" else "The Premier Creative & Cinema Gear Network",
                    color = KaziTextPrimary,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 38.sp
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = if (isSwahili)
                        "Unganisha wataalamu wa picha za kusonga, sauti, taa na vifaa vya kisasa kote Tanzania, Kenya, Uganda na Rwanda."
                    else
                        "Connect directly with vetted Directors of Photography, drone pilots, sound recordists, and high-end cinema packages across Tanzania, Kenya, Uganda, and Rwanda.",
                    color = KaziTextSecondary,
                    fontSize = 15.sp,
                    lineHeight = 22.sp
                )

                Spacer(modifier = Modifier.height(24.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Tanzania • TZS", "Kenya • KES", "Uganda • UGX", "Rwanda • RWF").forEach { badge ->
                        Surface(
                            color = KaziCard,
                            shape = RoundedCornerShape(4.dp),
                            border = ButtonDefaults.outlinedButtonBorder.copy(brush = Brush.horizontalGradient(listOf(KaziBorder, KaziBorderGold)))
                        ) {
                            Text(
                                text = badge,
                                color = KaziGoldLight,
                                fontSize = 10.sp,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }

            // Actions
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                GoldButton(
                    text = if (isSwahili) "Anza Sasa (Chunguza Mtandao)" else "Explore Marketplace",
                    onClick = onGetStarted,
                    modifier = Modifier.fillMaxWidth(),
                    leadingIcon = Icons.Default.Explore
                )
                OutlinedGoldButton(
                    text = if (isSwahili) "Ingia Kwenye Akaunti Yako" else "Sign In to Existing Account",
                    onClick = onSignIn,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

// -------------------------------------------------------------
// 2. LOGIN SCREEN
// -------------------------------------------------------------
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onGoToRegister: () -> Unit,
    isSwahili: Boolean
) {
    var email by remember { mutableStateOf("juma.kinyua@eastafricacinema.com") }
    var password by remember { mutableStateOf("••••••••••••") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = if (isSwahili) "Karibu Tena" else "Welcome Back",
            color = KaziTextPrimary,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = if (isSwahili) "Ingia ili kufikia miradi na vifaa vyako" else "Access your creative bookings, shoots, and cinema gear",
            color = KaziTextSecondary,
            fontSize = 14.sp
        )

        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text(if (isSwahili) "Barua Pepe" else "Email Address") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text(if (isSwahili) "Nenosiri" else "Password") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = if (isSwahili) "Umesahau Nenosiri?" else "Forgot Password?",
            color = KaziGold,
            fontSize = 12.sp,
            modifier = Modifier
                .align(Alignment.End)
                .clickable { }
        )

        Spacer(modifier = Modifier.height(32.dp))

        GoldButton(
            text = if (isSwahili) "Ingia" else "Sign In",
            onClick = onLoginSuccess,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(20.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (isSwahili) "Huna akaunti bado? " else "Don't have an account? ",
                color = KaziTextSecondary,
                fontSize = 13.sp
            )
            Text(
                text = if (isSwahili) "Jiunge Hapa" else "Join Network",
                color = KaziGold,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable { onGoToRegister() }
            )
        }
    }
}

// -------------------------------------------------------------
// 3. REGISTRATION SCREEN (Multi-Role Support)
// -------------------------------------------------------------
@Composable
fun RegistrationScreen(
    onRegisterSuccess: () -> Unit,
    onBackToLogin: () -> Unit,
    isSwahili: Boolean
) {
    var fullName by remember { mutableStateOf("") }
    var selectedRoles by remember { mutableStateOf(setOf(UserRole.FREELANCER, UserRole.EQUIPMENT_OWNER)) }
    var selectedCountry by remember { mutableStateOf(EastAfricanCountry.TANZANIA) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(24.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = if (isSwahili) "Unda Akaunti ya KAZI HUB" else "Join KAZI HUB",
            color = KaziTextPrimary,
            fontSize = 26.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = if (isSwahili)
                "Chagua majukumu yako kwenye mfumo (Unaweza kuwa mbunifu na mmiliki wa vifaa kwa pamoja)"
            else
                "Select all roles that describe your production services. Multi-role accounts are fully supported.",
            color = KaziTextSecondary,
            fontSize = 13.sp
        )

        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(
            value = fullName,
            onValueChange = { fullName = it },
            label = { Text("Studio / Professional Name") },
            placeholder = { Text("e.g. Swahili Coast Cinema") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(20.dp))
        Text(text = "Primary Territory / Country", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            EastAfricanCountry.values().forEach { c ->
                val isSelected = selectedCountry == c
                Surface(
                    color = if (isSelected) KaziGold.copy(alpha = 0.2f) else KaziCard,
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = Brush.horizontalGradient(listOf(if (isSelected) KaziGold else KaziBorder, KaziBorder))
                    ),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.clickable { selectedCountry = c }
                ) {
                    Text(
                        text = "${c.displayName} (${c.currencyCode})",
                        color = if (isSelected) KaziGold else KaziTextSecondary,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text(text = "Marketplace Roles (Select all that apply)", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(8.dp))

        UserRole.values().filter { it.isPublicSelectable }.forEach { role ->
            val isChecked = selectedRoles.contains(role)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(KaziCard)
                    .border(1.dp, if (isChecked) KaziGold else KaziBorder, RoundedCornerShape(8.dp))
                    .clickable {
                        selectedRoles = if (isChecked) selectedRoles - role else selectedRoles + role
                    }
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = isChecked,
                    onCheckedChange = {
                        selectedRoles = if (it) selectedRoles + role else selectedRoles - role
                    },
                    colors = CheckboxDefaults.colors(
                        checkedColor = KaziGold,
                        checkmarkColor = KaziBackground
                    )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(text = role.titleEn, color = KaziTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    Text(text = role.titleSw, color = KaziTextSecondary, fontSize = 11.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        GoldButton(
            text = "Create Account & Enter KAZI HUB",
            onClick = onRegisterSuccess,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Already have an account? Sign in",
            color = KaziGold,
            fontSize = 13.sp,
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .clickable { onBackToLogin() }
        )
    }
}

// -------------------------------------------------------------
// 4. HOME / EXPLORE SCREEN
// -------------------------------------------------------------
@Composable
fun HomeScreen(
    viewModel: KaziHubViewModel,
    onNavigate: (KaziHubDestination) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val creatives by viewModel.creatives.collectAsState()
    val equipment by viewModel.equipmentList.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Search Bar trigger
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(KaziCard)
                    .border(1.dp, KaziBorder, RoundedCornerShape(10.dp))
                    .clickable { onNavigate(KaziHubDestination.SEARCH_FILTERS) }
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(imageVector = Icons.Default.Search, contentDescription = "Search", tint = KaziGold)
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = if (uiState.isSwahili) "Tafuta DoP, kamera, sauti, taa..." else "Search DoP, cameras, sound, drone pilots...",
                    color = KaziTextSecondary,
                    fontSize = 13.sp
                )
            }
        }

        // Territory Selector
        item {
            Column {
                Text(
                    text = if (uiState.isSwahili) "Mikoa na Nchi za Afrika Mashariki" else "East African Production Hubs",
                    color = KaziTextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(10.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    item {
                        FilterChip(
                            selected = uiState.selectedCountry == null,
                            onClick = { viewModel.setCountryFilter(null) },
                            label = { Text("All East Africa") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = KaziGold,
                                selectedLabelColor = KaziBackground,
                                containerColor = KaziCard,
                                labelColor = KaziTextSecondary
                            )
                        )
                    }
                    items(EastAfricanCountry.values()) { country ->
                        FilterChip(
                            selected = uiState.selectedCountry == country,
                            onClick = { viewModel.setCountryFilter(country) },
                            label = { Text("${country.displayName} (${country.currencyCode})") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = KaziGold,
                                selectedLabelColor = KaziBackground,
                                containerColor = KaziCard,
                                labelColor = KaziTextSecondary
                            )
                        )
                    }
                }
            }
        }

        // Featured Talent Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (uiState.isSwahili) "Wataalamu Walioidhinishwa" else "Featured Creative Talent",
                    color = KaziTextPrimary,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "See All",
                    color = KaziGold,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable { onNavigate(KaziHubDestination.FREELANCER_DISCOVERY) }
                )
            }
        }

        if (creatives.isEmpty()) {
            item {
                KaziEmptyState(
                    title = if (uiState.isSwahili) "Hakuna Wataalamu Bado" else "No Professionals Available Yet",
                    description = if (uiState.isSwahili)
                        "Bado hakuna wataalamu waliosajiliwa katika eneo hili. Wataalamu wa sinema watakaosajiliwa wataonekana hapa."
                    else
                        "No creative talent has registered in this production hub yet. Creative professionals who complete profile setup will appear here.",
                    icon = Icons.Default.PersonSearch
                )
            }
        } else {
            items(creatives) { creative ->
                KaziCard(
                    onClick = { viewModel.selectCreative(creative) }
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .clip(CircleShape)
                                .background(KaziBackgroundSecondary)
                                .border(1.dp, KaziBorderGold, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(imageVector = Icons.Default.Person, contentDescription = null, tint = KaziGold)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(text = creative.fullName, color = KaziTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.width(6.dp))
                                if (creative.isVerifiedPro) VerifiedBadge()
                            }
                            Text(text = creative.titleTagline, color = KaziTextSecondary, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "${creative.primaryLocation.neighbourhoodOrArea}, ${creative.primaryLocation.primaryDivision}",
                                color = KaziBronze,
                                fontSize = 11.sp
                            )
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text(text = "${creative.currencyCode} ${creative.indicativeDayRate / 1000}k", color = KaziGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Text(text = "/ day", color = KaziTextSecondary, fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        // Featured Cinema Gear Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (uiState.isSwahili) "Vifaa vya Kisasa vya Kukodisha" else "Cinema Gear Rentals",
                    color = KaziTextPrimary,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Browse Gear",
                    color = KaziGold,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable { onNavigate(KaziHubDestination.EQUIPMENT_MARKETPLACE) }
                )
            }
        }

        if (equipment.isEmpty()) {
            item {
                KaziEmptyState(
                    title = if (uiState.isSwahili) "Hakuna Vifaa vya Kukodisha Bado" else "No Equipment Listings Yet",
                    description = if (uiState.isSwahili)
                        "Bado hakuna vifaa vya kamera au sauti vilivyowekwa hapa. Wamiliki wa vifaa wanaweza kuorodhesha vifaa vyao."
                    else
                        "No cinema packages or gear rentals have been listed in this territory yet.",
                    icon = Icons.Default.CameraAlt
                )
            }
        } else {
            items(equipment) { item ->
                KaziCard(
                    onClick = { viewModel.selectEquipment(item) }
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = item.title, color = KaziTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                            Text(text = "${item.currencyCode} ${item.dailyRate / 1000}k / day", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "${item.category.label} • ${item.location.formattedLocation()}", color = KaziTextSecondary, fontSize = 11.sp)
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
