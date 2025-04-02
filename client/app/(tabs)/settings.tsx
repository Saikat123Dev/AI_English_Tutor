import { SignedIn, useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
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
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SettingsScreen = () => {
  const { signOut, user } = useClerk();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user info (in a real app, this would call user.update())
      // await user?.update({ firstName, lastName, username });

      setIsEditing(false);
      Alert.alert("Success", "Your profile has been updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFullName(user?.fullName || "");
    setUsername(user?.username || "");
    setIsEditing(false);
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => signOut(), style: "destructive" }
      ]
    );
  };

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
              <Text style={styles.headerText}>Account Settings</Text>
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
              <BlurView intensity={80} tint="light" style={styles.blurContainer}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.heading}>Profile Information</Text>
                    {!isEditing ? (
                      <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                        <Ionicons name="pencil" size={18} color="#007AFF" />
                        <Text style={styles.editText}>Edit</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email</Text>
                      <View style={[styles.inputContainer, styles.disabledInput]}>
                        <Ionicons name="mail-outline" size={20} color="#777" style={styles.inputIcon} />
                        <Text style={styles.inputText}>
                          {user?.emailAddresses[0]?.emailAddress || "Not provided"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Full Name</Text>
                      {isEditing ? (
                        <View style={styles.inputContainer}>
                          <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter your full name"
                            autoCapitalize="words"
                          />
                        </View>
                      ) : (
                        <View style={[styles.inputContainer, styles.disabledInput]}>
                          <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
                          <Text style={styles.inputText}>{user?.fullName || "Not provided"}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Username</Text>
                      {isEditing ? (
                        <View style={styles.inputContainer}>
                          <Ionicons name="at-outline" size={20} color="#777" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter your username"
                            autoCapitalize="none"
                          />
                        </View>
                      ) : (
                        <View style={[styles.inputContainer, styles.disabledInput]}>
                          <Ionicons name="at-outline" size={20} color="#777" style={styles.inputIcon} />
                          <Text style={styles.inputText}>{user?.username || "Not provided"}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {isEditing && (
                    <View style={styles.buttonGroup}>
                      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.savingButton]}
                        onPress={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.saveText}>Save Changes</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
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
              <BlurView intensity={80} tint="light" style={styles.blurContainer}>
                <View style={styles.card}>
                  <Text style={styles.heading}>Preferences</Text>

                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Ionicons name="moon-outline" size={22} color="#555" />
                      <Text style={styles.settingText}>Dark Mode</Text>
                    </View>
                    <Switch
                      value={darkMode}
                      onValueChange={setDarkMode}
                      trackColor={{ false: "#D1D1D6", true: "#81b0ff" }}
                      thumbColor={darkMode ? "#007AFF" : "#f4f3f4"}
                      ios_backgroundColor="#D1D1D6"
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Ionicons name="notifications-outline" size={22} color="#555" />
                      <Text style={styles.settingText}>Notifications</Text>
                    </View>
                    <Switch
                      value={notifications}
                      onValueChange={setNotifications}
                      trackColor={{ false: "#D1D1D6", true: "#81b0ff" }}
                      thumbColor={notifications ? "#007AFF" : "#f4f3f4"}
                      ios_backgroundColor="#D1D1D6"
                    />
                  </View>
                </View>
              </BlurView>
            </Animated.View>

            <AnimatedTouchable
              style={[
                styles.logoutButton,
                {
                  opacity: fadeAnim,
                  transform: [
                    { scale: scaleAnim }
                  ]
                }
              ]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.logoutText}>Logout</Text>
            </AnimatedTouchable>
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
    backgroundColor: "#F0F4F8",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  cardContainer: {
    width: "100%",
    maxWidth: 500,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  blurContainer: {
    overflow: "hidden",
    borderRadius: 16,
  },
  card: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  editText: {
    marginLeft: 4,
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
  },
  disabledInput: {
    backgroundColor: "rgba(245, 245, 245, 0.6)",
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
  },
  cancelText: {
    color: "#555",
    fontWeight: "600",
    fontSize: 15,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    minWidth: 120,
    alignItems: "center",
  },
  savingButton: {
    backgroundColor: "#5CA5FF",
  },
  saveText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "100%",
    maxWidth: 500,
    gap: 8,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
