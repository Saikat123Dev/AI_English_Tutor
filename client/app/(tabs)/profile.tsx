import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/theme/ThemeProvider';

interface ProfileOptionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  showChevron?: boolean;
  isLast?: boolean;
  badge?: string | null;
}

function ProfileOption({ title, icon, onPress, showChevron = true, isLast = false, badge = null }: ProfileOptionProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.option,
        {
          backgroundColor: colors.card,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <View style={[styles.optionIconContainer, { backgroundColor: colors.primary + '20' }]}>
          {icon}
        </View>
        <Text style={[styles.optionText, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.optionRightContent}>
        {badge && (
          <View style={[styles.badgeContainer, { backgroundColor: colors.accent }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );
}





// Achievement Badge Component
function AchievementBadge({ title, icon, unlocked, progress, total, colors }) {
  return (
    <View style={[styles.achievementContainer, { 
      backgroundColor: colors.card,
      opacity: unlocked ? 1 : 0.7
    }]}>
      <View style={[
        styles.achievementIconContainer, 
        { 
          backgroundColor: unlocked ? colors.accent + '30' : colors.border + '50',
          borderColor: unlocked ? colors.accent : colors.border 
        }
      ]}>
        {icon}
      </View>
      <Text style={[styles.achievementTitle, { color: colors.text }]}>{title}</Text>
      {!unlocked && (
        <View style={styles.achievementProgress}>
          <View style={[styles.achievementProgressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.achievementProgressFill, 
                { 
                  width: `${Math.min(100, (progress / total) * 100)}%`, 
                  backgroundColor: colors.accent 
                }
              ]}
            />
          </View>
          <Text style={[styles.achievementProgressText, { color: colors.textSecondary }]}>
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
  const { colors, isDark, toggleTheme } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // Mock data for English learning statistics
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

  // Mock achievements data
  const achievements = [
    {
      id: 1,
      title: "Vocabulary Master",
      icon: <MaterialCommunityIcons name="book-open-page-variant" size={24} color={colors.accent} />,
      unlocked: true,
      progress: 300,
      total: 300
    },
    {
      id: 2,
      title: "Week Warrior",
      icon: <MaterialCommunityIcons name="calendar-check" size={24} color={colors.accent} />,
      unlocked: true,
      progress: 7,
      total: 7
    },
    {
      id: 3,
      title: "Grammar Guru",
      icon: <MaterialCommunityIcons name="format-letter-case" size={24} color={colors.textSecondary} />,
      unlocked: false,
      progress: 15,
      total: 20
    },
    {
      id: 4,
      title: "Perfect Pronunciation",
      icon: <MaterialCommunityIcons name="microphone" size={24} color={colors.textSecondary} />,
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

  if (!isUserLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark || colors.primary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.avatarContainer, {
            borderColor: colors.background,
            backgroundColor: colors.background + '80'
          }]}>
            <Text style={[styles.avatarText, { color: colors.text }]}>
              {user?.firstName?.[0]?.toUpperCase() || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.emailAddresses[0]?.emailAddress || 'User'}
          </Text>
          <Text style={[styles.email, { color: colors.text }]}>
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
            <View style={[styles.statDivider, { backgroundColor: colors.background + '30' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{learningStats.vocabulary}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.background + '30' }]} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{learningStats.completedLessons}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
          </View>
        </LinearGradient>


        {/* Achievements Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACHIEVEMENTS</Text>
            <TouchableOpacity onPress={() => setShowAllAchievements(!showAllAchievements)}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
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
                colors={colors}
              />
            ))}
          </View>
        </View>

        {/* Learning Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>LEARNING</Text>

          <ProfileOption
            title="My Progress"
            icon={<MaterialCommunityIcons name="chart-line" size={20} color={colors.primary} />}
            onPress={() => navigation.navigate('Progress' as never)}
          />

          <ProfileOption
            title="Certificates"
            icon={<MaterialCommunityIcons name="certificate" size={20} color={colors.primary} />}
            onPress={() => navigation.navigate('Certificates' as never)}
            isLast={true}
          />
        </View>

        {/* Recommended Courses */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>RECOMMENDED FOR YOU</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesScrollContainer}
          >
            <TouchableOpacity 
              style={[styles.courseCard, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CourseDetails' as never)}
            >
              <View style={[styles.courseImageContainer, { backgroundColor: '#FFD580' }]}>
                <MaterialCommunityIcons name="message-text" size={36} color="#FFA500" />
              </View>
              <Text style={[styles.courseTitle, { color: colors.text }]}>Business English</Text>
              <Text style={[styles.courseSubtitle, { color: colors.textSecondary }]}>12 lessons</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.courseCard, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CourseDetails' as never)}
            >
              <View style={[styles.courseImageContainer, { backgroundColor: '#ADD8E6' }]}>
                <MaterialCommunityIcons name="microphone" size={36} color="#0080FF" />
              </View>
              <Text style={[styles.courseTitle, { color: colors.text }]}>Pronunciation</Text>
              <Text style={[styles.courseSubtitle, { color: colors.textSecondary }]}>8 lessons</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.courseCard, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CourseDetails' as never)}
            >
              <View style={[styles.courseImageContainer, { backgroundColor: '#D8BFD8' }]}>
                <MaterialCommunityIcons name="book-open-page-variant" size={36} color="#9932CC" />
              </View>
              <Text style={[styles.courseTitle, { color: colors.text }]}>Advanced Reading</Text>
              <Text style={[styles.courseSubtitle, { color: colors.textSecondary }]}>10 lessons</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>

          <ProfileOption
            title="Edit Profile"
            icon={<Ionicons name="person-outline" size={20} color={colors.primary} />}
            onPress={() => navigation.navigate('EditProfile' as never)}
          />

          <ProfileOption
            title="Preferences"
            icon={<Ionicons name="settings-outline" size={20} color={colors.primary} />}
            onPress={() => navigation.navigate('Preferences' as never)}
          />

        </View>

        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SUPPORT</Text>

          <ProfileOption
            title="Help Center"
            icon={<Ionicons name="help-circle-outline" size={20} color={colors.primary} />}
            onPress={() => navigation.navigate('HelpCenter' as never)}
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, {
            backgroundColor: colors.error + '20',
            borderColor: colors.error + '40'
          }]}
          onPress={confirmSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <View style={styles.signOutContent}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Motivational Quote */}
        <View style={[styles.quoteContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.quoteText, { color: colors.text }]}>
            "Learning another language is not only learning different words for the same things, but learning another way to think about things."
          </Text>
          <Text style={[styles.quoteAuthor, { color: colors.textSecondary }]}>
            - Flora Lewis
          </Text>
        </View>

        {/* App Version */}
        <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0 (alpha)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    marginTop:-20
  },
  headerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 16,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    marginBottom: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
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
  },
  
  // Achievements
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 6,
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
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 10,
    textAlign: 'center',
  },
  // Courses
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  courseImageContainer: {
    width: '100%',
    height: 90,
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 12,
  },
  // Section containers
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
  },
  // Profile options

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
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
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
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
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  quoteContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  quoteAuthor: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
    opacity: 0.6,
  }
});

export default ProfileScreen;