import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define colors - can be moved to a separate file
const COLORS = {
  primary: '#0d9488',
  primaryDark: '#115e59',
  primaryLight: '#ccfbf1',
  accent: '#0f766e',
  accentLight: '#5eead4',
  background: '#f0fdfa',
  backgroundDark: '#e6f5f3',
  card: '#ffffff',
  cardDark: '#ecfdf5',
  text: '#042f2e',
  textSecondary: '#3f706d',
  textTertiary: '#64748b',
  border: '#cbd5e1',
  borderDark: '#94a3b8',
  error: '#dc2626',
  success: '#16a34a',
  warning: '#f59e0b',
  info: '#2563eb',
  white: '#ffffff',
  black: '#000000',
  grayLight: '#f1f5f9',
  gray: '#e2e8f0',
  grayDark: '#94a3b8'
};

// Reusable ProfileOption component
function ProfileOption({ title, icon, onPress, showChevron = true, isLast = false, badge = null }) {
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

// Reusable SkillProgressCard component
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
  const [isSigningOut, setIsSigningOut] = useState(false);

  // State for user data from backend
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quoteOfDay] = useState({
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

      if (!user?.primaryEmailAddress?.emailAddress) {
        console.error('No email address available');
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const email = user.primaryEmailAddress.emailAddress;
      console.log(`Fetching profile for: ${email}`);

      // Use skipCache=true when refreshing to force fresh data
      const skipCache = isRefreshing ? true : false;

      // Get authentication token if available
      // const authToken = await user.getToken();

      // API URL with base URL (should be moved to config)
      const apiUrl = `https://ai-english-tutor-9ixt.onrender.com/api/user-profile?email=${encodeURIComponent(email)}${skipCache ? '&skipCache=true' : ''}`;

      const response = await fetch(apiUrl, {
        // Add any required headers here
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received profile data:', data);

      // Set the received data directly to userData state
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

      // Invalidate cache on logout
      if (user?.primaryEmailAddress?.emailAddress) {
        try {
          await fetch('https://ai-english-tutor-9ixt.onrender.com/api/user-profile/invalidate-cache', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.primaryEmailAddress.emailAddress
            })
          });
        } catch (err) {
          console.error('Error invalidating cache:', err);
          // Continue with sign out even if cache invalidation fails
        }
      }

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
    level: userData?.englishLevel ? (userData.englishLevel.charAt(0).toUpperCase() + userData.englishLevel.slice(1)) : 'Beginner',
    pronunciationAccuracy: userData?.stats?.pronunciationAccuracy || 0,
    favoriteWords: userData?.stats?.favoritesCount || 0,
    englishLevel: userData?.englishLevel || 'Beginner',
    motherTongue: userData?.motherToung || 'Not specified',
    learningProgress: userData?.stats?.learningProgress || 0
  };

  // Calculate pronunciation practice count
  const pronunciationPracticeCount = userData?.pronunciationAttempts?.length || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          colors={[COLORS.primary, COLORS.primaryDark]}
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
            {userData?.email || user?.primaryEmailAddress?.emailAddress || ''}
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
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
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
            title="Learning Progress"
            progress={userStats.learningProgress}
            total={100}
            icon={<MaterialCommunityIcons name="school" size={20} color={COLORS.primary} />}
          />
        </View>

        {/* Challenge Areas Section */}
        {userData?.challengeAreas && userData.challengeAreas.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>MY CHALLENGE AREAS</Text>

            <View style={[styles.tagsContainer, { backgroundColor: COLORS.card }]}>
              {userData.challengeAreas.map((area, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: COLORS.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: COLORS.primary }]}>
                    {area.charAt(0).toUpperCase() + area.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Preferred Topics Section */}
        {userData?.preferredTopics && userData.preferredTopics.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>PREFERRED TOPICS</Text>

            <View style={[styles.tagsContainer, { backgroundColor: COLORS.card }]}>
              {userData.preferredTopics.map((topic, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: COLORS.accent + '20' }]}>
                  <Text style={[styles.tagText, { color: COLORS.accent }]}>
                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

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
            badge={pronunciationPracticeCount > 0 ? `${pronunciationPracticeCount}` : null}
            isLast={true}
          />
        </View>

        {/* User Details Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>USER DETAILS</Text>

          <View style={[styles.infoCard, { backgroundColor: COLORS.card }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: COLORS.textSecondary }]}>Occupation:</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>{userData?.occupation || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: COLORS.textSecondary }]}>Practice Frequency:</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>
                {userData?.practiceFrequency ? userData.practiceFrequency.charAt(0).toUpperCase() + userData.practiceFrequency.slice(1) : 'Not specified'}
              </Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.infoLabel, { color: COLORS.textSecondary }]}>Previous Experience:</Text>
              <Text style={[styles.infoValue, { color: COLORS.text }]}>
                {userData?.previousExperience ? userData.previousExperience.charAt(0).toUpperCase() + userData.previousExperience.slice(1) : 'Not specified'}
              </Text>
            </View>
          </View>
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

        {/* Quote of the Day */}
        <View style={[styles.quoteContainer, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.quoteText, { color: COLORS.text }]}>
            "{quoteOfDay.text}"
          </Text>
          <Text style={[styles.quoteAuthor, { color: COLORS.textSecondary }]}>
            - {quoteOfDay.author}
          </Text>
        </View>

        {/* Last Activity */}
        {userData?.stats?.lastActivity && (
          <Text style={[styles.lastActivity, { color: COLORS.textSecondary }]}>
            Last activity: {new Date(userData.stats.lastActivity).toLocaleDateString()}
          </Text>
        )}

        {/* App Version */}
        <Text style={[styles.version, { color: COLORS.textSecondary }]}>Version 1.0.0 (beta)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  refreshButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  headerGradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
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
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    color: COLORS.white,
  },
  email: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionContainer: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.textSecondary,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  skillCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  skillHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: COLORS.primary + '20',
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  skillProgressContainer: {
    marginTop: 8,
  },
  skillProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.grayLight,
    overflow: 'hidden',
    marginBottom: 6,
  },
  skillProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  skillProgressText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
    backgroundColor: COLORS.primary + '20',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: COLORS.primary,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
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
    borderColor: COLORS.error + '40',
    backgroundColor: COLORS.error + '20',
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: COLORS.error,
  },
  quoteContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'right',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.card,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: COLORS.primary + '20',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  lastActivity: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  version: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  }
});
