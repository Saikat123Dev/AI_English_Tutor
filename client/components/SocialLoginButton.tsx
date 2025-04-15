import { useOAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SocialLoginButton = ({
  strategy,
}: {
  strategy: "facebook" | "google" | "apple";
}) => {
  const getStrategy = () => {
    if (strategy === "facebook") {
      return "oauth_facebook";
    } else if (strategy === "google") {
      return "oauth_google";
    } else if (strategy === "apple") {
      return "oauth_apple";
    }
    return "oauth_facebook";
  };

  const { startOAuthFlow } = useOAuth({ strategy: getStrategy() });
  const { user, isLoaded, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation for loading overlay
  const spinAnim = useRef(new Animated.Value(0)).current; // Animation for spinning loader

  const buttonText = () => {
    if (isLoading) {
      return "Loading...";
    }
    if (strategy === "facebook") {
      return "Continue with Facebook";
    } else if (strategy === "google") {
      return "Continue with Google";
    } else if (strategy === "apple") {
      return "Continue with Apple";
    }
  };

  const buttonIcon = () => {
    if (strategy === "facebook") {
      return <Ionicons name="logo-facebook" size={24} color="#1977F3" />;
    } else if (strategy === "google") {
      return <Ionicons name="logo-google" size={24} color="#DB4437" />;
    } else if (strategy === "apple") {
      return <Ionicons name="logo-apple" size={24} color="black" />;
    }
  };

  // Start loading animation
  const startLoadingAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  };

  // Stop loading animation
  const stopLoadingAnimation = (callback?: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      spinAnim.setValue(0); // Reset spin
      if (callback) callback();
    });
  };

  // Create user in database
  const createUserInDatabase = async (email: string) => {
    try {
      console.log("Attempting to create user with email:", email);
      const response = await fetch(
        `https://ai-english-tutor-9ixt.onrender.com/api/auth/create`,
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      console.log("Response received:", response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create user: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("User created in database:", data.user);
      return data.user;
    } catch (error) {
      console.error("Error creating user in database:", error);
      Alert.alert(
        "Database Error",
        "Authentication was successful, but we couldn't create your user profile. Please try again."
      );
      throw error;
    }
  };

  // Check if profile is complete
  const isProfileComplete = (userData: any) => {
    return !!(
      userData &&
      userData.englishLevel &&
      userData.learningGoal &&
      userData.interests &&
      userData.focus &&
      userData.voice &&
      userData.motherToung
    );
  };

  // Effect to run when user data is loaded after sign-in
  React.useEffect(() => {
    const handleUserData = async () => {
      // Only proceed if user is loaded, signed in, and we're in a loading state
      if (isLoaded && isSignedIn && isLoading && user?.primaryEmailAddress) {
        try {
          const email = user.primaryEmailAddress.emailAddress;
          console.log("User email found:", email);

          // Create user in database
          const userData = await createUserInDatabase(email);

          // Check if all required fields are filled
          if (isProfileComplete(userData)) {
            // All required fields are filled, redirect to /(tabs)
            console.log("All fields filled, redirecting to /(tabs)");
            stopLoadingAnimation(() => router.replace("/(tabs)"));
          } else {
            // Not all fields are filled, redirect to complete account
            console.log("Fields missing, redirecting to /auth/complete-your-profile");
            stopLoadingAnimation(() =>
              router.replace("/auth/complete-your-account")
            );
          }
        } catch (error) {
          console.error("Error handling user data:", error);
          stopLoadingAnimation(() => setIsLoading(false));
        }
      }
    };

    handleUserData();
  }, [isLoaded, isSignedIn, user, isLoading]);

  const onSocialLoginPress = React.useCallback(async () => {
    try {
      setIsLoading(true);
      startLoadingAnimation();

      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/", {
          scheme: "myapp",
        }),
      });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        console.log("Session created", createdSessionId);
        await setActive!({ session: createdSessionId });
        // Don't try to access user data here - the useEffect will handle it
        // after Clerk has updated the user state
      } else {
        // No session created, end loading state
        stopLoadingAnimation(() => setIsLoading(false));
      }
    } catch (err) {
      console.error("OAuth error:", JSON.stringify(err, null, 2));
      stopLoadingAnimation(() => setIsLoading(false));
      Alert.alert(
        "Authentication Error",
        "There was a problem with the authentication process. Please try again."
      );
    }
  }, []);

  // Interpolate spin animation for rotation
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <>
      <TouchableOpacity
        style={[styles.container]}
        onPress={onSocialLoginPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="black" />
        ) : (
          buttonIcon()
        )}
        <Text style={styles.buttonText}>{buttonText()}</Text>
        <View />
      </TouchableOpacity>

      {/* Loading Overlay */}
      <Modal
        transparent={true}
        animationType="none"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <Animated.View
          style={[
            styles.loadingOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Animated.View
            style={{
              transform: [{ rotate: spin }],
            }}
          >
            <Ionicons name="refresh-circle" size={60} color="white" />
          </Animated.View>
          <Text style={styles.loadingText}>Signing you in...</Text>
        </Animated.View>
      </Modal>
    </>
  );
};

export default SocialLoginButton;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderColor: "gray",
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500", // Updated to string for medium weight
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
