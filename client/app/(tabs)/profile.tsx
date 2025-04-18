import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, Alert, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollContext } from './ScrollContext';

// Define color constants based on your styles
const COLORS = {
  primary: '#06403a',           // Deep teal green
  primaryDark: '#032420',       // Darker shade for emphasis
  accent: '#0f766e',            // A more vibrant accent green
  background: '#2c786b',        // Light, soft greenish background
  card: '#89c4b6',              // Pure white for card contrast
  text: '#032420',              // Deep readable text color
  textSecondary: 'rgba(3, 36, 32, 0.7)', // Slightly muted for secondary
  border: 'rgba(3, 36, 32, 0.9)',       // Very light border for subtle separation
  error: '#db1225',             // Standard red for errors
  white: '#ffffff',            // Keep white consistent
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

function AchievementBadge({ title, icon, unlocked, progress, total }) {
  return (
    <View style={[styles.achievementContainer, {
      backgroundColor: COLORS.card,
      opacity: unlocked ? 1 : 0.7
    }]}>
      <View style={[
        styles.achievementIconContainer,
        {
          backgroundColor: unlocked ? COLORS.accent + '30' : COLORS.border + '50',
          borderColor: unlocked ? COLORS.accent : COLORS.border
        }
      ]}>
        {icon}
      </View>
      <Text style={[styles.achievementTitle, { color: COLORS.text }]}>{title}</Text>
      {!unlocked && (
        <View style={styles.achievementProgress}>
          <View style={[styles.achievementProgressBar, { backgroundColor: COLORS.border }]}>
            <View
              style={[
                styles.achievementProgressFill,
                {
                  width: `${Math.min(100, (progress / total) * 100)}%`,
                  backgroundColor: COLORS.accent
                }
              ]}
            />
          </View>
          <Text style={[styles.achievementProgressText, { color: COLORS.textSecondary }]}>
            {progress}/{total}
          </Text>
        </View>
      )}
    </View>
  );
}

export function ProfileScreen() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useAuth();
  const navigation = useNavigation();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const { handleScroll, tabBarHeight } = useContext(ScrollContext);

  const learningStats = {
    streak: 7,
    vocabulary: 320,
    completedLessons: 24,
    level: 'Intermediate',
    dailyGoal: 30,
    dailyProgress: 20,
    weeklyActivity: [15, 30, 45, 20, 0, 10, 5],
    wordOfDay: {
      word: "Serendipity",
      translation: "The occurrence of events by chance in a happy or beneficial way",
      sentence: "Finding that rare book in the second-hand store was a moment of serendipity."
    }
  };

  const achievements = [
    {
      id: 1,
      title: "Vocabulary Master",
      icon: <MaterialCommunityIcons name="book-open-page-variant" size={24} color={COLORS.accent} />,
      unlocked: true,
      progress: 300,
      total: 300
    },
    {
      id: 2,
      title: "Week Warrior",
      icon: <MaterialCommunityIcons name="calendar-check" size={24} color={COLORS.accent} />,
      unlocked: true,
      progress: 7,
      total: 7
    },
    {
      id: 3,
      title: "Grammar Guru",
      icon: <MaterialCommunityIcons name="format-letter-case" size={24} color={COLORS.textSecondary} />,
      unlocked: false,
      progress: 15,
      total: 20
    },
    {
      id: 4,
      title: "Perfect Pronunciation",
      icon: <MaterialCommunityIcons name="microphone" size={24} color={COLORS.textSecondary} />,
      unlocked: false,
      progress: 40,
      total: 100
    }
  ];

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

  if (!isUserLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
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
            <Text style={styles.levelText}>{learningStats.level}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{learningStats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: COLORS.background + '30' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{learningStats.vocabulary}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: COLORS.background + '30' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{learningStats.completedLessons}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Achievements Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>ACHIEVEMENTS</Text>
            <TouchableOpacity onPress={() => setShowAllAchievements(!showAllAchievements)}>
              <Text style={[styles.viewAllText, { color: COLORS.primary }]}>
                {showAllAchievements ? 'Show Less' : 'View All'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.achievementsGrid}>
            {achievements.slice(0, showAllAchievements ? achievements.length : 2).map(achievement => (
              <AchievementBadge
                key={achievement.id}
                title={achievement.title}
                icon={achievement.icon}
                unlocked={achievement.unlocked}
                progress={achievement.progress}
                total={achievement.total}
              />
            ))}
          </View>
        </View>

        {/* Learning Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>LEARNING</Text>

          <ProfileOption
            title="My Progress"
            icon={<MaterialCommunityIcons name="chart-line" size={20} color={COLORS.primary} />}
            onPress={() => navigation.navigate('Progress' as never)}
          />

          <ProfileOption
            title="Certificates"
            icon={<MaterialCommunityIcons name="certificate" size={20} color={COLORS.primary} />}
            onPress={() => navigation.navigate('Certificates' as never)}
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
          />
        </View>

        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>SUPPORT</Text>

          <ProfileOption
            title="Help Center"
            icon={<Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />}
            onPress={() => navigation.navigate('HelpCenter' as never)}
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

        {/* Motivational Quote */}
        <View style={[styles.quoteContainer, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.quoteText, { color: COLORS.text }]}>
            "Learning another language is not only learning different words for the same things, but learning another way to think about things."
          </Text>
          <Text style={[styles.quoteAuthor, { color: COLORS.textSecondary }]}>
            - Flora Lewis
          </Text>
        </View>

        {/* App Version */}
        <Text style={[styles.version, { color: COLORS.textSecondary }]}>Version 1.0.0 (alpha)</Text>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#06403a',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementContainer: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(6, 64, 58, 0.1)',
    shadowColor: '#06403a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#06403a',
    backgroundColor: 'rgba(6, 64, 58, 0.1)',
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 6,
    color: '#06403a',
  },
  achievementProgress: {
    width: '100%',
  },
  achievementProgressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(6, 64, 58, 0.1)',
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#06403a',
  },
  achievementProgressText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#06403a',
  },
  coursesScrollContainer: {
    paddingLeft: -2,
    paddingRight: 16,
    paddingBottom: 8,
  },
  courseCard: {
    width: 160,
    borderRadius: 16,
    padding: 12,
    marginLeft: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(6, 64, 58, 0.1)',
    shadowColor: '#06403a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  courseImageContainer: {
    width: '100%',
    height: 90,
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 64, 58, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 64, 58, 0.2)',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#06403a',
  },
  courseSubtitle: {
    fontSize: 12,
    color: 'rgba(6, 64, 58, 0.7)',
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
  }
});

export default ProfileScreen;