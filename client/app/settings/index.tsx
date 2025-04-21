import { SignedIn, useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';
import { BlurView } from "expo-blur";
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SettingsScreen = () => {
  const { user } = useClerk();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Language learning profile state
  const [motherTongue, setMotherTongue] = useState(user?.unsafeMetadata?.motherToung || "");
  const [englishLevel, setEnglishLevel] = useState(user?.unsafeMetadata?.englishLevel || "intermediate");
  const [learningGoal, setLearningGoal] = useState(user?.unsafeMetadata?.learningGoal || "");
  const [interests, setInterests] = useState(user?.unsafeMetadata?.interests || "");
  const [focus, setFocus] = useState(user?.unsafeMetadata?.focus || "speaking");
  const [voice, setVoice] = useState(user?.unsafeMetadata?.voice || "female");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      })
    ]).start();

    const metadata = user?.unsafeMetadata;
    if (metadata) {
      setMotherTongue(metadata.motherToung || "");
      setEnglishLevel(metadata.englishLevel || "intermediate");
      setLearningGoal(metadata.learningGoal || "");
      setInterests(metadata.interests || "");
      setFocus(metadata.focus || "speaking");
      setVoice(metadata.voice || "female");
    }
  }, []);

  const handleEdit = () => {
    console.log("Edit button pressed, isEditing:", isEditing);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(err => console.error("Haptics error:", err));
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await user?.update({
        username,
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ")[1] || "",
        unsafeMetadata: {
          ...user?.unsafeMetadata,
          motherToung: motherTongue,
          englishLevel,
          learningGoal,
          interests,
          focus,
          voice
        },
      });

      const email = user?.primaryEmailAddress?.emailAddress;
      if (email) {
        const response = await fetch("https://ai-english-tutor-9ixt.onrender.com/api/auth/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            motherToung: motherTongue,
            englishLevel,
            learningGoal,
            interests,
            focus,
            voice,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update user profile in database");
        }
      }

      setIsEditing(false);
      Alert.alert("Success", "Your profile has been updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFullName(user?.fullName || "");
    setUsername(user?.username || "");

    const metadata = user?.unsafeMetadata;
    if (metadata) {
      setMotherTongue(metadata.motherToung || "");
      setEnglishLevel(metadata.englishLevel || "intermediate");
      setLearningGoal(metadata.learningGoal || "");
      setInterests(metadata.interests || "");
      setFocus(metadata.focus || "speaking");
      setVoice(metadata.voice || "female");
    }

    setIsEditing(false);
  };

  const renderPicker = (label, value, setValue, options) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <View style={[styles.inputContainer, styles.pickerContainer]}>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => setValue(itemValue)}
            style={styles.picker}
          >
            {options.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>
      ) : (
        <View style={[styles.inputContainer, styles.disabledInput]}>
          <Text style={styles.inputText}>
            {options.find(opt => opt.value === value)?.label || "Not set"}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <SignedIn>
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                </Text>
              </View>
              <Text style={styles.headerText}>Your Profile</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.cardContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <BlurView intensity={90} tint="light" style={styles.blurContainer}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.heading}>Profile Information</Text>
                    <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                      <Ionicons name="pencil" size={18} color="#2A9D8F" />
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email</Text>
                      <View style={[styles.inputContainer, styles.disabledInput]}>
                        <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                        <Text style={styles.inputText}>
                          {user?.emailAddresses[0]?.emailAddress || "Not provided"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Full Name</Text>
                      {isEditing ? (
                        <View style={styles.inputContainer}>
                          <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter your full name"
                            autoCapitalize="words"
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>
                      ) : (
                        <View style={[styles.inputContainer, styles.disabledInput]}>
                          <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                          <Text style={styles.inputText}>{user?.fullName || "Not provided"}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Username</Text>
                      {isEditing ? (
                        <View style={styles.inputContainer}>
                          <Ionicons name="at-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter your username"
                            autoCapitalize="none"
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>
                      ) : (
                        <View style={[styles.inputContainer, styles.disabledInput]}>
                          <Ionicons name="at-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                          <Text style={styles.inputText}>{user?.username || "Not provided"}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View
              style={[
                styles.cardContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <BlurView intensity={90} tint="light" style={styles.blurContainer}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.heading}>Language Learning Profile</Text>
                  </View>

                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Native Language</Text>
                      {isEditing ? (
                        <View style={styles.inputContainer}>
                          <Ionicons name="language-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={motherTongue}
                            onChangeText={setMotherTongue}
                            placeholder="Your native language"
                            autoCapitalize="words"
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>
                      ) : (
                        <View style={[styles.inputContainer, styles.disabledInput]}>
                          <Ionicons name="language-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                          <Text style={styles.inputText}>{motherTongue || "Not provided"}</Text>
                        </View>
                      )}
                    </View>

                    {renderPicker("English Level", englishLevel, setEnglishLevel, [
                      { label: "Beginner", value: "beginner" },
                      { label: "Intermediate", value: "intermediate" },
                      { label: "Advanced", value: "advanced" },
                    ])}

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Learning Goal</Text>
                      {isEditing ? (
                        <View style={styles.inputContainer}>
                          <Ionicons name="trophy-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={learningGoal}
                            onChangeText={setLearningGoal}
                            placeholder="Your language learning goal"
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>
                      ) : (
                        <View style={[styles.inputContainer, styles.disabledInput]}>
                          <Ionicons name="trophy-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                          <Text style={styles.inputText}>{learningGoal || "Not provided"}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Interests</Text>
                      {isEditing ? (
                        <View style={styles.inputContainer}>
                          <Ionicons name="heart-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={interests}
                            onChangeText={setInterests}
                            placeholder="Your interests (comma separated)"
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>
                      ) : (
                        <View style={[styles.inputContainer, styles.disabledInput]}>
                          <Ionicons name="heart-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                          <Text style={styles.inputText}>{interests || "Not provided"}</Text>
                        </View>
                      )}
                    </View>

                    {renderPicker("Learning Focus", focus, setFocus, [
                      { label: "Speaking", value: "speaking" },
                      { label: "Listening", value: "listening" },
                      { label: "Reading", value: "reading" },
                      { label: "Writing", value: "writing" },
                    ])}

                    {renderPicker("Preferred Voice", voice, setVoice, [
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                    ])}
                  </View>
                </View>
              </BlurView>
            </Animated.View>



            {isEditing && (
              <Animated.View
                style={[
                  styles.buttonContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.savingButton]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#F9FAFB" />
                  ) : (
                    <Text style={styles.saveText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}
          </SignedIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#2A9D8F",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#6EE7B7",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.5,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 600,
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
  },
  blurContainer: {
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(110, 231, 183, 0.3)",
  },
  card: {
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.3,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(42, 157, 143, 0.1)",
  },
  editText: {
    marginLeft: 6,
    color: "#2A9D8F",
    fontWeight: "600",
    fontSize: 15,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    width: "100%",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    height: "100%",
    fontWeight: "500",
  },
  disabledInput: {
    backgroundColor: "rgba(243, 244, 246, 0.7)",
  },
  inputText: {
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 14,
    fontWeight: "500",
  },
  pickerContainer: {
    padding: 0,
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
    height: 52,
    color: "#1F2937",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    maxWidth: 600,
    gap: 16,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelText: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#2A9D8F",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  savingButton: {
    backgroundColor: "#6EE7B7",
  },
  saveText: {
    color: "#F9FAFB",
    fontWeight: "600",
    fontSize: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(209, 213, 219, 0.3)",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  settingText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
});
