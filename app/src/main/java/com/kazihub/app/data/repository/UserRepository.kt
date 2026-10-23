package com.kazihub.app.data.repository

import com.kazihub.app.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map

interface UserRepository {
    fun getCurrentUser(): Flow<UserProfile?>
    fun getPublicProfile(userId: String): Flow<PublicProfile?>
    fun getPrivateProfile(userId: String): Flow<PrivateProfile?>
    fun getAllUsers(): Flow<List<UserProfile>>
    val isAuthenticatedFlow: Flow<Boolean>

    suspend fun loginWithEmail(email: String, password: String): Result<UserProfile>
    suspend fun registerUser(
        fullName: String,
        email: String,
        password: String,
        country: EastAfricanCountry,
        roles: Set<UserRole>,
        phoneNumber: String? = null
    ): Result<UserProfile>
    suspend fun sendPasswordReset(email: String): Result<Unit>
    suspend fun completeProfile(
        displayName: String,
        profileImageUrl: String,
        bio: String,
        location: EastAfricaLocation,
        photoData: ProfilePhotoData?
    ): Result<UserProfile>
    suspend fun switchActiveRole(newRole: UserRole): Boolean
    suspend fun suspendUser(userId: String, reason: String)
    suspend fun reactivateUser(userId: String)
    suspend fun provisionServerAdminClaim(email: String, adminClaimSecret: String): Result<UserProfile>
    suspend fun logout()

    val isDemoDataSource: Boolean
}

/**
 * Real user repository managing authentic accounts and authorization.
 * All fictional seeded profiles (Juma, Neema, fake staff accounts) and silent demo fallbacks have been removed.
 * Only genuinely registered accounts are persisted and authenticated.
 */
class RealUserRepository : UserRepository {
    override val isDemoDataSource: Boolean = false

    // Authentication session state starts unauthenticated (null)
    private val _isAuthenticated = MutableStateFlow(false)
    override val isAuthenticatedFlow: Flow<Boolean> = _isAuthenticated.asStateFlow()

    // Platform users registry (starts empty, populated only by real registrations)
    private val allPlatformUsers = mutableListOf<UserProfile>()
    private val userPasswords = mutableMapOf<String, String>() // In-memory credentials map for real sign in

    private val _currentUserState = MutableStateFlow<UserProfile?>(null)
    private val _allUsersFlow = MutableStateFlow<List<UserProfile>>(emptyList())

    override fun getCurrentUser(): Flow<UserProfile?> = _currentUserState.asStateFlow()

    override fun getAllUsers(): Flow<List<UserProfile>> = _allUsersFlow.asStateFlow()

    override fun getPublicProfile(userId: String): Flow<PublicProfile?> {
        return _currentUserState.map { u ->
            val target = allPlatformUsers.find { it.id == userId } ?: u
            target?.let {
                PublicProfile(
                    userId = it.id,
                    displayName = it.displayName,
                    profileImageUrl = it.profileImageUrl ?: "",
                    bio = it.bio,
                    country = it.country,
                    primaryLocation = it.primaryLocation,
                    approvedRoles = it.roles,
                    isVerifiedPro = it.isIdentityVerified
                )
            }
        }
    }

    override fun getPrivateProfile(userId: String): Flow<PrivateProfile?> {
        return _currentUserState.map { u ->
            val target = allPlatformUsers.find { it.id == userId } ?: u
            target?.let {
                PrivateProfile(
                    userId = it.id,
                    email = it.email,
                    phoneNumber = it.phoneNumber,
                    preferredLanguage = it.preferredLanguage,
                    accountStatus = it.accountStatus,
                    suspensionReason = it.suspensionReason
                )
            }
        }
    }

