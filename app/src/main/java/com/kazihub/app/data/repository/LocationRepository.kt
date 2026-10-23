package com.kazihub.app.data.repository

import com.kazihub.app.model.EastAfricaLocation
import com.kazihub.app.model.EastAfricanCountry
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf

interface LocationRepository {
    fun getSupportedCountries(): List<EastAfricanCountry>
    fun getLocationsForCountry(country: EastAfricanCountry): Flow<List<EastAfricaLocation>>
    fun getAllEastAfricanLocations(): Flow<List<EastAfricaLocation>>
}

class DemoLocationRepository : LocationRepository {
    private val locations = listOf(
        // Tanzania Locations
        EastAfricaLocation(
            id = "loc_tz_dar_masaki",
            country = EastAfricanCountry.TANZANIA,
            primaryDivision = "Dar es Salaam Region",
            secondaryDivision = "Kinondoni",
            neighbourhoodOrArea = "Masaki / Oysterbay"
        ),
        EastAfricaLocation(
            id = "loc_tz_dar_mikocheni",
            country = EastAfricanCountry.TANZANIA,
            primaryDivision = "Dar es Salaam Region",
            secondaryDivision = "Kinondoni",
            neighbourhoodOrArea = "Mikocheni Light Industrial"
        ),
        EastAfricaLocation(
            id = "loc_tz_arusha",
            country = EastAfricanCountry.TANZANIA,
            primaryDivision = "Arusha Region",
            secondaryDivision = "Arusha City",
            neighbourhoodOrArea = "Njiro Safari Hub"
        ),
        EastAfricaLocation(
            id = "loc_tz_znz",
            country = EastAfricanCountry.TANZANIA,
            primaryDivision = "Zanzibar Urban/West",
            secondaryDivision = "Stone Town",
            neighbourhoodOrArea = "Shangani Waterfront"
        ),

        // Kenya Locations
        EastAfricaLocation(
            id = "loc_ke_nbo_kilimani",
            country = EastAfricanCountry.KENYA,
            primaryDivision = "Nairobi County",
            secondaryDivision = "Dagoretti North",
            neighbourhoodOrArea = "Kilimani Creative Quarter"
        ),
        EastAfricaLocation(
            id = "loc_ke_nbo_westlands",
            country = EastAfricanCountry.KENYA,
            primaryDivision = "Nairobi County",
            secondaryDivision = "Westlands",
            neighbourhoodOrArea = "Sarit Centre / Parklands"
        ),
        EastAfricaLocation(
            id = "loc_ke_mombasa",
            country = EastAfricanCountry.KENYA,
            primaryDivision = "Mombasa County",
            secondaryDivision = "Nyali",
            neighbourhoodOrArea = "Nyali Beachfront"
        ),

        // Uganda Locations
        EastAfricaLocation(
            id = "loc_ug_kla_kololo",
            country = EastAfricanCountry.UGANDA,
            primaryDivision = "Kampala District",
            secondaryDivision = "Central Division",
            neighbourhoodOrArea = "Kololo Hill"
        ),
        EastAfricaLocation(
            id = "loc_ug_kla_bugolobi",
            country = EastAfricanCountry.UGANDA,
            primaryDivision = "Kampala District",
            secondaryDivision = "Nakawa",
            neighbourhoodOrArea = "Bugolobi Media District"
        ),

        // Rwanda Locations
        EastAfricaLocation(
            id = "loc_rw_kgl_kimihurura",
            country = EastAfricanCountry.RWANDA,
            primaryDivision = "Kigali City",
            secondaryDivision = "Gasabo District",
            neighbourhoodOrArea = "Kimihurura Arts Hub"
        ),
        EastAfricaLocation(
            id = "loc_rw_kgl_nyarutarama",
            country = EastAfricanCountry.RWANDA,
            primaryDivision = "Kigali City",
            secondaryDivision = "Gasabo District",
            neighbourhoodOrArea = "Nyarutarama"
        )
    )

    override fun getSupportedCountries(): List<EastAfricanCountry> =
        listOf(EastAfricanCountry.TANZANIA, EastAfricanCountry.KENYA, EastAfricanCountry.UGANDA, EastAfricanCountry.RWANDA)

    override fun getLocationsForCountry(country: EastAfricanCountry): Flow<List<EastAfricaLocation>> {
        return flowOf(locations.filter { it.country == country })
    }

    override fun getAllEastAfricanLocations(): Flow<List<EastAfricaLocation>> {
        return flowOf(locations)
    }
}
