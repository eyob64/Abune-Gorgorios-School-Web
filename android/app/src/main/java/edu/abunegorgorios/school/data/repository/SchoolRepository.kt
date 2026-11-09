package edu.abunegorgorios.school.data.repository

import edu.abunegorgorios.school.data.models.GradeEntry
import edu.abunegorgorios.school.data.models.Student
import edu.abunegorgorios.school.data.models.Subject
import edu.abunegorgorios.school.data.models.AssignmentItem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class SchoolRepository {

    private val _students = MutableStateFlow<List<Student>>(
        listOf(
            Student("AGS-2026-001", "Abebe Bikila", "10th Grade", "abebe@abunegorgorios.edu.et", "https://picsum.photos/seed/student1/300/300"),
            Student("AGS-2026-002", "Sara Tadesse", "11th Grade", "sara@abunegorgorios.edu.et", "https://picsum.photos/seed/student2/300/300"),
            Student("AGS-2026-003", "Dawit Haile", "12th Grade", "dawit@abunegorgorios.edu.et", "https://picsum.photos/seed/student3/300/300"),
            Student("AGS-2026-004", "Tigist Alemu", "9th Grade", "tigist@abunegorgorios.edu.et", "https://picsum.photos/seed/student4/300/300"),
            Student("AGS-2026-005", "Yonas Getachew", "10th Grade", "yonas@abunegorgorios.edu.et", "https://picsum.photos/seed/student5/300/300"),
            Student("AGS-2026-006", "Bethlehem Kassahun", "11th Grade", "bethlehem@abunegorgorios.edu.et", "https://picsum.photos/seed/student6/300/300")
        )
    )
    val students: Flow<List<Student>> = _students.asStateFlow()

    private val sampleAssignments = listOf(
        AssignmentItem(1L, "Midterm Exam", 46.0, 50.0, "2026-03-10"),
        AssignmentItem(2L, "Laboratory Practical", 28.0, 30.0, "2026-03-18"),
        AssignmentItem(3L, "Homework Set 4", 19.0, 20.0, "2026-03-22")
    )

    private val _studentGrades = MutableStateFlow<Map<String, List<GradeEntry>>>(
        mapOf(
            "AGS-2026-001" to listOf(
                GradeEntry("Mathematics", "A", 94.0, "98%", "Excellent", sampleAssignments),
                GradeEntry("Physics", "A-", 89.0, "95%", "Strong", sampleAssignments),
                GradeEntry("Chemistry", "B+", 87.0, "92%", "On Track", sampleAssignments),
                GradeEntry("Biology", "A", 93.0, "96%", "Excellent", sampleAssignments),
                GradeEntry("English", "A", 95.0, "99%", "Excellent", sampleAssignments),
                GradeEntry("Amharic", "A-", 88.0, "94%", "Strong", sampleAssignments),
                GradeEntry("History", "B+", 85.0, "90%", "On Track", sampleAssignments),
                GradeEntry("Geography", "A", 91.0, "96%", "Excellent", sampleAssignments),
                GradeEntry("Economics", "B", 82.0, "91%", "Passing", sampleAssignments),
                GradeEntry("Information Technology (IT)", "A", 97.0, "100%", "Outstanding", sampleAssignments),
                GradeEntry("Health & Physical Education (HPE)", "A", 98.0, "100%", "Outstanding", sampleAssignments),
                GradeEntry("Afan Oromo", "A-", 89.0, "95%", "Strong", sampleAssignments)
            ),
            "AGS-2026-002" to listOf(
                GradeEntry("Mathematics", "A", 96.0, "99%", "Outstanding", sampleAssignments),
                GradeEntry("Physics", "A", 95.0, "98%", "Outstanding", sampleAssignments),
                GradeEntry("Chemistry", "A", 92.0, "97%", "Excellent", sampleAssignments),
                GradeEntry("Biology", "A", 97.0, "100%", "Outstanding", sampleAssignments),
                GradeEntry("English", "A-", 89.0, "94%", "Strong", sampleAssignments),
                GradeEntry("Amharic", "A", 94.0, "98%", "Excellent", sampleAssignments),
                GradeEntry("History", "A-", 88.0, "93%", "Strong", sampleAssignments),
                GradeEntry("Geography", "B+", 86.0, "91%", "On Track", sampleAssignments),
                GradeEntry("Economics", "A", 93.0, "95%", "Excellent", sampleAssignments),
                GradeEntry("Information Technology (IT)", "A", 98.0, "100%", "Outstanding", sampleAssignments),
                GradeEntry("Health & Physical Education (HPE)", "A-", 89.0, "96%", "Strong", sampleAssignments),
                GradeEntry("Afan Oromo", "A", 92.0, "97%", "Excellent", sampleAssignments)
            ),
            "AGS-2026-003" to listOf(
                GradeEntry("Mathematics", "B+", 86.0, "92%", "On Track", sampleAssignments),
                GradeEntry("Physics", "B", 81.0, "88%", "Passing", sampleAssignments),
                GradeEntry("Chemistry", "B-", 78.0, "86%", "Needs Attention", sampleAssignments),
                GradeEntry("Biology", "B+", 85.0, "90%", "On Track", sampleAssignments),
                GradeEntry("English", "A-", 89.0, "94%", "Strong", sampleAssignments),
                GradeEntry("Amharic", "A", 91.0, "97%", "Excellent", sampleAssignments),
                GradeEntry("History", "B", 82.0, "89%", "Passing", sampleAssignments),
                GradeEntry("Geography", "B+", 87.0, "93%", "On Track", sampleAssignments),
                GradeEntry("Economics", "B+", 86.0, "91%", "On Track", sampleAssignments),
                GradeEntry("Information Technology (IT)", "A-", 89.0, "95%", "Strong", sampleAssignments),
                GradeEntry("Health & Physical Education (HPE)", "A", 95.0, "98%", "Excellent", sampleAssignments),
                GradeEntry("Afan Oromo", "B+", 86.0, "92%", "On Track", sampleAssignments)
            )
        )
    )
    val studentGrades: Flow<Map<String, List<GradeEntry>>> = _studentGrades.asStateFlow()

    fun getStudentSubjectGrade(studentId: String, subject: Subject): GradeEntry? {
        val list = _studentGrades.value[studentId] ?: return null
        if (subject == Subject.ALL) return list.firstOrNull()
        return list.firstOrNull { 
            it.subject.contains(subject.displayName, ignoreCase = true) ||
            (subject == Subject.IT && it.subject.contains("IT", ignoreCase = true)) ||
            (subject == Subject.HPE && it.subject.contains("HPE", ignoreCase = true)) ||
            (subject == Subject.AFAN_OROMO && it.subject.contains("Oromo", ignoreCase = true))
        }
    }
}
