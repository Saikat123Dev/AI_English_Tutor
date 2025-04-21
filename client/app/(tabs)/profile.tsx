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
  const [quoteOfDay, setQuoteOfDay] = useState({
    text: "Learning another language is not only learning different words for the same things, but learning another way to think about things.",
    author: "Flora Lewis"
  });

  // Fetch user data from the backend
  useEffect(() => {
    if (isUserLoaded && user) {
      fetchUserData();
      fetchDailyQuote();
    }
  }, [isUserLoaded, user]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch(`/api/user-profile?email=${encodeURIComponent(user?.emailAddresses[0]?.emailAddress)}`);
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyQuote = async () => {
    try {
      // Replace with your actual API endpoint for quotes
      const response = await fetch('/api/daily-quote');
      const data = await response.json();
      setQuoteOfDay(data);
    } catch (error) {
      console.error('Error fetching daily quote:', error);
    }
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
    streak: userData?.dailyStreaks?.length > 0 ? userData.dailyStreaks[userData.dailyStreaks.length - 1].count : 0,
    vocabulary: userData?.vocabularyWords?.length || 0,
    completedSessions: userData?.studySessions?.filter(session => session.endTime)?.length || 0,
    level: determineUserLevel(userData),
    pronunciationAccuracy: calculatePronunciationAccuracy(userData?.pronunciationAttempts || []),
    favoriteWords: userData?.favorites?.length || 0,
    englishLevel: userData?.englishLevel || 'Beginner',
    motherTongue: userData?.motherToung || 'Not specified'
  };

  // Helper functions for calculating user stats
  function determineUserLevel(userData) {
    if (!userData) return 'Beginner';

    const vocabCount = userData.vocabularyWords?.length || 0;
    const sessionsCount = userData.studySessions?.length || 0;

    if (vocabCount > 500 && sessionsCount > 50) return 'Advanced';
    if (vocabCount > 200 && sessionsCount > 20) return 'Intermediate';
    return userData.englishLevel || 'Beginner';
  }

  function calculatePronunciationAccuracy(attempts) {
    if (!attempts || attempts.length === 0) return 0;

    const accuracies = attempts.map(attempt => attempt.accuracy || 0);
    const sum = accuracies.reduce((total, acc) => total + acc, 0);
    return Math.round(sum / attempts.length);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 40 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScrollEvent}
      >
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
              {user?.firstName?.[0]?.toUpperCase() || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={[styles.name, { color: COLORS.white }]}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.emailAddresses[0]?.emailAddress || 'User'}
          </Text>
          <Text style={[styles.email, { color: 'rgba(255, 255, 255, 0.8)' }]}>
            {user?.emailAddresses[0]?.emailAddress || ''}
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
            title="Study Sessions"
            progress={userStats.completedSessions}
            total={100}
            icon={<MaterialCommunityIcons name="school" size={20} color={COLORS.primary} />}
          />
        </View>

        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>QUICK ACTIONS</Text>

          <ProfileOption
            title="My Vocabulary"
            icon={<MaterialCommunityIcons name="bookshelf" size={20} color={COLORS.primary} />}
            onPress={() => navigation.navigate('Vocabulary' as never)}
            badge={`${userStats.vocabulary}`}
          />

          <ProfileOption
            title="Favorite Words"
            icon={<MaterialCommunityIcons name="star" size={20} color={COLORS.primary} />}
            onPress={() => navigation.navigate('Favorites' as never)}
            badge={`${userStats.favoriteWords}`}
          />

          <ProfileOption
            title="Practice History"
            icon={<MaterialCommunityIcons name="history" size={20} color={COLORS.primary} />}
            onPress={() => navigation.navigate('History' as never)}
          />

          <ProfileOption
            title="Pronunciation Practice"
            icon={<MaterialCommunityIcons name="microphone" size={20} color={COLORS.primary} />}
            onPress={() => navigation.navigate('PronunciationPractice' as never)}
            isLast={true}
          />
        </View>

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>ACCOUNT</Text>

          <ProfileOption
            title="Edit Learning Profile"
            icon={<MaterialCommunityIcons name="account-edit" size={20} color={COLORS.primary} />}
            onPress={() => router.push('/learning-profile')}
          />

          <ProfileOption
            title="Settings"
            icon={<Ionicons name="settings-outline" size={20} color={COLORS.primary} />}
            onPress={() => router.push('/settings')}
            isLast={true}
          />
        </View>

        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>SUPPORT</Text>

          <ProfileOption
            title="Help Center"
            icon={<Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />}
            onPress={() => navigation.navigate('HelpCenter' as never)}
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
});
