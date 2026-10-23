package com.kazihub.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kazihub.app.model.*
import com.kazihub.app.theme.*
import com.kazihub.app.ui.components.*
import com.kazihub.app.ui.viewmodel.KaziHubViewModel

// -------------------------------------------------------------
// 1. WELCOME SCREEN (Unauthenticated Public)
// -------------------------------------------------------------
@Composable
fun WelcomeScreen(
    onGetStarted: () -> Unit,
    onSignIn: () -> Unit,
    isSwahili: Boolean,
    onLegalTerms: () -> Unit = {}
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
                .padding(bottom = 24.dp),
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
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 36.sp
                )
                Spacer(modifier = Modifier.height(14.dp))
                Text(
                    text = if (isSwahili)
                        "Unganisha wataalamu wa picha za kusonga, sauti, taa na vifaa vya kisasa kote Tanzania, Kenya, Uganda na Rwanda."
                    else
                        "Connect directly with vetted Directors of Photography, drone pilots, sound recordists, and high-end cinema packages across Tanzania, Kenya, Uganda, and Rwanda.",
                    color = KaziTextSecondary,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )

                Spacer(modifier = Modifier.height(20.dp))
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

            // Actions (Authentication required to access marketplace)
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                GoldButton(
                    text = if (isSwahili) "Fungua Akaunti (Sign Up)" else "Create Account / Register",
                    onClick = onGetStarted,
                    modifier = Modifier.fillMaxWidth(),
                    leadingIcon = Icons.Default.PersonAdd
                )
                OutlinedGoldButton(
                    text = if (isSwahili) "Ingia Kwenye Akaunti Yako" else "Sign In to Existing Account",
                    onClick = onSignIn,
                    modifier = Modifier.fillMaxWidth(),
                    leadingIcon = Icons.Default.Lock
                )
                Text(
                    text = if (isSwahili) "Vigezo vya Kisheria na Masharti ya Escrow" else "Legal Terms, Escrow & Community Standards",
                    color = KaziBronze,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier
                        .align(Alignment.CenterHorizontally)
                        .clickable { onLegalTerms() }
                        .padding(top = 4.dp)
                )
            }
        }
    }
}

// -------------------------------------------------------------
// 2. LOGIN SCREEN (Mandatory Auth)
// -------------------------------------------------------------
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onGoToRegister: () -> Unit,
    onForgotPassword: () -> Unit,
    isSwahili: Boolean,
    viewModel: KaziHubViewModel
) {
    var email by remember { mutableStateOf("juma.kinyua@eastafricacinema.com") }
    var password by remember { mutableStateOf("password123") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = if (isSwahili) "Karibu Tena" else "Sign In to KAZI HUB",
            color = KaziTextPrimary,
            fontSize = 26.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = if (isSwahili) "Ingia ili kufikia miradi, kazi na vifaa vyako" else "Authentication is required to access bookings, talent and equipment",
            color = KaziTextSecondary,
            fontSize = 13.sp
        )

        Spacer(modifier = Modifier.height(28.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it; errorMessage = null },
            label = { Text(if (isSwahili) "Barua Pepe" else "Email Address *") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(14.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it; errorMessage = null },
            label = { Text(if (isSwahili) "Nenosiri" else "Password *") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        errorMessage?.let {
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = it, color = KaziRed, fontSize = 12.sp)
        }

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = if (isSwahili) "Umesahau Nenosiri?" else "Forgot Password / Recovery?",
            color = KaziGold,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier
                .align(Alignment.End)
                .clickable { onForgotPassword() }
        )

        Spacer(modifier = Modifier.height(28.dp))

        if (isLoading) {
            Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = KaziGold)
            }
        } else {
            GoldButton(
                text = if (isSwahili) "Ingia" else "Sign In",
                onClick = {
                    if (email.isBlank() || password.isBlank()) {
                        errorMessage = "Please enter both your email address and password."
                    } else {
                        isLoading = true
                        viewModel.login(email, password) { success, error ->
                            isLoading = false
                            if (success) {
                                onLoginSuccess()
                            } else {
                                errorMessage = error ?: "Authentication failed. Please verify credentials."
                            }
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )
        }

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
                text = if (isSwahili) "Fungua Hapa" else "Sign Up",
                color = KaziGold,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable { onGoToRegister() }
            )
        }
    }
}

