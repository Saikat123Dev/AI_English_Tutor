import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RadioButtonInput from "@/components/Forms/RadioButtonInput";
import TextInput from "@/components/Forms/TextInput";

const CompleteYourAccountScreen = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, setError, setValue } = useForm({
    defaultValues: {
      full_name: "",
      username: "",
      gender: "",
      motherToung: "",
      englishLevel: "",
      learningGoal: "",
      interests: "",
      focus: "",
      voice: "",
    },
  });

  const onSubmit = async (data) => {
    const {
      full_name,
      username,
      gender,
      motherToung,
      englishLevel,
      learningGoal,
      interests,
      focus,
      voice
    } = data;

    try {
      setIsLoading(true);

      // Update Clerk user profile
      await user?.update({
        username: username,
        firstName: full_name.split(" ")[0],
        lastName: full_name.split(" ")[1] || "",
        unsafeMetadata: {
          gender,
          onboarding_completed: true,
        },
      });

      await user?.reload();

      // Create or update user in your database
      const email = user?.primaryEmailAddress?.emailAddress;
      if (email) {
        const response = await fetch("https://fd79-14-139-220-69.ngrok-free.app/api/auth/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            motherToung,
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

      return router.push("/(tabs)");
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.message === "That username is taken. Please try another.") {
        return setError("username", { message: "Username is already taken" });
      }

      return setError("full_name", { message: "An error occurred while updating profile" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    setValue("full_name", user?.fullName || "");
    setValue("username", user?.username || "");
    setValue("gender", String(user?.unsafeMetadata?.gender) || "");

    // Load additional fields from metadata if available
    const metadata = user?.unsafeMetadata;
    if (metadata) {
      setValue("motherToung", metadata.motherToung || "");
      setValue("englishLevel", metadata.englishLevel || "");
      setValue("learningGoal", metadata.learningGoal || "");
      setValue("interests", metadata.interests || "");
      setValue("focus", metadata.focus || "");
      setValue("voice", metadata.voice || "");
    }
  }, [isLoaded, user]);

  const englishLevels = [
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
  ];

  const focusOptions = [
    { label: "Speaking", value: "speaking" },
    { label: "Listening", value: "listening" },
    { label: "Reading", value: "reading" },
    { label: "Writing", value: "writing" },
  ];

  const voiceOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.headingContainer}>
          <Text style={styles.label}>Complete your account</Text>
          <Text style={styles.description}>
            Complete your account to start your language learning journey with thousands of
            learners around the world.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            control={control}
            placeholder="Enter your full name"
            label="Full Name"
            required
            name="full_name"
          />

          <TextInput
            control={control}
            placeholder="Enter your username"
            label="Username"
            required
            name="username"
          />

          <RadioButtonInput
            control={control}
            placeholder="Select your gender"
            label="Gender"
            required
            name="gender"
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ]}
          />

          <TextInput
            control={control}
            placeholder="Enter your native language"
            label="Native Language"
            required
            name="motherToung"
          />

          <RadioButtonInput
            control={control}
            placeholder="Select your English level"
            label="English Level"
            required
            name="englishLevel"
            options={englishLevels}
          />

          <TextInput
            control={control}
            placeholder="What is your learning goal?"
            label="Learning Goal"
            required
            name="learningGoal"
          />

          <TextInput
            control={control}
            placeholder="Enter your interests (comma separated)"
            label="Interests"
            name="interests"
          />

          <RadioButtonInput
            control={control}
            placeholder="Select your primary focus"
            label="Learning Focus"
            required
            name="focus"
            options={focusOptions}
          />

          <RadioButtonInput
            control={control}
            placeholder="Select preferred AI voice"
            label="Preferred Voice"
            required
            name="voice"
            options={voiceOptions}
          />

          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : null}
              <Text style={styles.buttonText}>
                {isLoading ? "Loading..." : "Complete Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default CompleteYourAccountScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    gap: 20,
  },
  headingContainer: {
    width: "100%",
    gap: 5,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "gray",
  },
  formContainer: {
    width: "100%",
    marginTop: 20,
    gap: 20,
  },
  textIput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    width: "100%",
  },
  button: {
    width: "100%",
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  buttonText: {
    color: "white",
  },
});
