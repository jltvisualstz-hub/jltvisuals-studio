package com.kazihub.app.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = KaziGold,
    onPrimary = KaziBackground,
    primaryContainer = KaziCardElevated,
    onPrimaryContainer = KaziGoldLight,
    secondary = KaziBronze,
    onSecondary = KaziTextPrimary,
    background = KaziBackground,
    onBackground = KaziTextPrimary,
    surface = KaziCard,
    onSurface = KaziTextPrimary,
    surfaceVariant = KaziBackgroundSecondary,
    onSurfaceVariant = KaziTextSecondary,
    outline = KaziBorder,
    outlineVariant = KaziBorderGold,
    error = KaziRed,
    onError = KaziTextPrimary
)

@Composable
fun KaziHubTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
