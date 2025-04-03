import { useOAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

  // Create user in database
  const createUserInDatabase = async (email) => {
    try {
      console.log("Attempting to create user with email:", email);
      const response = await fetch(`https://3b5b-2409-40e1-3102-6a82-5350-710c-4d20-c0f9.ngrok-free.app/api/auth/create`, {
        method: 'POST',
        headers: {
            "ngrok-skip-browser-warning": "true",
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      console.log("Response received:", response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create user: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('User created in database:', data.user);
      return data.user;
    } catch (error) {
      console.error('Error creating user in database:', error);
      Alert.alert(
        "Database Error",
        "Authentication was successful, but we couldn't create your user profile. Please try again."
      );
      throw error;
    }
  };

  // Effect to run when user data is loaded after sign-in
  React.useEffect(() => {
    const handleUserData = async () => {
      // Only proceed if user is loaded, signed in, and we're in a loading state
      if (isLoaded && isSignedIn && isLoading && user?.primaryEmailAddress) {
        try {
          const email = user.primaryEmailAddress.emailAddress;
          console.log("User email found:", email);
          await createUserInDatabase(email);
           router.replace("/auth/selectLanguage");
        } catch (error) {
          console.error("Error handling user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleUserData();
  }, [isLoaded, isSignedIn, user, isLoading]);

  const onSocialLoginPress = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/auth/selectLanguage", { scheme: "myapp" }),
      });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        console.log("Session created", createdSessionId);
        await setActive!({ session: createdSessionId });
        // Don't try to access user data here - the useEffect will handle it
        // after Clerk has updated the user state
      } else {
        // No session created, end loading state
        setIsLoading(false);
      }
    } catch (err) {
      console.error("OAuth error:", JSON.stringify(err, null, 2));
      setIsLoading(false);
      Alert.alert(
        "Authentication Error",
        "There was a problem with the authentication process. Please try again."
      );
    }
  }, []);

  return (
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
    fontWeight: "medium",
  },
});
