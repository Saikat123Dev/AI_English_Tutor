import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollContext } from './ScrollContext';

const COLORS = {
  // Primary colors
  primary: '#0d9488',           // More vibrant teal (improves accessibility)
  primaryDark: '#115e59',       // Darker shade for better contrast
  primaryLight: '#ccfbf1',      // Soft light teal for backgrounds

  // Accent colors
  accent: '#0f766e',            // Kept original accent
  accentLight: '#5eead4',       // Bright teal for interactive elements

  // Background colors
  background: '#f0fdfa',        // Very light teal (easier on eyes)
  backgroundDark: '#e6f5f3',    // Slightly darker for cards/sections

  // Card colors
  card: '#ffffff',             // Pure white for better content legibility
  cardDark: '#ecfdf5',          // Alternative card color

  // Text colors
  text: '#042f2e',             // Darker for better readability
  textSecondary: '#3f706d',     // Softer teal-gray for secondary text
  textTertiary: '#64748b',      // Neutral gray for less important text

  // Border colors
  border: '#cbd5e1',           // Lighter, neutral border
  borderDark: '#94a3b8',       // For stronger dividers

  // Feedback colors
  error: '#dc2626',            // More vibrant error red
  success: '#16a34a',          // Added success green
  warning: '#f59e0b',          // Added warning amber
  info: '#2563eb',             // Added info blue

  // Neutrals
  white: '#ffffff',
  black: '#000000',
  grayLight: '#f1f5f9',
  gray: '#e2e8f0',
  grayDark: '#94a3b8'
};

interface ProfileOptionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  showChevron?: boolean;
  isLast?: boolean;
  badge?: string | null;
}

