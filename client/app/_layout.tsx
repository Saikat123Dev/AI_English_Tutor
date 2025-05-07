import { useColorScheme } from "@/hooks/useColorScheme";
import { tokenCache } from "@/utils/cache";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  // Animation values for splash screen
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const circleScale1 = useRef(new Animated.Value(0.1)).current;
  const circleScale2 = useRef(new Animated.Value(0.1)).current;
  const circleScale3 = useRef(new Animated.Value(0.1)).current;
  const circleOpacity1 = useRef(new Animated.Value(0.7)).current;
  const circleOpacity2 = useRef(new Animated.Value(0.5)).current;
  const circleOpacity3 = useRef(new Animated.Value(0.3)).current;

  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Prepare app
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Run animations when app is ready
  useEffect(() => {
    if (appIsReady && (fontsLoaded || fontError)) {
      // Start with logo pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ).start();

      // Animate expanding circles
      const pulseCircles = () => {
        Animated.parallel([
          // First circle
          Animated.timing(circleScale1, {
            toValue: 3,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(circleOpacity1, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),

          // Second circle (delayed)
          Animated.sequence([
            Animated.delay(400),
            Animated.parallel([
              Animated.timing(circleScale2, {
                toValue: 3,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(circleOpacity2, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
          ]),

          // Third circle (delayed more)
          Animated.sequence([
            Animated.delay(800),
            Animated.parallel([
              Animated.timing(circleScale3, {
                toValue: 3,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(circleOpacity3, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]).start(() => {
          // After circles animation completes, fade out the splash screen
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            delay: 200,
          }).start(() => {
            // Once fade out completes, hide the splash screen
            setSplashAnimationComplete(true);
            SplashScreen.hideAsync();
          });
        });
      };

      // Start circle animations
      pulseCircles();
    }
  }, [appIsReady, fontsLoaded, fontError]);

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in environment variables");
  }

  // Show loading indicator while fonts and resources are loading
  if (!appIsReady || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading fonts. Please restart the app.</Text>
      </View>
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
              }}
            />
          </Stack>

          {/* Custom animated splash screen overlay */}
          {!splashAnimationComplete && (
            <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
              {/* Animated expanding circles */}
              <Animated.View
                style={[
                  styles.circle,
                  {
                    transform: [{ scale: circleScale1 }],
                    opacity: circleOpacity1,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.circle,
                  {
                    transform: [{ scale: circleScale2 }],
                    opacity: circleOpacity2,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.circle,
                  {
                    transform: [{ scale: circleScale3 }],
                    opacity: circleOpacity3,
                  },
                ]}
              />

              {/* Logo */}
              <Animated.Image
                source={require("../assets/images/sela.png")}
                style={[
                  styles.logo,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
                resizeMode="contain"
              />

              {/* App name with animation */}
              <Animated.Text style={styles.appName}>SELL</Animated.Text>

              {/* Loading text */}
              <Animated.Text style={styles.loadingText}>Loading...</Animated.Text>
            </Animated.View>
          )}
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#033330', // Deep green background
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  circle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#09b3a6', // Lighter green for the circles
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#09b3a6',
    marginTop: 40,
    opacity: 0.8,
  },
});