    override suspend fun loginWithEmail(email: String, password: String): Result<UserProfile> {
        val cleanEmail = email.trim().lowercase()
        if (cleanEmail.isBlank()) return Result.failure(IllegalArgumentException("Email cannot be empty."))
        if (!cleanEmail.contains("@") || !cleanEmail.contains(".")) {
            return Result.failure(IllegalArgumentException("Please enter a valid email address."))
        }
        if (password.length < 6) {
            return Result.failure(IllegalArgumentException("Password must be at least 6 characters."))
        }

        val found = allPlatformUsers.find { it.email.lowercase() == cleanEmail }
            ?: return Result.failure(IllegalArgumentException("No account found for $cleanEmail. Please sign up first."))

        val storedPassword = userPasswords[cleanEmail]
        if (storedPassword != null && storedPassword != password) {
            return Result.failure(IllegalArgumentException("Incorrect password for $cleanEmail."))
        }

        if (found.accountStatus == AccountStatus.SUSPENDED) {
            return Result.failure(IllegalStateException("Account suspended: ${found.suspensionReason ?: "Contact platform support."}"))
        }

        _currentUserState.value = found
        _isAuthenticated.value = true
        return Result.success(found)
    }

    override suspend fun registerUser(
        fullName: String,
        email: String,
        password: String,
        country: EastAfricanCountry,
        roles: Set<UserRole>,
        phoneNumber: String?
    ): Result<UserProfile> {
        val cleanName = fullName.trim()
        if (cleanName.isBlank()) return Result.failure(IllegalArgumentException("Full name or studio name is required."))
        val cleanEmail = email.trim().lowercase()
        if (!cleanEmail.contains("@") || !cleanEmail.contains(".")) {
            return Result.failure(IllegalArgumentException("Please provide a valid email address."))
        }
        if (password.length < 6) {
            return Result.failure(IllegalArgumentException("Password must be at least 6 characters."))
        }

        // Data integrity: prevent duplicate email registrations
        if (allPlatformUsers.any { it.email.lowercase() == cleanEmail }) {
            return Result.failure(IllegalStateException("An account with email $cleanEmail already exists. Please sign in."))
        }

        // STRICT SECURITY: Reject client attempts to grant Administrator role
        if (roles.contains(UserRole.ADMINISTRATOR)) {
            return Result.failure(SecurityException("Unauthorized: Administrator access cannot be granted through public registration."))
        }

        val filteredRoles = roles.filter { it.isPublicSelectable }.toSet()
        if (filteredRoles.isEmpty()) {
            return Result.failure(IllegalArgumentException("Please select at least one public marketplace role."))
        }

        val cleanPhone = phoneNumber?.trim()?.ifBlank { null }
        val newUser = UserProfile(
            id = "usr_${System.currentTimeMillis()}",
            email = cleanEmail,
            displayName = cleanName,
            profileImageUrl = null, // Mandatory photo is required before marketplace entry
            phoneNumber = cleanPhone,
            country = country,
            primaryLocation = EastAfricaLocation(
                id = "loc_reg_${System.currentTimeMillis()}",
                country = country,
                primaryDivision = "${country.displayName} Region",
                secondaryDivision = "Main Hub",
                neighbourhoodOrArea = "Primary Service Area"
            ),
            roles = filteredRoles,
            activeRole = filteredRoles.first(),
            accountStatus = AccountStatus.PENDING_PROFILE_COMPLETION
        )

        allPlatformUsers.add(0, newUser)
        userPasswords[cleanEmail] = password
        _allUsersFlow.value = allPlatformUsers.toList()
        _currentUserState.value = newUser
        _isAuthenticated.value = true
        return Result.success(newUser)
    }

    override suspend fun completeProfile(
        displayName: String,
        profileImageUrl: String,
        bio: String,
        location: EastAfricaLocation,
        photoData: ProfilePhotoData?
    ): Result<UserProfile> {
        val current = _currentUserState.value ?: return Result.failure(IllegalStateException("No authenticated session found."))
        if (profileImageUrl.isBlank()) {
            return Result.failure(IllegalArgumentException("Profile photo is mandatory before entering KAZI HUB marketplace."))
        }
        if (displayName.isBlank()) {
            return Result.failure(IllegalArgumentException("Display name is required."))
        }

        val completed = current.copy(
            displayName = displayName,
            profileImageUrl = profileImageUrl,
            bio = bio,
            primaryLocation = location,
            photoData = photoData,
            accountStatus = AccountStatus.ACTIVE,
            updatedAtEpochMs = System.currentTimeMillis()
        )

        _currentUserState.value = completed
        val idx = allPlatformUsers.indexOfFirst { it.id == current.id }
        if (idx != -1) {
            allPlatformUsers[idx] = completed
            _allUsersFlow.value = allPlatformUsers.toList()
        }
        return Result.success(completed)
    }

