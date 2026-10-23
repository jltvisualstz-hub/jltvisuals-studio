package com.kazihub.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import com.kazihub.app.model.UserRole
import com.kazihub.app.theme.*
import com.kazihub.app.ui.navigation.KaziHubDestination
import com.kazihub.app.ui.screens.*
import com.kazihub.app.ui.viewmodel.KaziHubViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: KaziHubViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            KaziHubTheme {
                KaziHubApp(viewModel = viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KaziHubApp(viewModel: KaziHubViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    // Determine if current screen is unauthenticated public flow
    val isPublicAuthScreen = !uiState.isAuthenticated || uiState.currentDestination in listOf(
        KaziHubDestination.WELCOME,
        KaziHubDestination.LOGIN,
        KaziHubDestination.REGISTRATION,
        KaziHubDestination.FORGOT_PASSWORD,
        KaziHubDestination.LEGAL_TERMS,
        KaziHubDestination.PROFILE_COMPLETION
    )

    Scaffold(
        topBar = {
            if (!isPublicAuthScreen) {
                TopAppBar(
                    title = {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "KAZI HUB",
                                    color = KaziGold,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black,
                                    letterSpacing = 1.sp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(KaziCardElevated)
                                        .clickable { viewModel.setRoleSwitchDialogVisible(true) }
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                Adversary:
                                ) {
                                    Text(
                                        text = uiState.activeRole.titleEn.split(" ")[0],
                                        color = KaziBronze,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            Text(
                                text = if (uiState.isSwahili) uiState.currentDestination.titleSw else uiState.currentDestination.titleEn,
                                color = KaziTextSecondary,
                                fontSize = 11.sp
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { viewModel.toggleLanguage() }) {
                            Text(
                                text = if (uiState.isSwahili) "SW" else "EN",
                                color = KaziGold,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        IconButton(onClick = { viewModel.navigateTo(KaziHubDestination.CUSTOMER_CARE) }) {
                            Icon(Icons.Default.SupportAgent, contentDescription = "Customer Care", tint = KaziGold)
                        }
                        IconButton(onClick = { viewModel.navigateTo(KaziHubDestination.NOTIFICATIONS) }) {
                            Icon(Icons.Default.Notifications, contentDescription = "Notifications", tint = KaziTextPrimary)
                        }
                        IconButton(onClick = { viewModel.logout() }) {
                            Icon(Icons.Default.ExitToApp, contentDescription = "Sign Out", tint = KaziTextSecondary)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = KaziBackground)
                )
            }
        },
        bottomBar = {
            if (!isPublicAuthScreen) {
                NavigationBar(
                    containerColor = KaziBackgroundSecondary,
                    contentColor = KaziGold
                ) {
                    val current = uiState.currentDestination

                    NavigationBarItem(
                        selected = current == KaziHubDestination.HOME,
                        onClick = { viewModel.navigateTo(KaziHubDestination.HOME) },
                        icon = { Icon(Icons.Default.Explore, contentDescription = null) },
                        label = { Text("Explore", fontSize = 9.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = KaziGold,
                            selectedTextColor = KaziGold,
                            unselectedIconColor = KaziTextSecondary,
                            unselectedTextColor = KaziTextSecondary,
                            indicatorColor = KaziCard
                        )
                    )

                    NavigationBarItem(
                        selected = current == KaziHubDestination.FREELANCER_DISCOVERY || current == KaziHubDestination.FREELANCER_PROFILE,
                        onClick = { viewModel.navigateTo(KaziHubDestination.FREELANCER_DISCOVERY) },
                        icon = { Icon(Icons.Default.Groups, contentDescription = null) },
                        label = { Text("Talent", fontSize = 9.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = KaziGold,
                            selectedTextColor = KaziGold,
                            unselectedIconColor = KaziTextSecondary,
                            unselectedTextColor = KaziTextSecondary,
                            indicatorColor = KaziCard
                        )
                    )

                    NavigationBarItem(
                        selected = current == KaziHubDestination.EQUIPMENT_MARKETPLACE || current == KaziHubDestination.EQUIPMENT_DETAIL,
                        onClick = { viewModel.navigateTo(KaziHubDestination.EQUIPMENT_MARKETPLACE) },
                        icon = { Icon(Icons.Default.Videocam, contentDescription = null) },
                        label = { Text("Gear", fontSize = 9.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = KaziGold,
                            selectedTextColor = KaziGold,
                            unselectedIconColor = KaziTextSecondary,
                            unselectedTextColor = KaziTextSecondary,
                            indicatorColor = KaziCard
                        )
                    )

                    NavigationBarItem(
                        selected = current == KaziHubDestination.BOOKING_CENTER ||
                                current == KaziHubDestination.BOOKING_DETAIL ||
                                current == KaziHubDestination.QUOTATION_BUILDER ||
                                current == KaziHubDestination.DISPUTE_DETAIL,
                        onClick = { viewModel.navigateTo(KaziHubDestination.BOOKING_CENTER) },
                        icon = { Icon(Icons.Default.EventNote, contentDescription = null) },
                        label = { Text("Bookings", fontSize = 9.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = KaziGold,
                            selectedTextColor = KaziGold,
                            unselectedIconColor = KaziTextSecondary,
                            unselectedTextColor = KaziTextSecondary,
                            indicatorColor = KaziCard
                        )
                    )

                    NavigationBarItem(
                        selected = current == KaziHubDestination.MESSAGES,
                        onClick = { viewModel.navigateTo(KaziHubDestination.MESSAGES) },
                        icon = { Icon(Icons.Default.ChatBubble, contentDescription = null) },
                        label = { Text("Messages", fontSize = 9.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = KaziGold,
                            selectedTextColor = KaziGold,
                            unselectedIconColor = KaziTextSecondary,
                            unselectedTextColor = KaziTextSecondary,
                            indicatorColor = KaziCard
                        )
                    )

                    NavigationBarItem(
                        selected = current == KaziHubDestination.PROFILE_SETTINGS ||
                                current == KaziHubDestination.CUSTOMER_CARE ||
                                current == KaziHubDestination.ADMIN_WORKSPACE,
                        onClick = { viewModel.navigateTo(KaziHubDestination.PROFILE_SETTINGS) },
                        icon = { Icon(Icons.Default.Person, contentDescription = null) },
                        label = { Text("Profile", fontSize = 9.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = KaziGold,
                            selectedTextColor = KaziGold,
                            unselectedIconColor = KaziTextSecondary,
                            unselectedTextColor = KaziTextSecondary,
                            indicatorColor = KaziCard
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(KaziBackground)
        ) {
            when (uiState.currentDestination) {
                KaziHubDestination.WELCOME -> WelcomeScreen(
                    onGetStarted = { viewModel.navigateTo(KaziHubDestination.REGISTRATION) },
                    onSignIn = { viewModel.navigateTo(KaziHubDestination.LOGIN) },
                    isSwahili = uiState.isSwahili,
                    onLegalTerms = { viewModel.navigateTo(KaziHubDestination.LEGAL_TERMS) }
                )
                KaziHubDestination.LOGIN -> LoginScreen(
                    onLoginSuccess = { viewModel.navigateTo(KaziHubDestination.HOME) },
                    onGoToRegister = { viewModel.navigateTo(KaziHubDestination.REGISTRATION) },
                    onForgotPassword = { viewModel.navigateTo(KaziHubDestination.FORGOT_PASSWORD) },
                    isSwahili = uiState.isSwahili,
                    viewModel = viewModel
                )
                KaziHubDestination.REGISTRATION -> RegistrationScreen(
                    onRegisterSuccess = { viewModel.navigateTo(KaziHubDestination.PROFILE_COMPLETION) },
                    onBackToLogin = { viewModel.navigateTo(KaziHubDestination.LOGIN) },
                    isSwahili = uiState.isSwahili,
                    viewModel = viewModel
                )
                KaziHubDestination.FORGOT_PASSWORD -> ForgotPasswordScreen(
                    onBackToLogin = { viewModel.navigateTo(KaziHubDestination.LOGIN) },
                    isSwahili = uiState.isSwahili,
                    viewModel = viewModel
                )
                KaziHubDestination.PROFILE_COMPLETION -> ProfileCompletionScreen(
                    onCompletionSuccess = { viewModel.navigateTo(KaziHubDestination.HOME) },
                    isSwahili = uiState.isSwahili,
                    viewModel = viewModel
                )
                KaziHubDestination.LEGAL_TERMS -> LegalTermsScreen(
                    onBack = {
                        viewModel.navigateTo(if (uiState.isAuthenticated) KaziHubDestination.PROFILE_SETTINGS else KaziHubDestination.WELCOME)
                    }
                )
                KaziHubDestination.HOME -> HomeScreen(
                    viewModel = viewModel,
                    onNavigate = { viewModel.navigateTo(it) }
                )
                KaziHubDestination.SEARCH_FILTERS -> SearchFiltersScreen(
                    viewModel = viewModel,
                    onBack = { viewModel.navigateTo(KaziHubDestination.HOME) },
                    onApply = { viewModel.navigateTo(KaziHubDestination.FREELANCER_DISCOVERY) }
                )
                KaziHubDestination.FREELANCER_DISCOVERY -> FreelancerDiscoveryScreen(
                    viewModel = viewModel,
                    onSelectCreative = { viewModel.selectCreative(it) }
                )
                KaziHubDestination.FREELANCER_PROFILE -> FreelancerProfileScreen(
                    viewModel = viewModel,
                    onBookNow = { viewModel.navigateTo(KaziHubDestination.CREATIVE_BOOKING_REQUEST) },
                    onSelectPortfolio = { viewModel.selectPortfolioItem(it) }
                )
                KaziHubDestination.PORTFOLIO_DETAIL -> PortfolioDetailScreen(
                    viewModel = viewModel,
                    onBack = { viewModel.navigateTo(KaziHubDestination.FREELANCER_PROFILE) }
                )
                KaziHubDestination.EQUIPMENT_MARKETPLACE -> EquipmentMarketplaceScreen(
                    viewModel = viewModel,
                    onSelectEquipment = { viewModel.selectEquipment(it) }
                )
                KaziHubDestination.EQUIPMENT_DETAIL -> EquipmentDetailScreen(
                    viewModel = viewModel,
                    onRentNow = { viewModel.navigateTo(KaziHubDestination.EQUIPMENT_RENTAL_REQUEST) }
                )
                KaziHubDestination.CREATIVE_BOOKING_REQUEST -> CreativeProductionBriefScreen(
                    viewModel = viewModel,
                    onSubmitSuccess = { viewModel.navigateTo(KaziHubDestination.BOOKING_CENTER) },
                    onBack = { viewModel.navigateTo(KaziHubDestination.FREELANCER_DISCOVERY) }
                )
                KaziHubDestination.EQUIPMENT_RENTAL_REQUEST -> EquipmentRentalRequestScreen(
                    viewModel = viewModel,
                    onSubmitSuccess = { viewModel.navigateTo(KaziHubDestination.BOOKING_CENTER) },
                    onBack = { viewModel.navigateTo(KaziHubDestination.EQUIPMENT_MARKETPLACE) }
                )
                KaziHubDestination.POST_JOB -> PostJobScreen(
                    viewModel = viewModel,
                    onSubmit = { viewModel.navigateTo(KaziHubDestination.BOOKING_CENTER) }
                )
                KaziHubDestination.BOOKING_CENTER,
                KaziHubDestination.BOOKING_OVERVIEW -> BookingCenterScreen(
                    viewModel = viewModel,
                    onSelectBooking = { viewModel.selectBooking(it) },
                    onNavigateCreativeBooking = { viewModel.navigateTo(KaziHubDestination.CREATIVE_BOOKING_REQUEST) },
                    onNavigateRentalBooking = { viewModel.navigateTo(KaziHubDestination.EQUIPMENT_RENTAL_REQUEST) }
                )
                KaziHubDestination.BOOKING_DETAIL -> BookingDetailScreen(
                    viewModel = viewModel,
                    onBack = { viewModel.navigateTo(KaziHubDestination.BOOKING_CENTER) },
                    onOpenDispute = { viewModel.navigateTo(KaziHubDestination.DISPUTE_DETAIL) },
                    onOpenCompletionReport = { viewModel.navigateTo(KaziHubDestination.BOOKING_COMPLETION_REPORT) }
                )
                KaziHubDestination.QUOTATION_BUILDER -> QuotationBuilderScreen(
                    viewModel = viewModel,
                    onBack = { viewModel.navigateTo(KaziHubDestination.BOOKING_DETAIL) }
                )
                KaziHubDestination.DISPUTE_DETAIL -> DisputeDetailScreen(
                    viewModel = viewModel,
                    onBack = { viewModel.navigateTo(KaziHubDestination.BOOKING_DETAIL) }
                )
                KaziHubDestination.BOOKING_COMPLETION_REPORT -> BookingCompletionReportScreen(
                    viewModel = viewModel,
                    onSubmitSuccess = { viewModel.navigateTo(KaziHubDestination.BOOKING_DETAIL) },
                    onBack = { viewModel.navigateTo(KaziHubDestination.BOOKING_DETAIL) }
                )
                KaziHubDestination.CUSTOMER_CARE -> CustomerCareScreen(
                    viewModel = viewModel,
                    onNavigateNewTicket = { viewModel.navigateTo(KaziHubDestination.SUPPORT_NEW_TICKET) },
                    onSelectTicket = { viewModel.selectTicket(it) }
                )
                KaziHubDestination.SUPPORT_NEW_TICKET -> SubmitSupportTicketScreen(
                    viewModel = viewModel,
                    onSubmitted = { viewModel.navigateTo(KaziHubDestination.CUSTOMER_CARE) },
                    onBack = { viewModel.navigateTo(KaziHubDestination.CUSTOMER_CARE) }
                )
                KaziHubDestination.SUPPORT_TICKET_DETAIL -> SupportTicketDetailScreen(
                    viewModel = viewModel,
                    onBack = { viewModel.navigateTo(KaziHubDestination.CUSTOMER_CARE) }
                )
                KaziHubDestination.CLIENT_DASHBOARD -> ClientDashboardScreen(
                    viewModel = viewModel,
                    onNavigate = { viewModel.navigateTo(it) }
                )
                KaziHubDestination.FREELANCER_DASHBOARD -> FreelancerDashboardScreen(
                    viewModel = viewModel,
                    onNavigate = { viewModel.navigateTo(it) }
                )
                KaziHubDestination.EQUIPMENT_DASHBOARD -> EquipmentOwnerDashboardScreen(
                    viewModel = viewModel,
                    onNavigate = { viewModel.navigateTo(it) }
                )
                KaziHubDestination.MESSAGES -> MessagesScreen(
                    viewModel = viewModel
                )
                KaziHubDestination.NOTIFICATIONS -> NotificationsScreen(
                    viewModel = viewModel
                )
                KaziHubDestination.PROFILE_SETTINGS -> ProfileSettingsScreen(
                    viewModel = viewModel,
                    onNavigate = { viewModel.navigateTo(it) }
                )
                KaziHubDestination.ADMIN_WORKSPACE,
                KaziHubDestination.ADMIN_DASHBOARD -> AdminWorkspaceScreen(
                    viewModel = viewModel,
                    onBackToMarketplace = { viewModel.navigateTo(KaziHubDestination.HOME) }
                )
            }

            // Role Switcher Dialog with Authorization Protection
            if (uiState.isRoleSwitchDialogVisible) {
                AlertDialog(
                    onDismissRequest = { viewModel.setRoleSwitchDialogVisible(false) },
                    title = { Text("Switch Workspace Role", color = KaziGold) },
                    text = {
                        Column {
                            Text(
                                text = "Select an authorized role to switch your navigation. Only approved roles are selectable:",
                                color = KaziTextSecondary,
                                fontSize = 12.sp
                            )
                            Spacer(modifier = Modifier.height(10.dp))

                            // STRICT: Only public approved roles can be selected!
                            UserRole.values().filter { it.isPublicSelectable }.forEach { role ->
                                val isSelected = uiState.activeRole == role
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { viewModel.switchActiveRole(role) }
                                        .padding(vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(
                                        selected = isSelected,
                                        onClick = { viewModel.switchActiveRole(role) },
                                        colors = RadioButtonDefaults.colors(selectedColor = KaziGold)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column {
                                        Text(role.titleEn, color = KaziTextPrimary, fontSize = 13.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal)
                                        Text(role.titleSw, color = KaziTextSecondary, fontSize = 11.sp)
                                    }
                                }
                            }

                            uiState.roleSwitchErrorMessage?.let { err ->
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(err, color = KaziRed, fontSize = 11.sp)
                            }
                        }
                    },
                    confirmButton = {
                        TextButton(onClick = { viewModel.setRoleSwitchDialogVisible(false) }) {
                            Text("Close", color = KaziGold)
                        }
                    },
                    containerColor = KaziCard
                )
            }
        }
    }
}
