package com.kazihub.app.data.repository

import com.kazihub.app.model.AvailabilityState
import com.kazihub.app.model.EastAfricaLocation
import com.kazihub.app.model.EastAfricanCountry
import com.kazihub.app.model.EquipmentCategory
import com.kazihub.app.model.EquipmentCondition
import com.kazihub.app.model.EquipmentItem
import com.kazihub.app.model.EquipmentOwnerSummary
import com.kazihub.app.model.EquipmentRentalTerms
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map

interface EquipmentRepository {
    fun getFeaturedEquipment(): Flow<List<EquipmentItem>>
    fun searchEquipment(
        query: String = "",
        category: EquipmentCategory? = null,
        country: EastAfricanCountry? = null
    ): Flow<List<EquipmentItem>>
    fun getEquipmentById(id: String): Flow<EquipmentItem?>
    suspend fun addEquipment(item: EquipmentItem)
    val isDemoDataSource: Boolean
}

/**
 * Real repository for cinema equipment & gear marketplace.
 * All fictional seeded cameras, fake owner ratings, and fabricated inventories have been removed.
 * Populated exclusively by user listings and Firebase backend queries.
 */
class RealEquipmentRepository : EquipmentRepository {
    override val isDemoDataSource: Boolean = false

    // Real gear inventory (starts empty)
    private val _inventoryFlow = MutableStateFlow<List<EquipmentItem>>(emptyList())

    override fun getFeaturedEquipment(): Flow<List<EquipmentItem>> =
        _inventoryFlow.asStateFlow()

    override fun searchEquipment(
        query: String,
        category: EquipmentCategory?,
        country: EastAfricanCountry?
    ): Flow<List<EquipmentItem>> {
        return _inventoryFlow.map { list ->
            list.filter { item ->
                val matchesQuery = query.isBlank() ||
                        item.title.contains(query, ignoreCase = true) ||
                        item.brandModel.contains(query, ignoreCase = true) ||
                        item.category.label.contains(query, ignoreCase = true)
                val matchesCategory = category == null || item.category == category
                val matchesCountry = country == null || item.location.country == country
                matchesQuery && matchesCategory && matchesCountry
            }
        }
    }

    override fun getEquipmentById(id: String): Flow<EquipmentItem?> =
        _inventoryFlow.map { list -> list.find { it.id == id } }

    override suspend fun addEquipment(item: EquipmentItem) {
        val current = _inventoryFlow.value.toMutableList()
        val index = current.indexOfFirst { it.id == item.id }
        if (index >= 0) {
            current[index] = item
        } else {
            current.add(0, item)
        }
        _inventoryFlow.value = current
    }
}

// Backward-compatible alias pointing to real, non-seeded repository
typealias DemoEquipmentRepository = RealEquipmentRepository
