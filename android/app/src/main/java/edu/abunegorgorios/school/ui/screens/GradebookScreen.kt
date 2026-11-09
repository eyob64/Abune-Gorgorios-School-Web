package edu.abunegorgorios.school.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.abunegorgorios.school.data.models.Student
import edu.abunegorgorios.school.data.models.Subject
import edu.abunegorgorios.school.data.repository.SchoolRepository
import edu.abunegorgorios.school.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GradebookScreen(
    repository: SchoolRepository,
    onStudentClick: (Student) -> Unit = {}
) {
    val students by repository.students.collectAsState(initial = emptyList())
    val allGrades by repository.studentGrades.collectAsState(initial = emptyMap())

    var selectedSubject by remember { mutableStateOf(Subject.ALL) }
    var searchQuery by remember { mutableStateOf("") }
    var isDropdownExpanded by remember { mutableStateOf(false) }

    // Filter students by search
    val filteredStudents = students.filter {
        it.name.contains(searchQuery, ignoreCase = true) ||
        it.id.contains(searchQuery, ignoreCase = true) ||
        it.grade.contains(searchQuery, ignoreCase = true)
    }

    // Performance statistics for selected subject
    val subjectGradesList = remember(selectedSubject, allGrades) {
        students.mapNotNull { student ->
            repository.getStudentSubjectGrade(student.id, selectedSubject)
        }
    }

    val averageScore = remember(subjectGradesList) {
        if (subjectGradesList.isEmpty()) 0.0
        else subjectGradesList.map { it.scorePercentage }.average()
    }

    val passRate = remember(subjectGradesList) {
        if (subjectGradesList.isEmpty()) 0
        else {
            val passed = subjectGradesList.count { it.gpaPoints >= 2.0 }
            ((passed.toDouble() / subjectGradesList.size) * 100).toInt()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Abune Gorgorios School",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "Official Gradebook & Subject Filter",
                            fontSize = 12.sp,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = RoyalBlue
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(SlateBackground)
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                // Search bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search by name, ID or grade…", fontSize = 14.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = TextMuted) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White,
                        focusedBorderColor = RoyalBlue,
                        unfocusedBorderColor = CardBorder
                    ),
                    singleLine = true
                )
            }

            item {
                // SUBJECT DROPDOWN FILTER SECTION (User Request)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .background(RoyalBlue.copy(alpha = 0.1f), RoundedCornerShape(10.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.FilterList,
                                        contentDescription = "Filter",
                                        tint = RoyalBlue,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "Filter by Subject",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = DarkSlate
                                    )
                                    Text(
                                        text = "Select curriculum subject to isolate performance",
                                        fontSize = 11.sp,
                                        color = TextMuted
                                    )
                                }
                            }

                            // Active Selection Badge
                            Surface(
                                color = RoyalBlue.copy(alpha = 0.12f),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text(
                                    text = selectedSubject.displayName,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = RoyalBlue,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Dropdown Selector Button
                        Box(modifier = Modifier.fillMaxWidth()) {
                            OutlinedButton(
                                onClick = { isDropdownExpanded = true },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = SlateBackground
                                ),
                                border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder))
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Book, contentDescription = null, tint = RoyalBlue, modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = "${selectedSubject.displayName} (${selectedSubject.amharicName})",
                                            fontWeight = FontWeight.SemiBold,
                                            color = DarkSlate
                                        )
                                    }
                                    Icon(Icons.Default.ArrowDropDown, contentDescription = "Dropdown")
                                }
                            }

                            // Dropdown Menu items for ALL Ethiopian subjects
                            DropdownMenu(
                                expanded = isDropdownExpanded,
                                onDismissRequest = { isDropdownExpanded = false },
                                modifier = Modifier
                                    .fillMaxWidth(0.9f)
                                    .heightIn(max = 400.dp)
                            ) {
                                Subject.entries.forEach { subject ->
                                    DropdownMenuItem(
                                        text = {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Column {
                                                    Text(
                                                        text = subject.displayName,
                                                        fontWeight = if (selectedSubject == subject) FontWeight.Bold else FontWeight.Normal,
                                                        color = if (selectedSubject == subject) RoyalBlue else DarkSlate
                                                    )
                                                    Text(
                                                        text = subject.amharicName,
                                                        fontSize = 11.sp,
                                                        color = TextMuted
                                                    )
                                                }
                                                if (selectedSubject == subject) {
                                                    Icon(Icons.Default.Check, contentDescription = "Selected", tint = RoyalBlue)
                                                }
                                            }
                                        },
                                        onClick = {
                                            selectedSubject = subject
                                            isDropdownExpanded = false
                                        }
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Quick Access Filter Chips
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            items(listOf(
                                Subject.ALL,
                                Subject.MATHEMATICS,
                                Subject.PHYSICS,
                                Subject.CHEMISTRY,
                                Subject.BIOLOGY,
                                Subject.ENGLISH,
                                Subject.AMHARIC,
                                Subject.HISTORY,
                                Subject.GEOGRAPHY,
                                Subject.ECONOMICS,
                                Subject.IT,
                                Subject.HPE,
                                Subject.AFAN_OROMO
                            )) { subj ->
                                FilterChip(
                                    selected = selectedSubject == subj,
                                    onClick = { selectedSubject = subj },
                                    label = { Text(subj.displayName, fontSize = 12.sp) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = RoyalBlue,
                                        selectedLabelColor = Color.White
                                    )
                                )
                            }
                        }
                    }
                }
            }

            // Subject Performance Summary KPI Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = if (selectedSubject == Subject.ALL) "Overall Academic Standing" else "${selectedSubject.displayName} Performance Summary",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = DarkSlate
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            // Average Score Box
                            Column(
                                modifier = Modifier
                                    .weight(1f)
                                    .background(RoyalBlue.copy(alpha = 0.08f), RoundedCornerShape(14.dp))
                                    .padding(12.dp)
                            ) {
                                Text("Subject Average", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = if (averageScore > 0) String.format("%.1f%%", averageScore) else "N/A",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black,
                                    color = RoyalBlue
                                )
                            }

                            // Pass Rate Box
                            Column(
                                modifier = Modifier
                                    .weight(1f)
                                    .background(EmeraldGreen.copy(alpha = 0.08f), RoundedCornerShape(14.dp))
                                    .padding(12.dp)
                            ) {
                                Text("Pass Rate (>=C)", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "$passRate%",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black,
                                    color = EmeraldGreen
                                )
                            }

                            // Students Evaluated
                            Column(
                                modifier = Modifier
                                    .weight(1f)
                                    .background(AmberAccent.copy(alpha = 0.08f), RoundedCornerShape(14.dp))
                                    .padding(12.dp)
                            ) {
                                Text("Evaluated", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "${subjectGradesList.size} students",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Black,
                                    color = AmberAccent
                                )
                            }
                        }
                    }
                }
            }

            // Student Performance List Item Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Student Records (${filteredStudents.size})",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = DarkSlate
                    )
                    Text(
                        text = "Viewing: ${selectedSubject.displayName}",
                        fontSize = 12.sp,
                        color = RoyalBlue,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // Student Cards
            items(filteredStudents) { student ->
                val subjectGrade = repository.getStudentSubjectGrade(student.id, selectedSubject)

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onStudentClick(student) },
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(CardBorder)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        // Left: Student Avatar & Info
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(46.dp)
                                    .clip(CircleShape)
                                    .background(RoyalBlue),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = student.name.split(" ").mapNotNull { it.firstOrNull() }.take(2).joinToString(""),
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column {
                                Text(
                                    text = student.name,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = DarkSlate
                                )
                                Text(
                                    text = "${student.grade} • ID: ${student.id}",
                                    fontSize = 12.sp,
                                    color = TextMuted
                                )
                            }
                        }

                        // Right: Filtered Subject Grade Badge
                        Column(horizontalAlignment = Alignment.End) {
                            if (subjectGrade != null) {
                                val badgeColor = when (subjectGrade.grade) {
                                    "A", "A+" -> EmeraldGreen
                                    "A-", "B+" -> RoyalBlue
                                    "B", "B-" -> AmberAccent
                                    else -> Color(0xFFF43F5E)
                                }
                                Surface(
                                    color = badgeColor.copy(alpha = 0.12f),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Text(
                                        text = "${subjectGrade.grade} (${subjectGrade.scorePercentage.toInt()}%)",
                                        color = badgeColor,
                                        fontWeight = FontWeight.ExtraBold,
                                        fontSize = 13.sp,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Att: ${subjectGrade.attendance}",
                                    fontSize = 11.sp,
                                    color = TextMuted
                                )
                            } else {
                                Surface(
                                    color = SlateBackground,
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(
                                        text = "Pending",
                                        color = TextMuted,
                                        fontSize = 11.sp,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(30.dp))
            }
        }
    }
}
