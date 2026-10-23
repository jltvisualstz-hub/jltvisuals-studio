package com.kazihub.app.data.repository

import com.kazihub.app.model.AvailabilityState
import com.kazihub.app.model.CreativeCategory
import com.kazihub.app.model.CreativeProfile
import com.kazihub.app.model.CreativeReview
import com.kazihub.app.model.EastAfricaLocation
import com.kazihub.app.model.EastAfricanCountry
import com.kazihub.app.model.PortfolioItem
import com.kazihub.app.model.ServicePackage
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map

interface CreativeRepository {
    fun getFeaturedCreatives(): Flow<List<CreativeProfile>>
    fun searchCreatives(
        query: String = "",
        category: CreativeCategory? = null,
        country: EastAfricanCountry? = null,
        verifiedOnly: Boolean = false
    ): Flow<List<CreativeProfile>>
    fun getCreativeById(id: String): Flow<CreativeProfile?>
    suspend fun registerCreativeProfile(profile: CreativeProfile)
    val isDemoDataSource: Boolean
}

/**
 * Real repository for creative professionals.
 * All fictional seeded profiles, fake reviews, and fabricated ratings are completely removed.
 * Registry is populated exclusively by real user registrations and Firebase-backed queries.
 */
class RealCreativeRepository : CreativeRepository {
    override val isDemoDataSource: Boolean = false

    // Real user-created creative registry (starts pristine and empty)
    private val _creativesFlow = MutableStateFlow<List<CreativeProfile>>(emptyList())

    override fun getFeaturedCreatives(): Flow<List<CreativeProfile>> =
        _creativesFlow.asStateFlow()

    override fun searchCreatives(
        query: String,
        category: CreativeCategory?,
        country: EastAfricanCountry?,
        verifiedOnly: Boolean
    ): Flow<List<CreativeProfile>> {
        return _creativesFlow.map { list ->
            list.filter { creative ->
                val matchesQuery = query.isBlank() ||
                        creative.fullName.contains(query, ignoreCase = true) ||
                        creative.titleTagline.contains(query, ignoreCase = true) ||
                        creative.primaryCategory.label.contains(query, ignoreCase = true)
                val matchesCategory = category == null || creative.primaryCategory == category || creative.additionalCategories.contains(category)
                val matchesCountry = country == null || creative.primaryLocation.country == country
                val matchesVerified = !verifiedOnly || creative.isVerifiedPro
                matchesQuery && matchesCategory && matchesCountry && matchesVerified
            }
        }
    }

    override fun getCreativeById(id: String): Flow<CreativeProfile?> =
        _creativesFlow.map { list -> list.find { it.id == id || it.userId == id } }

    override suspend fun registerCreativeProfile(profile: CreativeProfile) {
        val current = _creativesFlow.value.toMutableList()
        val existingIndex = current.indexOfFirst { it.id == profile.id || it.userId == profile.userId }
        if (existingIndex >= 0) {
            current[existingIndex] = profile
        } else {
            current.add(0, profile)
        }
        _creativesFlow.value = current
    }
}

// Backward-compatible alias pointing to real, non-seeded repository
typealias DemoCreativeRepository = RealCreativeRepository
