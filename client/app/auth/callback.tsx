// app/auth/callback.tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthCallback() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        // Handle successful sign-in
        router.replace("/(tabs)");
      } else {
        // Handle failed sign-in
        router.replace("/auth");
      }
    }
  }, [isLoaded, isSignedIn]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
