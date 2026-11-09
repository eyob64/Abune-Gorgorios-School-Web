package edu.abunegorgorios.school.data.models

enum class Subject(
    val id: String,
    val displayName: String,
    val amharicName: String,
    val creditHours: Int = 3
) {
    ALL("all", "All Subjects", "ሁሉም ትምህርቶች", 0),
    MATHEMATICS("math", "Mathematics", "ሂሳብ", 4),
    PHYSICS("physics", "Physics", "ፊዚክስ", 4),
    CHEMISTRY("chemistry", "Chemistry", "ኬሚስትሪ", 4),
    BIOLOGY("biology", "Biology", "ባዮሎጂ", 3),
    ENGLISH("english", "English", "እንግሊዝኛ", 3),
    AMHARIC("amharic", "Amharic", "አማርኛ", 3),
    HISTORY("history", "History", "ታሪክ", 2),
    GEOGRAPHY("geography", "Geography", "ጂኦግራፊ", 2),
    ECONOMICS("economics", "Economics", "ኢኮኖሚክስ", 3),
    IT("it", "Information Technology (IT)", "የኢንፎርሜሽን ቴክኖሎጂ (IT)", 3),
    HPE("hpe", "Health & Physical Education (HPE)", "የጤና እና የሰውነት ማጎልመሻ (HPE)", 2),
    AFAN_OROMO("afan_oromo", "Afan Oromo", "አፋን ኦሮሞ", 3),
    CIVICS("civics", "Civics & Ethics", "ስነ-ዜጋ", 2),
    GENERAL_SCIENCE("general_science", "General Science", "ጠቅላላ ሳይንስ", 3);

    companion object {
        fun fromString(value: String): Subject {
            val normalized = value.trim().lowercase()
            return entries.firstOrNull { 
                it.displayName.lowercase() == normalized || 
                it.id.lowercase() == normalized ||
                (it == ENGLISH && normalized.contains("emglish")) ||
                (it == IT && normalized.contains("it")) ||
                (it == HPE && normalized.contains("hpe")) ||
                (it == AFAN_OROMO && normalized.contains("oromo"))
            } ?: ALL
        }
    }
}
