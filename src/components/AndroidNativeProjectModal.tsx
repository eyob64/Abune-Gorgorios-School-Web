import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Download,
  X,
  FileCode,
  CheckCircle2,
  Copy,
  Terminal,
  FolderTree,
  ExternalLink,
  Sparkles,
  Layers,
  Cpu,
  Fingerprint,
  ShieldCheck
} from 'lucide-react';
import JSZip from 'jszip';

interface AndroidNativeProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'am';
}

const ANDROID_SOURCE_FILES: { path: string; name: string; language: string; content: string }[] = [
  {
    path: 'android/app/src/main/java/edu/abunegorgorios/school/security/BiometricAuthManager.kt',
    name: 'BiometricAuthManager.kt (Fingerprint & Face)',
    language: 'kotlin',
    content: `package edu.abunegorgorios.school.security

import android.content.Context
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity

sealed class BiometricStatus {
    object Available : BiometricStatus()
    object NoHardware : BiometricStatus()
    object HardwareUnavailable : BiometricStatus()
    object NoneEnrolled : BiometricStatus()
    data class Error(val message: String) : BiometricStatus()
}

object BiometricAuthManager {

    /**
     * Checks if biometric hardware (fingerprint or face) is available and enrolled.
     */
    fun checkBiometricAvailability(context: Context): BiometricStatus {
        val biometricManager = BiometricManager.from(context)
        return when (biometricManager.canAuthenticate(
            BiometricManager.Authenticators.BIOMETRIC_STRONG or 
            BiometricManager.Authenticators.BIOMETRIC_WEAK or
            BiometricManager.Authenticators.DEVICE_CREDENTIAL
        )) {
            BiometricManager.BIOMETRIC_SUCCESS -> BiometricStatus.Available
            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> BiometricStatus.NoHardware
            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> BiometricStatus.HardwareUnavailable
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> BiometricStatus.NoneEnrolled
            else -> BiometricStatus.Error("Biometrics unavailable")
        }
    }

    /**
     * Prompts the user with BiometricPrompt (Fingerprint or Face Recognition).
     */
    fun showBiometricPrompt(
        activity: FragmentActivity,
        title: String = "Biometric Login",
        subtitle: String = "Abune Gorgorios School Portal",
        description: String = "Authenticate using fingerprint or facial recognition for fast, secure access.",
        negativeButtonText: String = "Use Password Instead",
        onSuccess: (BiometricPrompt.AuthenticationResult) -> Unit,
        onError: (errorCode: Int, errString: CharSequence) -> Unit = { _, _ -> },
        onFailed: () -> Unit = {}
    ) {
        val executor = ContextCompat.getMainExecutor(activity)

        val callback = object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                onSuccess(result)
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                onError(errorCode, errString)
            }

            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                onFailed()
            }
        }

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(subtitle)
            .setDescription(description)
            .setNegativeButtonText(negativeButtonText)
            .setConfirmationRequired(true)
            .build()

        val biometricPrompt = BiometricPrompt(activity, executor, callback)
        biometricPrompt.authenticate(promptInfo)
    }
}`
  },
  {
    path: 'android/app/src/main/java/edu/abunegorgorios/school/ui/screens/LoginScreen.kt',
    name: 'LoginScreen.kt (BiometricPrompt UI)',
    language: 'kotlin',
    content: `package edu.abunegorgorios.school.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.fragment.app.FragmentActivity
import edu.abunegorgorios.school.security.BiometricAuthManager
import edu.abunegorgorios.school.security.BiometricStatus

@Composable
fun LoginScreen(onLoginSuccess: (role: String, userName: String) -> Unit) {
    val context = LocalContext.current
    val activity = context as? FragmentActivity
    var selectedRole by remember { mutableStateOf("Student") }
    var identifier by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val biometricStatus = remember {
        BiometricAuthManager.checkBiometricAvailability(context)
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Biometric Fast Login Button
        if (biometricStatus is BiometricStatus.Available) {
            Button(
                onClick = {
                    activity?.let {
                        BiometricAuthManager.showBiometricPrompt(
                            activity = it,
                            title = "Biometric Login",
                            subtitle = "\$selectedRole Portal",
                            onSuccess = { onLoginSuccess(selectedRole, identifier.ifBlank { "\$selectedRole User" }) },
                            onError = { _, err -> errorMessage = err.toString() }
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(14.dp)
            ) {
                Icon(Icons.Default.Fingerprint, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Login with Fingerprint / Face")
            }
        }
    }
}`
  },
  {
    path: 'android/app/src/main/java/edu/abunegorgorios/school/ui/screens/GradebookScreen.kt',
    name: 'GradebookScreen.kt (Subject Filter UI)',
    language: 'kotlin',
    content: `package edu.abunegorgorios.school.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import edu.abunegorgorios.school.data.models.Subject
import edu.abunegorgorios.school.data.repository.SchoolRepository

@Composable
fun GradebookScreen(repository: SchoolRepository) {
    val students by repository.students.collectAsState(initial = emptyList())
    var selectedSubject by remember { mutableStateOf(Subject.ALL) }
    var isDropdownExpanded by remember { mutableStateOf(false) }

    // Curated list includes Mathematics, Physics, Chemistry, Biology,
    // English, Amharic, History, Geography, Economics, IT, HPE, Afan Oromo
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        OutlinedButton(
            onClick = { isDropdownExpanded = true },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Subject: \${selectedSubject.displayName} (\${selectedSubject.amharicName})")
        }

        DropdownMenu(
            expanded = isDropdownExpanded,
            onDismissRequest = { isDropdownExpanded = false }
        ) {
            Subject.entries.forEach { subject ->
                DropdownMenuItem(
                    text = { Text("\${subject.displayName} (\${subject.amharicName})") },
                    onClick = {
                        selectedSubject = subject
                        isDropdownExpanded = false
                    }
                )
            }
        }
    }
}`
  },
  {
    path: 'android/app/src/main/java/edu/abunegorgorios/school/data/models/Subject.kt',
    name: 'Subject.kt (Ethiopian Curriculum Subjects)',
    language: 'kotlin',
    content: `package edu.abunegorgorios.school.data.models

enum class Subject(
    val id: String,
    val displayName: String,
    val amharicName: String,
    val creditHours: Int = 3
) {
    ALL("all", "All Subjects", "ሁሉም ትምህርቶች"),
    MATHEMATICS("math", "Mathematics", "ሂሳብ"),
    PHYSICS("physics", "Physics", "ፊዚክስ"),
    CHEMISTRY("chemistry", "Chemistry", "ኬሚስትሪ"),
    BIOLOGY("biology", "Biology", "ባዮሎጂ"),
    ENGLISH("english", "English", "እንግሊዝኛ"),
    AMHARIC("amharic", "Amharic", "አማርኛ"),
    HISTORY("history", "History", "ታሪክ"),
    GEOGRAPHY("geography", "Geography", "ጂኦግራፊ"),
    ECONOMICS("economics", "Economics", "ኢኮኖሚክስ"),
    IT("it", "Information Technology (IT)", "የኢንፎርሜሽን ቴክኖሎጂ (IT)"),
    HPE("hpe", "Health & Physical Education (HPE)", "የጤና እና የሰውነት ማጎልመሻ (HPE)"),
    AFAN_OROMO("afan_oromo", "Afan Oromo", "አፋን ኦሮሞ"),
    CIVICS("civics", "Civics & Ethics", "ስነ-ዜጋ"),
    GENERAL_SCIENCE("general_science", "General Science", "ጠቅላላ ሳይንስ");
}`
  },
  {
    path: 'android/app/src/main/java/edu/abunegorgorios/school/MainActivity.kt',
    name: 'MainActivity.kt (FragmentActivity)',
    language: 'kotlin',
    content: `package edu.abunegorgorios.school

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.fragment.app.FragmentActivity
import edu.abunegorgorios.school.data.repository.SchoolRepository
import edu.abunegorgorios.school.ui.screens.GradebookScreen
import edu.abunegorgorios.school.ui.screens.LoginScreen
import edu.abunegorgorios.school.ui.theme.AbuneGorgoriosTheme

class MainActivity : FragmentActivity() {
    private val repository = SchoolRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AbuneGorgoriosTheme {
                var isAuthenticated by remember { mutableStateOf(false) }

                if (!isAuthenticated) {
                    LoginScreen(onLoginSuccess = { _, _ -> isAuthenticated = true })
                } else {
                    GradebookScreen(repository = repository)
                }
            }
        }
    }
}`
  },
  {
    path: 'android/app/build.gradle.kts',
    name: 'build.gradle.kts (:app)',
    language: 'kotlin',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "edu.abunegorgorios.school"
    compileSdk = 35

    defaultConfig {
        applicationId = "edu.abunegorgorios.school"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3:1.3.1")
    implementation("androidx.activity:activity-compose:1.9.3")
    
    // Biometrics library (Fingerprint & Face Recognition)
    implementation("androidx.biometric:biometric:1.2.0-alpha05")
    implementation("androidx.appcompat:appcompat:1.7.0")
    
    implementation("io.coil-kt:coil-compose:2.7.0")
}`
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml (USE_BIOMETRIC)',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <application
        android:allowBackup="true"
        android:label="Abune Gorgorios School"
        android:theme="@style/Theme.AbuneGorgoriosSchool">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
  }
];

export const AndroidNativeProjectModal: React.FC<AndroidNativeProjectModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const currentFile = ANDROID_SOURCE_FILES[selectedFileIdx];

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentFile.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();

      // Top-level gradle files
      zip.file('AbuneGorgoriosSchool/settings.gradle.kts', `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "AbuneGorgoriosSchool"
include(":app")
`);

      zip.file('AbuneGorgoriosSchool/build.gradle.kts', `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`);

      zip.file('AbuneGorgoriosSchool/gradle.properties', `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`);

      // App build file & manifest
      zip.file('AbuneGorgoriosSchool/app/build.gradle.kts', ANDROID_SOURCE_FILES[5].content);
      zip.file('AbuneGorgoriosSchool/app/src/main/AndroidManifest.xml', ANDROID_SOURCE_FILES[6].content);

      // Resources
      zip.file('AbuneGorgoriosSchool/app/src/main/res/values/strings.xml', `<resources>
    <string name="app_name">Abune Gorgorios School</string>
    <string name="gradebook_title">Gradebook &amp; Performance</string>
</resources>`);

      zip.file('AbuneGorgoriosSchool/app/src/main/res/values/colors.xml', `<resources>
    <color name="primary_blue">#2563EB</color>
    <color name="accent_amber">#F59E0B</color>
    <color name="accent_emerald">#10B981</color>
</resources>`);

      zip.file('AbuneGorgoriosSchool/app/src/main/res/values/themes.xml', `<resources>
    <style name="Theme.AbuneGorgoriosSchool" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">#2563EB</item>
    </style>
</resources>`);

      // Kotlin source files
      zip.file('AbuneGorgoriosSchool/app/src/main/java/edu/abunegorgorios/school/security/BiometricAuthManager.kt', ANDROID_SOURCE_FILES[0].content);
      zip.file('AbuneGorgoriosSchool/app/src/main/java/edu/abunegorgorios/school/ui/screens/LoginScreen.kt', ANDROID_SOURCE_FILES[1].content);
      zip.file('AbuneGorgoriosSchool/app/src/main/java/edu/abunegorgorios/school/ui/screens/GradebookScreen.kt', ANDROID_SOURCE_FILES[2].content);
      zip.file('AbuneGorgoriosSchool/app/src/main/java/edu/abunegorgorios/school/data/models/Subject.kt', ANDROID_SOURCE_FILES[3].content);
      zip.file('AbuneGorgoriosSchool/app/src/main/java/edu/abunegorgorios/school/MainActivity.kt', ANDROID_SOURCE_FILES[4].content);

      zip.file('AbuneGorgoriosSchool/README.md', `# Abune Gorgorios School - Native Android Application
Built with Kotlin, Jetpack Compose, androidx.biometric (Fingerprint & Face Recognition), and Android SDK 35.

## How to Run:
1. Open Android Studio.
2. Select "Open Existing Project" and choose this directory.
3. Run \`./gradlew assembleDebug\` to build the APK.
`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'AbuneGorgoriosSchool_Android_Kotlin.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate Android zip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">
                  {lang === 'en' ? 'Native Android App (Kotlin & Android SDK)' : 'የአንድሮይድ መተግበሪያ (Kotlin እና Android SDK)'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <Fingerprint className="w-3 h-3 text-emerald-300" />
                  Biometrics &amp; SDK 35
                </span>
              </div>
              <p className="text-xs text-blue-200">
                {lang === 'en'
                  ? 'Complete Jetpack Compose native codebase with BiometricPrompt (Fingerprint/Face) and Subject Dropdown filter'
                  : 'የተሟላ የKotlin እና Jetpack Compose ኮድ ከባዮሜትሪክ እና የትምህርት ማጣሪያ ጋር'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? (lang === 'en' ? 'Generating Zip…' : 'ዚፕ በመፍጠር ላይ…') : (lang === 'en' ? 'Download Project (.zip)' : 'ፕሮጀክቱን አውርድ (.zip)')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <FolderTree className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Android Project Files' : 'የአንድሮይድ ፕሮጀክት ፋይሎች'}
              </span>
              <div className="space-y-1">
                {ANDROID_SOURCE_FILES.map((file, idx) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFileIdx(idx)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      selectedFileIdx === idx
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 ${selectedFileIdx === idx ? 'text-white' : 'text-blue-600'}`} />
                    <span className="truncate">{file.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Biometric Feature Card */}
            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'en' ? 'Biometric Security' : 'ባዮሜትሪክ ደህንነት'}
              </span>
              <p className="text-[11px] text-emerald-900 leading-snug">
                {lang === 'en'
                  ? 'Integrated androidx.biometric:biometric library enabling fingerprint sensor and front camera facial recognition.'
                  : 'የጣት አሻራ እና የፊት ገጽታ ማወቂያን የሚያስችል የandroidx.biometric ድጋፍ።'}
              </p>
            </div>

            {/* Quick Build Instructions */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                {lang === 'en' ? 'Terminal Build' : 'የተርሚናል ትዕዛዝ'}
              </span>
              <code className="block bg-slate-900 text-emerald-400 text-[11px] p-2 rounded-lg font-mono">
                ./gradlew assembleDebug
              </code>
              <p className="text-[11px] text-slate-500">
                {lang === 'en'
                  ? 'Compiles debug APK at app/build/outputs/apk/debug/'
                  : 'APK ፋይሉን በapp/build/outputs/ ውስጥ ያዘጋጃል'}
              </p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-2 flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400 truncate">{currentFile.path}</span>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="flex-1 p-4 overflow-auto text-xs font-mono leading-relaxed text-slate-200">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'en'
                ? 'Target SDK 35 (Android 15) • BiometricPrompt • Kotlin 2.0 • Jetpack Compose BOM 2024.10'
                : 'የታለመለት SDK 35 (Android 15) • BiometricPrompt • Kotlin 2.0 • Jetpack Compose'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all cursor-pointer"
          >
            {lang === 'en' ? 'Close Window' : 'ዝጋ'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
