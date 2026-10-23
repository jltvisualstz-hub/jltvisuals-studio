package com.kazihub.app.model

enum class EastAfricanCountry(
    val code: String,
    val displayName: String,
    val currencyCode: String,
    val currencySymbol: String,
    val administrativeUnitName: String, // "Region" in Tanzania, "County" in Kenya, "District" in Uganda
    val callingCode: String,
    val phonePlaceholder: String
) {
    TANZANIA("TZ", "Tanzania", "TZS", "TSh", "Region", "+255", "712 345 678"),
    KENYA("KE", "Kenya", "KES", "KSh", "County", "+254", "712 345 678"),
    UGANDA("UG", "Uganda", "UGX", "USh", "District", "+256", "712 345 678"),
    RWANDA("RW", "Rwanda", "RWF", "FRw", "District", "+250", "782 345 678")
}

data class GeoCoordinates(
    val latitude: Double,
    val longitude: Double,
    val isUserConsentGranted: Boolean = false
)

data class EastAfricaLocation(
    val id: String,
    val country: EastAfricanCountry,
    val primaryDivision: String, // Region (e.g. Dar es Salaam) or County (e.g. Nairobi)
    val secondaryDivision: String, // District or Sub-county (e.g. Kinondoni, Westlands)
    val neighbourhoodOrArea: String, // (e.g. Masaki, Kilimani, Kololo, Kimihurura)
    val coordinates: GeoCoordinates? = null
) {
    fun formattedLocation(): String {
        return "$neighbourhoodOrArea, $primaryDivision, ${country.displayName}"
    }
}
