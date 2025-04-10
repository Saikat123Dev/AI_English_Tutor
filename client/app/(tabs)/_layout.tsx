import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Custom dimensions
const TAB_BAR_WIDTH = "98%";
const TAB_ICON_SIZE = 26;
const TAB_BAR_HEIGHT = 72;
const ACTIVE_INDICATOR_HEIGHT = 3;

export default function TabLayout() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: "index", label: "Home" },
    { name: "conversation", label: "Chat" },
    { name: "grammer", label: "Grammar" },
    { name: "pronounciation", label: "Speech" },
    { name: "vocubulary", label: "Words" },
    { name: "profile", label: "Me" },
  ];

  // Animation values
  const animationValues = useRef<{ [key: string]: Animated.Value }>(
    Object.fromEntries(tabs.map(tab => [tab.name, new Animated.Value(1)]))
  ).current;
  const translateYValues = useRef<{ [key: string]: Animated.Value }>(
    Object.fromEntries(tabs.map(tab => [tab.name, new Animated.Value(0)]))
  ).current;
  const opacityValues = useRef<{ [key: string]: Animated.Value }>(
    Object.fromEntries(tabs.map(tab => [tab.name, new Animated.Value(tab.name === "index" ? 1 : 0.7)]))
  ).current;
  const glowValues = useRef<{ [key: string]: Animated.Value }>(
    Object.fromEntries(tabs.map(tab => [tab.name, new Animated.Value(0)]))
  ).current;
  const previousTab = useRef<string>("index");

  if (!isSignedIn) return <Redirect href="/auth" />;
  if (isSignedIn && user?.unsafeMetadata?.onboarding_completed !== true) {
    return <Redirect href="/auth/complete-your-account" />;
  }

  const handleTabPress = (tabName: string) => {
    const prevTab = previousTab.current;
    previousTab.current = tabName;

    // Reset previous tab animations
    Animated.parallel([
      Animated.timing(opacityValues[prevTab], {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYValues[prevTab], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate new tab
    Animated.parallel([
      Animated.timing(opacityValues[tabName], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(translateYValues[tabName], {
          toValue: -12,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(translateYValues[tabName], {
          toValue: -5,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(glowValues[tabName], {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(glowValues[tabName], {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(animationValues[tabName], {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(animationValues[tabName], {
          toValue: 1.1,
          tension: 80,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(animationValues[tabName], {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const CustomTabBarIcon = ({ name, focused, tabName }: {
    name: React.ComponentProps<typeof Ionicons>['name'];
    focused: boolean;
    tabName: string;
  }) => {
    const scale = animationValues[tabName];
    const translateY = translateYValues[tabName];
    const opacity = opacityValues[tabName];
    const glow = glowValues[tabName];

    return (
      <Animated.View
        style={{
          transform: [{ scale }, { translateY }],
          opacity,
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          paddingVertical: 8,
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(124, 58, 237, 0.2)',
            opacity: glow.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.6],
            }),
          }}
        />
        <View
          style={[
            styles.iconContainer,
            focused && styles.activeIconContainer,
          ]}
        >
          <Ionicons
            size={TAB_ICON_SIZE}
            name={name}
            color={focused ? '#FFF' : 'rgba(255,255,255,0.7)'}
          />
        </View>

        {focused && (
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                transform: [{
                  scaleX: glow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  })
                }]
              }
            ]}
          />
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            {
              height: TAB_BAR_HEIGHT + insets.bottom,
              paddingBottom: insets.bottom + 4,
              width: TAB_BAR_WIDTH,
              alignSelf: 'center',
            },
          ],
        }}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            listeners={{ tabPress: () => handleTabPress(tab.name) }}
            options={{
              tabBarIcon: ({ focused }) => (
                <CustomTabBarIcon
                  name={getIconName(tab.name, focused)}
                  focused={focused}
                  tabName={tab.name}
                />
              ),
            }}
          />
        ))}
      </Tabs>
    </View>
  );
}

function getIconName(tab: string, focused: boolean) {
  const icons = {
    index: { active: "home", inactive: "home-outline" },
    conversation: { active: "chatbubble-ellipses", inactive: "chatbubble-ellipses-outline" },
    grammer: { active: "book", inactive: "book-outline" },
    pronounciation: { active: "mic", inactive: "mic-outline" },
    vocubulary: { active: "library", inactive: "library-outline" },
    profile: { active: "person-circle", inactive: "person-circle-outline" },
  };
  return focused ? icons[tab].active : icons[tab].inactive;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tabBar: {
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 11, 75, 0.8)',
    borderWidth: 4,
    borderColor: 'rgba(124, 58, 255, 0.9)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
  },
  activeIndicator: {
    width: 24,
    height: ACTIVE_INDICATOR_HEIGHT,
    backgroundColor: '#FFF',
    borderRadius: 2,
    marginTop: 4,
  },
});
