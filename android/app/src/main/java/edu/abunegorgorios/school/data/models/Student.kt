package edu.abunegorgorios.school.data.models

data class Student(
    val id: String,
    val name: String,
    val grade: String,
    val email: String = "",
    val photoUrl: String = "",
    val enrollmentDate: String = "2024-09-01",
    val hasIdCard: Boolean = true
)