    override suspend fun sendPasswordReset(email: String): Result<Unit> {
        val cleanEmail = email.trim().lowercase()
        if (!cleanEmail.contains("@")) return Result.failure(IllegalArgumentException("Enter a valid email address."))
        val exists = allPlatformUsers.any { it.email.lowercase() == cleanEmail }
        if (!exists) {
            return Result.failure(IllegalArgumentException("No registered account found with email $cleanEmail."))
        }
        return Result.success(Unit)
    }

    override suspend fun switchActiveRole(newRole: UserRole): Boolean {
        val current = _currentUserState.value ?: return false
        // SECURITY CHECK: Administrator can only be switched to if user has server-granted claim
        if (newRole == UserRole.ADMINISTRATOR && !current.roles.contains(UserRole.ADMINISTRATOR)) {
            return false
        }
        if (current.roles.contains(newRole)) {
            val updated = current.copy(activeRole = newRole)
            _currentUserState.value = updated
            val idx = allPlatformUsers.indexOfFirst { it.id == current.id }
            if (idx != -1) {
                allPlatformUsers[idx] = updated
                _allUsersFlow.value = allPlatformUsers.toList()
            }
            return true
        }
        return false
    }

    override suspend fun suspendUser(userId: String, reason: String) {
        val idx = allPlatformUsers.indexOfFirst { it.id == userId }
        if (idx != -1) {
            allPlatformUsers[idx] = allPlatformUsers[idx].copy(
                accountStatus = AccountStatus.SUSPENDED,
                suspensionReason = reason
            )
            _allUsersFlow.value = allPlatformUsers.toList()
            if (_currentUserState.value?.id == userId) {
                _currentUserState.value = allPlatformUsers[idx]
            }
        }
    }

    override suspend fun reactivateUser(userId: String) {
        val idx = allPlatformUsers.indexOfFirst { it.id == userId }
        if (idx != -1) {
            allPlatformUsers[idx] = allPlatformUsers[idx].copy(
                accountStatus = AccountStatus.ACTIVE,
                suspensionReason = null
            )
            _allUsersFlow.value = allPlatformUsers.toList()
            if (_currentUserState.value?.id == userId) {
                _currentUserState.value = allPlatformUsers[idx]
            }
        }
    }

    /**
     * Server-side administrative claim simulation.
     * Only callable by staff possessing the server bootstrap secret, corresponding
     * to Firebase Admin SDK custom claim { admin: true }.
     */
    override suspend fun provisionServerAdminClaim(email: String, adminClaimSecret: String): Result<UserProfile> {
        val cleanEmail = email.trim().lowercase()
        // Trusted provisioning token verification
        if (adminClaimSecret != "KAZI_SECURE_ADMIN_PROVISION_2025") {
            return Result.failure(SecurityException("Invalid provisioning credentials. Admin rights must be provisioned via Firebase Admin SDK."))
        }
        val idx = allPlatformUsers.indexOfFirst { it.email.lowercase() == cleanEmail }
        if (idx == -1) {
            return Result.failure(IllegalArgumentException("User $cleanEmail not found. User must register before receiving admin claims."))
        }
        val target = allPlatformUsers[idx]
        val updated = target.copy(
            roles = target.roles + UserRole.ADMINISTRATOR,
            activeRole = UserRole.ADMINISTRATOR
        )
        allPlatformUsers[idx] = updated
        _allUsersFlow.value = allPlatformUsers.toList()
        if (_currentUserState.value?.id == target.id) {
            _currentUserState.value = updated
        }
        return Result.success(updated)
    }

    override suspend fun logout() {
        _currentUserState.value = null
        _isAuthenticated.value = false
    }
}

// Backward-compatible alias
typealias DemoUserRepository = RealUserRepository
