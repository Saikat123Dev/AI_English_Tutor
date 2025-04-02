import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useRef } from "react";
import { Animated, Dimensions, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const TAB_BAR_WIDTH = width; // Full width for a grounded tab bar
const TAB_ICON_SIZE = 28;

export default function TabLayout() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();

  const tabs = ["index", "conversation", "grammer", "pronounciation", "vocubulary", "profile", "settings"];
  const animationValues = useRef<{ [key: string]: Animated.Value }>(
    Object.fromEntries(tabs.map(tab => [tab, new Animated.Value(1)]))
  ).current;
  const translateYValues = useRef<{ [key: string]: Animated.Value }>(
    Object.fromEntries(tabs.map(tab => [tab, new Animated.Value(0)]))
  ).current;
  const opacityValues = useRef<{ [key: string]: Animated.Value }>(
    Object.fromEntries(tabs.map(tab => [tab, new Animated.Value(tab === "index" ? 1 : 0.5)]))
  ).current;
  const glowValues = useRef<{ [key: string]: Animated.Value }>(
    Object.fromEntries(tabs.map(tab => [tab, new Animated.Value(0)]))
  ).current;
  const previousTab = useRef<string>("index");

  if (!isSignedIn) return <Redirect href="/auth" />;
  if (isSignedIn && user?.unsafeMetadata?.onboarding_completed !== true) {
    return <Redirect href="/auth/complete-your-account" />;
  }

  const handleTabPress = (tabName: string) => {
    const prevTab = previousTab.current;
    previousTab.current = tabName;

    Animated.parallel([
      Animated.timing(opacityValues[prevTab], {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValues[tabName], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
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
    ]).start();

    Animated.sequence([
      Animated.spring(translateYValues[tabName], {
        toValue: -15,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(translateYValues[tabName], {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    if (prevTab !== tabName) {
      Animated.timing(translateYValues[prevTab], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

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
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: '#4A6FA5',
            opacity: glow.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.1],
            }),
            transform: [
              {
                scale: glow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
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
            color={focused ? '#4A6FA5' : '#666666'}
          />
        </View>
        <Animated.View
          style={[
            styles.activeIndicator,
            { opacity: focused ? 1 : 0 },
          ]}
        />
      </Animated.View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            width: TAB_BAR_WIDTH,
            paddingBottom: insets.bottom, // Adjust for safe area
          },
        ],
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab}
          name={tab}
          listeners={{ tabPress: () => handleTabPress(tab) }}
          options={{
            tabBarIcon: ({ focused }) => (
              <CustomTabBarIcon
                name={getIconName(tab, focused)}
                focused={focused}
                tabName={tab}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

function getIconName(tab: string, focused: boolean) {
  const icons = {
    index: { active: "home", inactive: "home-outline" },
    conversation: { active: "chatbubbles", inactive: "chatbubbles-outline" },
    grammer: { active: "book", inactive: "book-outline" },
    pronounciation: { active: "mic", inactive: "mic-outline" },
    vocubulary: { active: "library", inactive: "library-outline" },
    profile: { active: "person", inactive: "person-outline" },
    settings: { active: "settings", inactive: "settings-outline" },
  };
  return focused ? icons[tab].active : icons[tab].inactive;
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    height: 70 + Platform.select({ ios: 0, android: 10 }), // Slightly taller for balance
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: '#F5F8FF',
    shadowColor: '#4A6FA5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A6FA5',
    marginTop: 4,
  },
});
