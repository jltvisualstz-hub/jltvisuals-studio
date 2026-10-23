package com.kazihub.app.ui.navigation

enum class KaziHubDestination(val route: String, val titleEn: String, val titleSw: String) {
    // Unauthenticated Public Flow
    WELCOME("welcome", "Welcome to KAZI HUB", "Karibu KAZI HUB"),
    LOGIN("login", "Sign In", "Ingia"),
    REGISTRATION("registration", "Create Account", "Fungua Akaunti"),
    FORGOT_PASSWORD("forgot_password", "Password Recovery", "Rejesha Nenosiri"),
    PROFILE_COMPLETION("profile_completion", "Complete Profile & Photo", "Kamilisha Wasifu na Picha"),

    // Authenticated Marketplace Core
    HOME("home", "Explore", "Gundua"),
    SEARCH_FILTERS("search_filters", "Search & Filters", "Utafutaji na Vichujio"),
    FREELANCER_DISCOVERY("freelancer_discovery", "Find Talent", "Tafuta Wataalamu"),
    FREELANCER_PROFILE("freelancer_profile", "Creative Profile", "Wasifu wa Mbunifu"),
    PORTFOLIO_DETAIL("portfolio_detail", "Portfolio Showcase", "Kazi Zilizopita"),
    EQUIPMENT_MARKETPLACE("equipment_marketplace", "Cinema Gear", "Vifaa vya Sinema"),
    EQUIPMENT_DETAIL("equipment_detail", "Equipment Specs", "Taarifa za Kifaa"),
    
    // Structured Booking Creation (Sections 5 & 6)
    CREATIVE_BOOKING_REQUEST("creative_booking_request", "Creative Production Brief", "Ombi la Kazi ya Ubunifu"),
    EQUIPMENT_RENTAL_REQUEST("equipment_rental_request", "Reserve Cinema Gear", "Kodisha Vifaa vya Sinema"),
    POST_JOB("post_job", "Post Shoot Brief", "Tuma Ombi la Kazi"),

    // Dedicated Booking Center, Details & Completion Reports
    BOOKING_CENTER("booking_center", "Booking Center", "Kituo cha Makubaliano"),
    BOOKING_DETAIL("booking_detail", "Booking Contract Details", "Maelezo ya Kazi"),
    BOOKING_COMPLETION_REPORT("booking_completion_report", "Booking Completion Report", "Ripoti ya Kukamilisha Kazi"),
    BOOKING_OVERVIEW("booking_overview", "Booking Overview", "Muhtasari wa Kazi"),
    QUOTATION_BUILDER("quotation_builder", "Prepare Quotation", "Andaa Nukuu ya Bei"),
    DISPUTE_DETAIL("dispute_detail", "Dispute & Mediation Details", "Taarifa za Mgogoro"),
    LEGAL_TERMS("legal_terms", "Legal & Marketplace Terms", "Vigezo vya Kisheria"),

    // Role Dashboards
    CLIENT_DASHBOARD("client_dashboard", "Client Hub", "Dashibodi ya Mteja"),
    FREELANCER_DASHBOARD("freelancer_dashboard", "Talent Hub", "Dashibodi ya Mbunifu"),
    EQUIPMENT_DASHBOARD("equipment_dashboard", "Gear Hub", "Dashibodi ya Vifaa"),

    // Communications & Settings
    MESSAGES("messages", "Messages", "Ujumbe"),
    NOTIFICATIONS("notifications", "Notifications", "Taarifa"),
    PROFILE_SETTINGS("profile_settings", "Settings", "Mipangilio"),

    // Dedicated Customer Care
    CUSTOMER_CARE("customer_care", "Customer Care & Help Center", "Huduma kwa Wateja na Msaada"),
    SUPPORT_NEW_TICKET("support_new_ticket", "Submit Support Ticket", "Fungua Tiketi ya Msaada"),
    SUPPORT_TICKET_DETAIL("support_ticket_detail", "Support Ticket Thread", "Mjadala wa Tiketi"),

    // Restricted Admin Workspace
    ADMIN_WORKSPACE("admin_workspace", "Admin Oversight Center", "Kituo Kikuu cha Usimamizi"),
    ADMIN_DASHBOARD("admin_dashboard", "Admin Dashboard Shell", "Dashibodi ya Msimamizi")
}
