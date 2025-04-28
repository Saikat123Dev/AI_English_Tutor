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

import HorizontalScrollRadioButtonInput from "@/components/Forms/HorizontalRadioButton";
import MultiSelectInput from "@/components/Forms/MultiSelectInput";
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
      // New fields
      occupation: "",
      studyTime: "",
      preferredTopics: [],
      challengeAreas: [],
      learningStyle: "",
      practiceFrequency: "",
      vocabularyLevel: "",
      grammarKnowledge: "",
      previousExperience: "",
      preferredContentType: [],
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
      voice,
      // New fields
      occupation,
      studyTime,
      preferredTopics,
      challengeAreas,
      learningStyle,
      practiceFrequency,
      vocabularyLevel,
      grammarKnowledge,
      previousExperience,
      preferredContentType,
    } = data;

    try {
      setIsLoading(true);

      // Update Clerk user profile with all fields in unsafeMetadata
      await user?.update({
        username: username,
        firstName: full_name.split(" ")[0],
        lastName: full_name.split(" ")[1] || "",
        unsafeMetadata: {
          gender,
          motherToung,
          englishLevel,
          learningGoal,
          interests,
          focus,
          voice,
          // New fields
          occupation,
          studyTime,
          preferredTopics,
          challengeAreas,
          learningStyle,
          practiceFrequency,
          vocabularyLevel,
          grammarKnowledge,
          previousExperience,
          preferredContentType,
          onboarding_completed: true,
        },
      });

      await user?.reload();

      // Create or update user in your database
      const email = user?.primaryEmailAddress?.emailAddress;
      if (email) {
        const response = await fetch("https://ai-english-tutor-9ixt.onrender.com/api/auth/create", {
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
            // New fields
            occupation,
            studyTime,
            preferredTopics,
            challengeAreas,
            learningStyle,
            practiceFrequency,
            vocabularyLevel,
            grammarKnowledge,
            previousExperience,
            preferredContentType,
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
    const metadata = user?.unsafeMetadata;
    if (metadata) {
      setValue("motherToung", metadata.motherToung || "");
      setValue("englishLevel", metadata.englishLevel || "");
      setValue("learningGoal", metadata.learningGoal || "");
      setValue("interests", metadata.interests || "");
      setValue("focus", metadata.focus || "");
      setValue("voice", metadata.voice || "");
      // New fields
      setValue("occupation", metadata.occupation || "");
      setValue("studyTime", metadata.studyTime || "");
      setValue("preferredTopics", metadata.preferredTopics || []);
      setValue("challengeAreas", metadata.challengeAreas || []);
      setValue("learningStyle", metadata.learningStyle || "");
      setValue("practiceFrequency", metadata.practiceFrequency || "");
      setValue("vocabularyLevel", metadata.vocabularyLevel || "");
      setValue("grammarKnowledge", metadata.grammarKnowledge || "");
      setValue("previousExperience", metadata.previousExperience || "");
      setValue("preferredContentType", metadata.preferredContentType || []);
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

  // New option arrays for the additional fields
  const studyTimeOptions = [
    { label: "Less than 15 minutes/day", value: "under15" },
    { label: "15-30 minutes/day", value: "15to30" },
    { label: "30-60 minutes/day", value: "30to60" },
    { label: "1+ hours/day", value: "over60" },
  ];

  const topicOptions = [
    { label: "Business", value: "business" },
    { label: "Travel", value: "travel" },
    { label: "Academic", value: "academic" },
    { label: "Daily Conversation", value: "conversation" },
    { label: "Culture & Entertainment", value: "culture" },
    { label: "Technology", value: "technology" },
    { label: "Health & Medicine", value: "health" },
    { label: "Science", value: "science" },
  ];

  const challengeOptions = [
    { label: "Pronunciation", value: "pronunciation" },
    { label: "Grammar", value: "grammar" },
    { label: "Vocabulary", value: "vocabulary" },
    { label: "Listening Comprehension", value: "listening" },
    { label: "Speaking Fluency", value: "speaking" },
    { label: "Writing Skills", value: "writing" },
    { label: "Reading Comprehension", value: "reading" },
    { label: "Idioms & Expressions", value: "idioms" },
  ];

  const learningStyleOptions = [
    { label: "Visual", value: "visual" },
    { label: "Auditory", value: "auditory" },
    { label: "Reading/Writing", value: "readwrite" },
    { label: "Kinesthetic", value: "kinesthetic" },
  ];

  const practiceFrequencyOptions = [
    { label: "Daily", value: "daily" },
    { label: "Several times a week", value: "multiple" },
    { label: "Once a week", value: "weekly" },
    { label: "Less often", value: "occasional" },
  ];

  const vocabularyLevelOptions = [
    { label: "Basic (under 1000 words)", value: "basic" },
    { label: "Elementary (1000-2000 words)", value: "elementary" },
    { label: "Intermediate (2000-5000 words)", value: "intermediate" },
    { label: "Advanced (5000+ words)", value: "advanced" },
  ];

  const grammarKnowledgeOptions = [
    { label: "Basic tenses only", value: "basic" },
    { label: "Familiar with most tenses", value: "intermediate" },
    { label: "Confident with complex structures", value: "advanced" },
    { label: "Not sure", value: "unknown" },
  ];

  const experienceOptions = [
    { label: "Self-study only", value: "self" },
    { label: "Some classes/tutoring", value: "some" },
    { label: "Formal education", value: "formal" },
    { label: "Lived in English-speaking country", value: "immersion" },
    { label: "No previous experience", value: "none" },
  ];

  const contentTypeOptions = [
    { label: "Articles & Blog Posts", value: "articles" },
    { label: "Videos", value: "videos" },
    { label: "Podcasts & Audio", value: "audio" },
    { label: "Interactive Exercises", value: "interactive" },
    { label: "Games", value: "games" },
    { label: "Conversations with AI", value: "ai" },
  ];

  const accentPreferenceOptions = [
    { label: "American", value: "american" },
    { label: "British", value: "british" },
    { label: "Australian", value: "australian" },
    { label: "No preference", value: "none" },
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
            learners around the world. The more information you provide, the better we can
            personalize your learning experience.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Basic Info Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

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
              name="motherTongue"
            />

            <TextInput
              control={control}
              placeholder="What is your occupation?"
              label="Occupation"
              name="occupation"
            />
          </View>

          {/* Language Proficiency Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Language Proficiency</Text>

            <RadioButtonInput
              control={control}
              placeholder="Select your English level"
              label="English Level"
              required
              name="englishLevel"
              options={englishLevels}
            />

            {/* Changed to horizontal scroll */}
            <HorizontalScrollRadioButtonInput
              control={control}
              placeholder="Select your vocabulary level"
              label="Vocabulary Level"
              name="vocabularyLevel"
              options={vocabularyLevelOptions}
            />

            {/* Changed to horizontal scroll */}

            {/* Changed to horizontal scroll */}
            <HorizontalScrollRadioButtonInput
              control={control}
              placeholder="Previous English learning experience"
              label="Previous Experience"
              name="previousExperience"
              options={experienceOptions}
            />
          </View>

          {/* Learning Preferences Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Learning Preferences</Text>

            <TextInput
              control={control}
              placeholder="What is your learning goal?"
              label="Learning Goal"
              required
              name="learningGoal"
            />

            {/* Changed to horizontal scroll */}
            <HorizontalScrollRadioButtonInput
              control={control}
              placeholder="Select your primary focus"
              label="Learning Focus"
              required
              name="focus"
              options={focusOptions}
            />

            <MultiSelectInput
              control={control}
              placeholder="Select areas you find challenging"
              label="Challenge Areas"
              name="challengeAreas"
              options={challengeOptions}
            />



            {/* Changed to horizontal scroll */}
            <HorizontalScrollRadioButtonInput
              control={control}
              placeholder="How often do you plan to practice?"
              label="Practice Frequency"
              name="practiceFrequency"
              options={practiceFrequencyOptions}
            />

            {/* Changed to horizontal scroll */}
            <HorizontalScrollRadioButtonInput
              control={control}
              placeholder="How much time can you dedicate daily?"
              label="Daily Study Time"
              name="studyTime"
              options={studyTimeOptions}
            />
          </View>

          {/* Content Preferences Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Content Preferences</Text>

            <TextInput
              control={control}
              placeholder="Enter your interests (comma separated)"
              label="Interests"
              name="interests"
            />

            <MultiSelectInput
              control={control}
              placeholder="Select topics you're interested in"
              label="Preferred Topics"
              name="preferredTopics"
              options={topicOptions}
            />

            <MultiSelectInput
              control={control}
              placeholder="Select content types you prefer"
              label="Preferred Content Types"
              name="preferredContentType"
              options={contentTypeOptions}
            />
          </View>

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
  sectionContainer: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    gap: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
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
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
