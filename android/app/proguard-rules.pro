# Proguard rules for Dulhaniya Android App
-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class androidx.browser.customtabs.** { *; }
-keep class androidx.browser.trusted.** { *; }
