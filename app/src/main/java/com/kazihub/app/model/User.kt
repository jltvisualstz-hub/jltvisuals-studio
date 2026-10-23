package com.kazihub.app.model

enum class UserRole(val code: String, val titleEn: String, val titleSw: String, val isPublicSelectable: Boolean) {
    CLIENT("client", "Client / Commissioner", "Mteja / Mtoa Kazi", true),
    FREELANCER("freelancer", "Creative Professional", "Mtaalamu Huru", true),
    EQUIPMENT_OWNER("equipment_owner", "Equipment Owner", "Mmiliki wa Vifaa", true),
    PRODUCTION_COMPANY("production_company", "Production Company", "Kampuni ya Uzalishaji", true),
    ADMINISTRATOR("admin", "Platform Administrator", "Msimamizi wa Mfumo", false) // RESTRICTED: Never offered in public registration
}

enum class AccountStatus(val label: String) {
    ACTIVE("Active / In Good Standing"),
    PENDING_PROFILE_COMPLETION("Pending Profile Completion"),
    PENDING_VERIFICATION("Pending ID Verification"),
    SUSPENDED("Suspended by Administrator")
}

data class ProfilePhotoData(
    val storagePath: String, // e.g. "profile_images/uid_123.jpg"
    val downloadUrl: String,
    val uploadedAtEpochMs: Long = System.currentTimeMillis(),
    val fileSizeBytes: Long = 0,
    val isVerified: Boolean = false
)

data class PublicProfile(
    val userId: String,
    val displayName: String,
    val profileImageUrl: String,
    val bio: String,
    val country: EastAfricanCountry,
    val primaryLocation: EastAfricaLocation,
    val approvedRoles: Set<UserRole>,
    val professionalTagline: String = "",
    val averageRating: Float = 0.0f,
    val reviewsCount: Int = 0,
    val completedProjectsCount: Int = 0,
    val isVerifiedPro: Boolean = false
)

data class PrivateProfile(
    val userId: String,
    val email: String,
    val phoneNumber: String?,
    val nationalIdReference: String? = null,
    val preferredLanguage: String = "EN",
    val accountStatus: AccountStatus = AccountStatus.ACTIVE,
    val suspensionReason: String? = null,
    val createdAtEpochMs: Long = System.currentTimeMillis(),
    val updatedAtEpochMs: Long = System.currentTimeMillis()
)

data class UserProfile(
    val id: String,
    val email: String,
    val displayName: String,
    val profileImageUrl: String?,
    val phoneNumber: String?,
    val country: EastAfricanCountry,
    val primaryLocation: EastAfricaLocation,
    val roles: Set<UserRole>,
    val activeRole: UserRole,
    val accountStatus: AccountStatus = AccountStatus.ACTIVE,
    val isIdentityVerified: Boolean = false,
    val isEmailVerified: Boolean = false,
    val bio: String = "",
    val suspensionReason: String? = null,
    val preferredLanguage: String = "EN",
    val photoData: ProfilePhotoData? = null,
    val createdAtEpochMs: Long = System.currentTimeMillis(),
    val updatedAtEpochMs: Long = System.currentTimeMillis()
) {
    fun hasRole(role: UserRole): Boolean = roles.contains(role)
    val isAdministrator: Boolean get() = roles.contains(UserRole.ADMINISTRATOR)
    val hasCompletedProfile: Boolean get() = !profileImageUrl.isNullOrBlank() && displayName.isNotBlank()
}
