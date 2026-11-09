package edu.abunegorgorios.school.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = RoyalBlue,
    secondary = AmberAccent,
    tertiary = EmeraldGreen,
    background = SlateBackground,
    surface = Color.White,
    onPrimary = Color.White,
    onBackground = DarkSlate,
    onSurface = DarkSlate
)

private val DarkColorScheme = darkColorScheme(
    primary = RoyalBlue,
    secondary = AmberAccent,
    tertiary = EmeraldGreen,
    background = Color(0xFF090D16),
    surface = Color(0xFF131B2E),
    onPrimary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White
)

@Composable
fun AbuneGorgoriosTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
