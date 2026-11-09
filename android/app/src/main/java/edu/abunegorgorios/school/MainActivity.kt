package edu.abunegorgorios.school

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.People
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.fragment.app.FragmentActivity
import edu.abunegorgorios.school.data.repository.SchoolRepository
import edu.abunegorgorios.school.ui.screens.GradebookScreen
import edu.abunegorgorios.school.ui.screens.LoginScreen
import edu.abunegorgorios.school.ui.theme.AbuneGorgoriosTheme
import edu.abunegorgorios.school.ui.theme.RoyalBlue

class MainActivity : FragmentActivity() {
    private val repository = SchoolRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AbuneGorgoriosTheme {
                var isAuthenticated by remember { mutableStateOf(false) }
                var currentUserRole by remember { mutableStateOf("Student") }
                var currentUserName by remember { mutableStateOf("") }
                var currentTab by remember { mutableStateOf(0) }

                if (!isAuthenticated) {
                    LoginScreen(
                        onLoginSuccess = { role, name ->
                            currentUserRole = role
                            currentUserName = name
                            isAuthenticated = true
                        }
                    )
                } else {
                    Scaffold(
                        modifier = Modifier.fillMaxSize(),
                        bottomBar = {
                            NavigationBar(
                                containerColor = MaterialTheme.colorScheme.surface
                            ) {
                                NavigationBarItem(
                                    selected = currentTab == 0,
                                    onClick = { currentTab = 0 },
                                    icon = { Icon(Icons.Default.Book, contentDescription = "Gradebook") },
                                    label = { Text("Gradebook") },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = RoyalBlue,
                                        selectedTextColor = RoyalBlue
                                    )
                                )
                                NavigationBarItem(
                                    selected = currentTab == 1,
                                    onClick = { currentTab = 1 },
                                    icon = { Icon(Icons.Default.People, contentDescription = "Students") },
                                    label = { Text("Students") },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = RoyalBlue,
                                        selectedTextColor = RoyalBlue
                                    )
                                )
                                NavigationBarItem(
                                    selected = currentTab == 2,
                                    onClick = { currentTab = 2 },
                                    icon = { Icon(Icons.Default.Assessment, contentDescription = "Performance") },
                                    label = { Text("GPA Trends") },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = RoyalBlue,
                                        selectedTextColor = RoyalBlue
                                    )
                                )
                                NavigationBarItem(
                                    selected = false,
                                    onClick = { isAuthenticated = false },
                                    icon = { Icon(Icons.Default.ExitToApp, contentDescription = "Logout") },
                                    label = { Text("Logout") },
                                    colors = NavigationBarItemDefaults.colors(
                                        unselectedIconColor = MaterialTheme.colorScheme.error,
                                        unselectedTextColor = MaterialTheme.colorScheme.error
                                    )
                                )
                            }
                        }
                    ) { innerPadding ->
                        Box(modifier = Modifier.padding(innerPadding)) {
                            when (currentTab) {
                                0 -> GradebookScreen(repository = repository)
                                1 -> GradebookScreen(repository = repository)
                                2 -> GradebookScreen(repository = repository)
                            }
                        }
                    }
                }
            }
        }
    }
}
