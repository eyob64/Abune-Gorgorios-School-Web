package edu.abunegorgorios.school.ui.screens

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.fragment.app.FragmentActivity
import edu.abunegorgorios.school.security.BiometricAuthManager
import edu.abunegorgorios.school.security.BiometricStatus
import edu.abunegorgorios.school.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: (role: String, userName: String) -> Unit
) {
    val context = LocalContext.current
    val activity = context as? FragmentActivity

    var selectedRole by remember { mutableStateOf("Student") }
    var identifier by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isPasswordVisible by remember { mutableStateOf(false) }
    var authError by remember { mutableStateOf<String?>(null) }
    var biometricMessage by remember { mutableStateOf<String?>(null) }

    // Check biometric availability on device
    val biometricStatus = remember {
        BiometricAuthManager.checkBiometricAvailability(context)
    }

    fun triggerBiometrics() {
        if (activity == null) {
            Toast.makeText(context, "Activity not available for BiometricPrompt", Toast.LENGTH_SHORT).show()
            return
        }

        authError = null
        BiometricAuthManager.showBiometricPrompt(
            activity = activity,
            title = "Biometric Login",
            subtitle = "Abune Gorgorios School - $selectedRole Portal",
            description = "Touch the fingerprint sensor or look at the camera to verify your identity.",
            negativeButtonText = "Use Password Instead",
            onSuccess = { result ->
                biometricMessage = "Biometric verified successfully!"
                val userName = if (identifier.isNotBlank()) identifier else "$selectedRole User"
                onLoginSuccess(selectedRole, userName)
            },
            onError = { errorCode, errString ->
                authError = "Biometric error: $errString"
            },
            onFailed = {
                authError = "Biometric not recognized. Please try again."
            }
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // School Crest Header
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .clip(CircleShape)
                        .background(RoyalBlue),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.School,
                        contentDescription = "School Logo",
                        tint = Color.White,
                        modifier = Modifier.size(36.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Abune Gorgorios School",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black,
                    color = DarkSlate
                )

                Text(
                    text = "Secure Portal Login & Biometrics",
                    fontSize = 13.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Role Tab Selector
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SlateBackground, RoundedCornerShape(16.dp))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    listOf("Student", "Teacher", "Director").forEach { role ->
                        val isSelected = selectedRole == role
                        Surface(
                            onClick = { selectedRole = role },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) RoyalBlue else Color.Transparent
                        ) {
                            Text(
                                text = role,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                color = if (isSelected) Color.White else TextMuted,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Student ID or Email
                OutlinedTextField(
                    value = identifier,
                    onValueChange = { identifier = it },
                    label = { Text(if (selectedRole == "Student") "Student ID or Email" else "Staff Email") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = RoyalBlue) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Password
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = RoyalBlue) },
                    trailingIcon = {
                        IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                            Icon(
                                imageVector = if (isPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = "Toggle password"
                            )
                        }
                    },
                    visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    singleLine = true
                )

                if (authError != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = authError ?: "",
                        color = Color(0xFFEF4444),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                if (biometricMessage != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = biometricMessage ?: "",
                        color = EmeraldGreen,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Standard Login Button
                Button(
                    onClick = {
                        if (identifier.isBlank() && password.isBlank()) {
                            authError = "Please enter your credentials"
                        } else {
                            onLoginSuccess(selectedRole, identifier.ifBlank { "$selectedRole User" })
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = RoyalBlue)
                ) {
                    Text("Sign In with Password", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }

                Spacer(modifier = Modifier.height(14.dp))

                // BIOMETRIC PROMPT BUTTON (Fingerprint & Face Recognition)
                if (biometricStatus is BiometricStatus.Available) {
                    OutlinedButton(
                        onClick = { triggerBiometrics() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = RoyalBlue.copy(alpha = 0.05f)
                        ),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            brush = androidx.compose.ui.graphics.SolidColor(RoyalBlue)
                        )
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Fingerprint,
                                contentDescription = "Biometric Prompt",
                                tint = RoyalBlue,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Login with Fingerprint / Face",
                                fontWeight = FontWeight.Bold,
                                color = RoyalBlue,
                                fontSize = 14.sp
                            )
                        }
                    }
                } else {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Fingerprint,
                            contentDescription = null,
                            tint = TextMuted,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = when (biometricStatus) {
                                is BiometricStatus.NoneEnrolled -> "No fingerprint or face enrolled in device settings"
                                is BiometricStatus.NoHardware -> "Device does not have biometric hardware"
                                else -> "Biometric hardware currently unavailable"
                            },
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }
                }
            }
        }
    }
}
