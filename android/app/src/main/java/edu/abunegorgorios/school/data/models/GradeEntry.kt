package edu.abunegorgorios.school.data.models

data class AssignmentItem(
    val id: Long,
    val title: String,
    val score: Double,
    val total: Double,
    val date: String,
    val status: String = "Graded"
)

data class GradeEntry(
    val subject: String,
    val grade: String, // "A", "A-", "B+", "B", "C+", etc.
    val scorePercentage: Double = 85.0,
    val attendance: String = "95%",
    val status: String = "On Track",
    val assignments: List<AssignmentItem> = emptyList()
) {
    val gpaPoints: Double
        get() = when (grade.uppercase()) {
            "A+", "A" -> 4.0
            "A-" -> 3.7
            "B+" -> 3.3
            "B" -> 3.0
            "B-" -> 2.7
            "C+" -> 2.3
            "C" -> 2.0
            "C-" -> 1.7
            "D" -> 1.0
            else -> 0.0
        }
}