function ProfileOption({ title, icon, onPress, showChevron = true, isLast = false, badge = null }: ProfileOptionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.option,
        {
          backgroundColor: COLORS.card,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: COLORS.border
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <View style={[styles.optionIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
          {icon}
        </View>
        <Text style={[styles.optionText, { color: COLORS.text }]}>{title}</Text>
      </View>
      <View style={styles.optionRightContent}>
        {badge && (
          <View style={[styles.badgeContainer, { backgroundColor: COLORS.accent }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

// New skill progress component
function SkillProgressCard({ title, progress, total, icon }) {
  const percentage = Math.min(100, Math.round((progress / total) * 100));

  return (
    <View style={[styles.skillCard, { backgroundColor: COLORS.card }]}>
      <View style={styles.skillHeaderRow}>
        <View style={[styles.skillIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
          {icon}
        </View>
        <Text style={[styles.skillTitle, { color: COLORS.text }]}>{title}</Text>
      </View>

      <View style={styles.skillProgressContainer}>
        <View style={[styles.skillProgressBar, { backgroundColor: COLORS.grayLight }]}>
          <View
            style={[
              styles.skillProgressFill,
              {
                width: `${percentage}%`,
                backgroundColor: COLORS.primary
              }
            ]}
          />
        </View>
        <Text style={[styles.skillProgressText, { color: COLORS.textSecondary }]}>
          {progress} / {total} ({percentage}%)
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useAuth();
  const navigation = useNavigation();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { handleScroll, tabBarHeight } = useContext(ScrollContext);

  // State for user data from backend
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quoteOfDay, setQuoteOfDay] = useState({
    text: "Learning another language is not only learning different words for the same things, but learning another way to think about things.",
    author: "Flora Lewis"
  });

  // Fetch user data from the backend
  useEffect(() => {
    if (isUserLoaded && user) {
      fetchUserData();
    }
  }, [isUserLoaded, user]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);

      // Mock data integration - In production, this would be an API call
      // Replace with your actual API endpoint when needed
      // const response = await fetch(`https://b274-2409-40e1-30cb-b026-2d67-d40e-d280-d57d.ngrok-free.app/api/user-profile?email=${encodeURIComponent(user?.emailAddresses[0]?.emailAddress)}`);
      // const data = await response.json();

      // Using cached profile data you provided
      const data = {
        id: 'cm9y03xc00000jz2quqit7ajr',
        email: 'pinakib075@gmail.com',
        name: 'pinakib075',
        motherToung: null,
        englishLevel: 'beginner',
        learningGoal: 'learning english',
        interests: 'coding',
        focus: 'speaking',
        voice: 'male',
        createdAt: '2025-04-26T09:11:24.288Z',
        occupation: 'business',
        studyTime: 'under15',
        preferredTopics: ['business', 'conversation'],
        challengeAreas: ['pronunciation', 'grammar'],
        learningStyle: null,
        practiceFrequency: 'daily',
        vocabularyLevel: 'basic',
        grammarKnowledge: 'basic',
        previousExperience: 'self',
        preferredContentType: ['articles', 'videos'],
        vocabularyWords: [],
        favorites: [],
        studySessions: [],
        pronunciationAttempts: [],
        dailyStreaks: [],
        stats: {
          vocabularyCount: 0,
          favoritesCount: 0,
          completedSessionsCount: 0,
          totalSessionsCount: 0,
          currentStreak: 0,
          pronunciationAccuracy: 0,
          learningProgress: 0,
          lastActivity: '2025-04-26T09:11:24.288Z'
        }
      };

      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUserData();
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your learning streak will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: handleSignOut, style: 'destructive' }
      ]
    );
  };

  const handleScrollEvent = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleScroll(event);
  };

  if (!isUserLoaded || isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // Create calculated stats from userData
  const userStats = {
    streak: userData?.stats?.currentStreak || 0,
    vocabulary: userData?.stats?.vocabularyCount || 0,
    completedSessions: userData?.stats?.completedSessionsCount || 0,
    level: determineUserLevel(userData),
    pronunciationAccuracy: userData?.stats?.pronunciationAccuracy || 0,
    favoriteWords: userData?.stats?.favoritesCount || 0,
    englishLevel: userData?.englishLevel || 'Beginner',
    motherTongue: userData?.motherToung || 'Not specified',
    learningProgress: userData?.stats?.learningProgress || 0
  };

  // Helper functions for calculating user stats
  function determineUserLevel(userData) {
    if (!userData) return 'Beginner';

    // Use the provided English level if available
    if (userData.englishLevel) {
      // Capitalize first letter
      return userData.englishLevel.charAt(0).toUpperCase() + userData.englishLevel.slice(1);
    }

    return 'Beginner';
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 40 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScrollEvent}
      >
        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="refresh" size={20} color={COLORS.white} />
          )}
        </TouchableOpacity>

        {/* Header with gradient */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.avatarContainer, {
            borderColor: COLORS.background,
            backgroundColor: COLORS.background + '80'
          }]}>
            <Text style={[styles.avatarText, { color: COLORS.text }]}>
              {userData?.name?.[0]?.toUpperCase() || user?.firstName?.[0]?.toUpperCase() || userData?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={[styles.name, { color: COLORS.white }]}>
            {userData?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : userData?.email || 'User')}
          </Text>
          <Text style={[styles.email, { color: 'rgba(255, 255, 255, 0.8)' }]}>
            {userData?.email || user?.emailAddresses[0]?.emailAddress || ''}
          </Text>

          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{userStats.level}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: COLORS.background + '30' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.vocabulary}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: COLORS.background + '30' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.completedSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Learning Profile Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>MY LEARNING PROFILE</Text>

          <View style={[styles.infoCard, { backgroundColor: COLORS.card }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: COLORS.textSecondary }]}>Mother Tongue:</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>{userStats.motherTongue}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: COLORS.textSecondary }]}>English Level:</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>{userStats.englishLevel}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: COLORS.textSecondary }]}>Learning Goal:</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>{userData?.learningGoal || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: COLORS.textSecondary }]}>Focus Area:</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>{userData?.focus || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: COLORS.textSecondary }]}>Practice Frequency:</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>{userData?.practiceFrequency === 'daily' ? 'Daily' : userData?.practiceFrequency || 'Not set'}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.infoLabel, { color: COLORS.textSecondary }]}>Occupation:</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>{userData?.occupation || 'Not set'}</Text>
            </View>
          </View>
        </View>

        {/* Challenge Areas Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>MY CHALLENGES</Text>

          <View style={[styles.infoCard, { backgroundColor: COLORS.card }]}>
            {userData?.challengeAreas && userData.challengeAreas.length > 0 ? (
              <View style={styles.tagsContainer}>
                {userData.challengeAreas.map((area, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagText}>{area}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.infoValue, { color: COLORS.textTertiary, textAlign: 'center', padding: 10 }]}>No challenge areas specified</Text>
            )}
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>MY PROGRESS</Text>

          <SkillProgressCard
            title="Pronunciation Accuracy"
            progress={userStats.pronunciationAccuracy}
            total={100}
            icon={<MaterialCommunityIcons name="microphone" size={20} color={COLORS.primary} />}
          />

          <SkillProgressCard
            title="Vocabulary Building"
            progress={userStats.vocabulary}
            total={1000}
            icon={<MaterialCommunityIcons name="book-open-variant" size={20} color={COLORS.primary} />}
          />

          <SkillProgressCard
            title="Learning Progress"
            progress={userStats.learningProgress}
            total={100}
            icon={<MaterialCommunityIcons name="school" size={20} color={COLORS.primary} />}
          />
        </View>

        {/* Preferred Topics Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>PREFERRED TOPICS</Text>

          <View style={[styles.infoCard, { backgroundColor: COLORS.card }]}>
            {userData?.preferredTopics && userData.preferredTopics.length > 0 ? (
              <View style={styles.tagsContainer}>
                {userData.preferredTopics.map((topic, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagText}>{topic}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.infoValue, { color: COLORS.textTertiary, textAlign: 'center', padding: 10 }]}>No preferred topics specified</Text>
            )}
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>QUICK ACTIONS</Text>

          <ProfileOption
            title="My Vocabulary"
            icon={<MaterialCommunityIcons name="bookshelf" size={20} color={COLORS.primary} />}
            onPress={() => router.push('/(tabs)/vocubulary')}
            badge={`${userStats.vocabulary}`}
          />

          <ProfileOption
            title="Favorite Words"
            icon={<MaterialCommunityIcons name="star" size={20} color={COLORS.primary} />}
            onPress={() => router.push('/(tabs)/vocubulary')}
            badge={`${userStats.favoriteWords}`}
          />

          <ProfileOption
            title="Pronunciation Practice"
            icon={<MaterialCommunityIcons name="microphone" size={20} color={COLORS.primary} />}
            onPress={() => router.push('/(tabs)/pronounciation')}
            isLast={true}
          />
        </View>

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>ACCOUNT</Text>

          <ProfileOption
            title="Settings"
            icon={<Ionicons name="settings-outline" size={20} color={COLORS.primary} />}
            onPress={() => router.push('/settings')}
            isLast={true}
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, {
            backgroundColor: COLORS.error + '20',
            borderColor: COLORS.error + '40'
          }]}
          onPress={confirmSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <View style={styles.signOutContent}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={[styles.signOutText, { color: COLORS.error }]}>Sign Out</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Quote of the Day - Dynamic from API */}
        <View style={[styles.quoteContainer, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.quoteText, { color: COLORS.text }]}>
            "{quoteOfDay.text}"
          </Text>
          <Text style={[styles.quoteAuthor, { color: COLORS.textSecondary }]}>
            - {quoteOfDay.author}
          </Text>
        </View>

        {/* App Version */}
        <Text style={[styles.version, { color: COLORS.textSecondary }]}>Version 1.0.0 (beta)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  refreshButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  headerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
    backgroundColor: '#06403a',
    shadowColor: '#06403a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: 'white',
  },
  email: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(6, 64, 58, 0.7)',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(6, 64, 58, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionContainer: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#06403a',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  tagItem: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  tagText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(6, 64, 58, 0.1)',
    shadowColor: '#06403a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 64, 58, 0.1)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#06403a',
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#06403a',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#dc3545',
  },
  quoteContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#06403a',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(6, 64, 58, 0.1)',
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    color: '#06403a',
  },
  quoteAuthor: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
    color: 'rgba(6, 64, 58, 0.7)',
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
    opacity: 0.6,
    color: '#032420',
  },
  // New styles for the updated UI
  infoCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(6, 64, 58, 0.1)',
    shadowColor: '#06403a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(6, 64, 58, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#06403a',
  },
  infoValue: {
    fontSize: 14,
    color: '#06403a',
  },
  skillCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(6, 64, 58, 0.1)',
    marginBottom: 8,
    shadowColor: '#06403a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skillHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 64, 58, 0.1)',
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#06403a',
  },
  skillProgressContainer: {
    marginTop: 4,
  },
  skillProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    marginBottom: 6,
    overflow: 'hidden',
  },
  skillProgressFill: {
    height: '100%',
    backgroundColor: '#06403a',
    borderRadius: 4,
  },
  skillProgressText: {
    fontSize: 12,
    color: '#06403a',
    textAlign: 'right',
  }
})