// -------------------------------------------------------------
// 3. REGISTRATION SCREEN (Public Roles Only)
// -------------------------------------------------------------
@Composable
fun RegistrationScreen(
    onRegisterSuccess: () -> Unit,
    onBackToLogin: () -> Unit,
    isSwahili: Boolean,
    viewModel: KaziHubViewModel
) {
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    var selectedRoles by remember { mutableStateOf(setOf(UserRole.FREELANCER)) }
    var selectedCountry by remember { mutableStateOf(EastAfricanCountry.TANZANIA) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(24.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = if (isSwahili) "Unda Akaunti ya KAZI HUB" else "Create KAZI HUB Account",
            color = KaziTextPrimary,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = if (isSwahili)
                "Chagua majukumu yako kwenye mfumo (Wateja, Wataalamu Huru, au Wamiliki wa Vifaa)"
            else
                "Select all public marketplace roles you operate in East Africa. Profile photo is required in the next step.",
            color = KaziTextSecondary,
            fontSize = 12.sp
        )

        Spacer(modifier = Modifier.height(20.dp))

        OutlinedTextField(
            value = fullName,
            onValueChange = { fullName = it; errorMessage = null },
            label = { Text(if (isSwahili) "Jina Kamili / Studio *" else "Studio / Professional Name *") },
            placeholder = { Text("e.g. Swahili Coast Cinema") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it; errorMessage = null },
            label = { Text(if (isSwahili) "Barua Pepe *" else "Email Address *") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it; errorMessage = null },
            label = { Text(if (isSwahili) "Nenosiri (Herufi 6+) *" else "Password (Min 6 characters) *") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(18.dp))
        Text(
            text = if (isSwahili) "Nchi na Eneo la Uendeshaji *" else "Primary Territory / Country *",
            color = KaziGold,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            EastAfricanCountry.values().forEach { c ->
                val isSelected = selectedCountry == c
                Surface(
                    color = if (isSelected) KaziGold.copy(alpha = 0.2f) else KaziCard,
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = Brush.horizontalGradient(listOf(if (isSelected) KaziGold else KaziBorder, KaziBorder))
                    ),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.clickable { selectedCountry = c }
                ) {
                    Text(
                        text = "${c.displayName} (${c.callingCode})",
                        color = if (isSelected) KaziGold else KaziTextSecondary,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Phone Input with Dynamic Calling Code
        Text(
            text = if (isSwahili) "Nambari ya Simu (${selectedCountry.displayName}) *" else "Phone Number (${selectedCountry.displayName}) *",
            color = KaziGold,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(6.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                color = KaziCard,
                shape = RoundedCornerShape(8.dp),
                border = ButtonDefaults.outlinedButtonBorder.copy(brush = Brush.horizontalGradient(listOf(KaziGold, KaziBorder))),
                modifier = Modifier.padding(end = 8.dp)
            ) {
                Text(
                    text = selectedCountry.callingCode,
                    color = KaziGold,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 14.dp)
                )
            }
            OutlinedTextField(
                value = phoneNumber,
                onValueChange = { phoneNumber = it; errorMessage = null },
                placeholder = { Text(selectedCountry.phonePlaceholder) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = KaziGold,
                    unfocusedBorderColor = KaziBorder,
                    focusedTextColor = KaziTextPrimary,
                    unfocusedTextColor = KaziTextPrimary
                ),
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(18.dp))
        Text(
            text = if (isSwahili) "Majukumu ya Soko (Chagua yanayokuhusu)" else "Public Marketplace Roles (Select all that apply)",
            color = KaziGold,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(8.dp))

        // STRICT SECURITY: Filter only isPublicSelectable roles. ADMINISTRATOR IS NEVER EXPOSED.
        UserRole.values().filter { it.isPublicSelectable }.forEach { role ->
            val isChecked = selectedRoles.contains(role)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 3.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(KaziCard)
                    .border(1.dp, if (isChecked) KaziGold else KaziBorder, RoundedCornerShape(8.dp))
                    .clickable {
                        selectedRoles = if (isChecked && selectedRoles.size > 1) selectedRoles - role else selectedRoles + role
                    }
                    .padding(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = isChecked,
                    onCheckedChange = {
                        selectedRoles = if (it) selectedRoles + role else if (selectedRoles.size > 1) selectedRoles - role else selectedRoles
                    },
                    colors = CheckboxDefaults.colors(checkedColor = KaziGold, checkmarkColor = KaziBackground)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(text = role.titleEn, color = KaziTextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    Text(text = role.titleSw, color = KaziTextSecondary, fontSize = 10.sp)
                }
            }
        }

        errorMessage?.let {
            Spacer(modifier = Modifier.height(10.dp))
            Text(text = it, color = KaziRed, fontSize = 12.sp)
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (isLoading) {
            Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = KaziGold)
            }
        } else {
            GoldButton(
                text = if (isSwahili) "Endelea na Picha ya Wasifu" else "Continue to Profile Photo & Details",
                onClick = {
                    if (fullName.isBlank() || email.isBlank() || password.length < 6) {
                        errorMessage = if (isSwahili)
                            "Tafadhali jaza sehemu zote zinazohitajika (nenosiri kuanzia herufi 6)."
                        else
                            "Please complete all required fields (password minimum 6 characters)."
                    } else {
                        isLoading = true
                        val fullPhone = if (phoneNumber.isNotBlank()) "${selectedCountry.callingCode} ${phoneNumber.trim()}" else null
                        viewModel.register(fullName, email, password, selectedCountry, selectedRoles, fullPhone) { success, error ->
                            isLoading = false
                            if (success) {
                                onRegisterSuccess() // Navigates to PROFILE_COMPLETION
                            } else {
                                errorMessage = error ?: "Registration failed."
                            }
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "Already have an account? Sign in",
            color = KaziGold,
            fontSize = 12.sp,
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .clickable { onBackToLogin() }
        )
    }
}

// -------------------------------------------------------------
// 4. FORGOT PASSWORD / RECOVERY SCREEN
// -------------------------------------------------------------
@Composable
fun ForgotPasswordScreen(
    onBackToLogin: () -> Unit,
    isSwahili: Boolean,
    viewModel: KaziHubViewModel
) {
    var email by remember { mutableStateOf("") }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    var isSubmitted by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Center
    ) {
        IconButton(onClick = onBackToLogin) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = KaziGold)
        }
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = if (isSwahili) "Rejesha Nenosiri Lako" else "Password Recovery",
            color = KaziTextPrimary,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = if (isSwahili)
                "Weka barua pepe yako ili kupokea kiungo cha kurejesha nenosiri lako la KAZI HUB."
            else
                "Enter your registered email address to receive password reset instructions. Session credentials will not be compromised.",
            color = KaziTextSecondary,
            fontSize = 13.sp
        )

        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it; statusMessage = null },
            label = { Text("Email Address *") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        statusMessage?.let {
            Spacer(modifier = Modifier.height(12.dp))
            Surface(
                color = if (isSubmitted) KaziGreen.copy(alpha = 0.15f) else KaziRed.copy(alpha = 0.15f),
                shape = RoundedCornerShape(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = it,
                    color = if (isSubmitted) KaziGreen else KaziRed,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(10.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        GoldButton(
            text = "Send Recovery Instructions",
            onClick = {
                if (email.isBlank() || !email.contains("@")) {
                    statusMessage = "Please enter a valid email address."
                    isSubmitted = false
                } else {
                    viewModel.sendPasswordReset(email) { success, err ->
                        if (success) {
                            statusMessage = "Recovery instructions sent! Check your inbox to reset your password."
                            isSubmitted = true
                        } else {
                            statusMessage = err ?: "Could not send reset instructions."
                            isSubmitted = false
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

// -------------------------------------------------------------
// 5. PROFILE COMPLETION & MANDATORY PHOTO SCREEN (Section 3)
// -------------------------------------------------------------
@Composable
fun ProfileCompletionScreen(
    onCompletionSuccess: () -> Unit,
    isSwahili: Boolean,
    viewModel: KaziHubViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    val currentUser = uiState.currentUser

    var displayName by remember { mutableStateOf(currentUser?.displayName ?: "") }
    var bio by remember { mutableStateOf("Professional cinematographer & equipment owner based in East Africa.") }
    var selectedPhotoUrl by remember { mutableStateOf(currentUser?.profileImageUrl ?: "") }
    var uploadProgress by remember { mutableStateOf(0) }
    var isUploading by remember { mutableStateOf(false) }
    var uploadFailed by remember { mutableStateOf(false) }
    var validationError by remember { mutableStateOf<String?>(null) }

    // Sample vetted photography options for simulation
    val samplePhotos = listOf(
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(KaziBackground)
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = if (isSwahili) "Kamilisha Wasifu na Picha Yako" else "Complete Profile & Photo",
            color = KaziTextPrimary,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = if (isSwahili)
                "Kila mtumiaji lazima awe na picha halisi ya wasifu kabla ya kuingia kwenye soko la KAZI HUB."
            else
                "Every user must have a verified profile picture before entering the marketplace. Store only the storage URL reference (never binary documents in Firestore).",
            color = KaziTextSecondary,
            fontSize = 12.sp,
            lineHeight = 18.sp
        )

        // Photo Picker & Preview Box
        KaziCard {
            Text(text = "Profile Picture (Mandatory) *", color = KaziGold, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(12.dp))

            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .background(KaziBackgroundSecondary)
                        .border(2.dp, if (selectedPhotoUrl.isNotBlank()) KaziGold else KaziRed, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    if (selectedPhotoUrl.isNotBlank()) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = KaziGold, modifier = Modifier.size(36.dp))
                    } else {
                        Icon(Icons.Default.AddAPhoto, contentDescription = null, tint = KaziTextMuted, modifier = Modifier.size(32.dp))
                    }
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    if (selectedPhotoUrl.isBlank()) {
                        Text("No photo uploaded yet", color = KaziRed, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        Text("Choose an image below to upload", color = KaziTextSecondary, fontSize = 10.sp)
                    } else {
                        Text("Photo ready for profile", color = KaziGreen, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        Text("Reference: storage/profile_${currentUser?.id ?: "01"}.jpg", color = KaziBronze, fontSize = 10.sp)
                    }
                }
            }

            // Image picker sample selection
            Spacer(modifier = Modifier.height(14.dp))
            Text("Select / Replace Image:", color = KaziTextSecondary, fontSize = 11.sp)
            Spacer(modifier = Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                samplePhotos.forEachIndexed { idx, url ->
                    val isPicked = selectedPhotoUrl == url
                    Surface(
                        color = if (isPicked) KaziGold.copy(alpha = 0.2f) else KaziCardElevated,
                        shape = RoundedCornerShape(6.dp),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            brush = Brush.horizontalGradient(listOf(if (isPicked) KaziGold else KaziBorder, KaziBorder))
                        ),
                        modifier = Modifier.clickable {
                            isUploading = true
                            uploadProgress = 10
                            uploadFailed = false
                            // Simulate upload progress
                            selectedPhotoUrl = url
                            uploadProgress = 100
                            isUploading = false
                            validationError = null
                        }
                    ) {
                        Text(
                            text = "Photo ${idx + 1}",
                            color = if (isPicked) KaziGold else KaziTextSecondary,
                            fontSize = 11.sp,
                            fontWeight = if (isPicked) FontWeight.Bold else FontWeight.Normal,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            if (isUploading) {
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(progress = uploadProgress / 100f, color = KaziGold, modifier = Modifier.fillMaxWidth())
                Text("Uploading image... $uploadProgress%", color = KaziGold, fontSize = 10.sp)
            }
        }

        // Display Name & Bio
        OutlinedTextField(
            value = displayName,
            onValueChange = { displayName = it; validationError = null },
            label = { Text("Display / Studio Name *") },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
            value = bio,
            onValueChange = { bio = it },
            label = { Text("Professional Biography / Studio Overview") },
            minLines = 3,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = KaziGold,
                unfocusedBorderColor = KaziBorder,
                focusedTextColor = KaziTextPrimary,
                unfocusedTextColor = KaziTextPrimary
            ),
            modifier = Modifier.fillMaxWidth()
        )

        validationError?.let {
            Text(text = it, color = KaziRed, fontSize = 12.sp)
        }

        GoldButton(
            text = "Complete Profile & Enter Marketplace",
            onClick = {
                if (selectedPhotoUrl.isBlank()) {
                    validationError = "A profile photo is mandatory. Please select and upload an image above."
                } else if (displayName.isBlank()) {
                    validationError = "Display name is required."
                } else {
                    viewModel.completeProfile(displayName, selectedPhotoUrl, bio) { success, err ->
                        if (success) {
                            onCompletionSuccess()
                        } else {
                            validationError = err ?: "Could not complete profile."
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        )
    }
}
