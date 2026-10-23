package com.kazihub.app.model

enum class EquipmentCategory(val label: String) {
    CINEMA_CAMERAS("Cinema Cameras"),
    LENSES("Cinema Primes & Zooms"),
    LIGHTING_GRIP("Lighting & Grip Packages"),
    AUDIO_RECORDING("Location Audio & Wireless Mics"),
    DRONES_AERIAL("Cinema Drones & Heavy Lifters"),
    STABILIZERS_GIMBALS("Gimbals & Camera Support"),
    MONITORS_WIRELESS("Wireless Video & Monitors")
}

enum class EquipmentCondition(val label: String) {
    MINT("Mint / Like New"),
    EXCELLENT("Excellent Production Grade"),
    GOOD("Good / Battle Tested")
}

data class EquipmentOwnerSummary(
    val ownerId: String,
    val name: String,
    val isVerified: Boolean = true,
    val totalRentalsCompleted: Int,
    val rating: Float,
    val responseTime: String
)

data class EquipmentRentalTerms(
    val securityDepositAmount: Long,
    val depositCurrency: String,
    val requiresGovernmentId: Boolean = true,
    val allowsDryHire: Boolean = true, // Dry hire vs requiring dedicated technician/assistant
    val insuranceIncluded: Boolean = true,
    val minimumRentalDays: Int = 1,
    val cancellationPolicy: String
)

data class EquipmentItem(
    val id: String,
    val title: String,
    val brandModel: String,
    val category: EquipmentCategory,
    val condition: EquipmentCondition,
    val photoUrls: List<String>,
    val dailyRate: Long,
    val currencyCode: String,
    val location: EastAfricaLocation,
    val owner: EquipmentOwnerSummary,
    val availabilityStatus: AvailabilityState,
    val technicalSpecs: Map<String, String>, // e.g., "Mount" to "PL / EF", "Sensor" to "Full Frame 6K Open Gate"
    val includedAccessories: List<String>,
    val terms: EquipmentRentalTerms
)
