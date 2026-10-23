package com.kazihub.app.model

enum class CreativeCategory(val label: String) {
    CINEMATOGRAPHY("Cinematographer / DoP"),
    PHOTOGRAPHY("Commercial & Editorial Photographer"),
    DRONE_OPERATOR("Certified Drone Pilot / Aerial"),
    SOUND_ENGINEER("Location Sound Recordist"),
    DIRECTOR("Commercial & Narrative Director"),
    COLORIST("Colorist / Post-Production"),
    GAFFER("Gaffer / Lighting Director"),
    PRODUCTION_DESIGN("Production Designer / Art Director")
}

enum class AvailabilityState(val labelEn: String, val labelSw: String) {
    AVAILABLE_NOW("Available for Bookings", "Yupo Wazi Kufanya Kazi"),
    BOOKED("Fully Booked This Week", "Ameshachukuliwa Wiki Hii"),
    IN_STUDIO("Currently in Production", "Yuko Kwenye Utengenezaji")
}

data class ServicePackage(
    val id: String,
    val title: String,
    val description: String,
    val priceAmount: Long,
    val currencyCode: String,
    val durationUnit: String // "Per Day (10 hrs)", "Per Half-Day", "Full Project Package"
)

data class PortfolioItem(
    val id: String,
    val title: String,
    val clientOrProduction: String,
    val year: Int,
    val coverImageUrl: String,
    val description: String,
    val tags: List<String>,
    val gearUsed: String
)

data class CreativeReview(
    val id: String,
    val reviewerName: String,
    val reviewerRole: String,
    val rating: Float,
    val comment: String,
    val projectTitle: String,
    val date: String
)

data class CreativeProfile(
    val id: String,
    val userId: String,
    val fullName: String,
    val titleTagline: String,
    val primaryCategory: CreativeCategory,
    val additionalCategories: List<CreativeCategory>,
    val avatarUrl: String,
    val bio: String,
    val primaryLocation: EastAfricaLocation,
    val travelRadiusKm: Int = 100,
    val isWillingToTravelAcrossEastAfrica: Boolean = true,
    val languages: List<String>,
    val indicativeDayRate: Long,
    val currencyCode: String,
    val availability: AvailabilityState,
    val isVerifiedPro: Boolean = true,
    val completedProjectsCount: Int,
    val averageRating: Float,
    val reviewsCount: Int,
    val services: List<ServicePackage>,
    val portfolio: List<PortfolioItem>,
    val reviews: List<CreativeReview>
)
