import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const RecentActivity = ({ theme, router }) => {
  const { user } = useUser();
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchRecentActivity = async () => {
    try {
      if (!refreshing) setIsLoading(true);
      const response = await fetch(
        'https://ai-english-tutor-9ixt.onrender.com/api/recent?email=' +
        user.primaryEmailAddress.emailAddress
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recent activity');
      }

      const data = await response.json();

      // Sort activities by timestamp (newest first)
      const sortedRecent = [...(data.recent || [])].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      setRecentActivity(sortedRecent);
      setStats(data.stats || null);
      setError(null);

      // Animate fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchRecentActivity();
  }, []);

  // Refresh data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRecentActivity();
      return () => {}; // Cleanup function
    }, [])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecentActivity();
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 3600) {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const diffInHours = Math.floor(diffInSeconds / 3600);
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInSeconds / 86400);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'question':
        return { name: 'chat-processing', color: '#FF6B6B', bg: 'rgba(255,107,107,0.2)' };
      case 'vocabulary':
        return { name: 'book-open-variant', color: '#4ECDC4', bg: 'rgba(78,205,196,0.2)' };
      case 'pronunciation':
        return { name: 'microphone', color: '#4CD964', bg: 'rgba(76,217,100,0.2)' };
      default:
        return { name: 'bookmark-outline', color: '#FFD166', bg: 'rgba(255,209,102,0.2)' };
    }
  };

  const renderActivityContent = (activity) => {
    let title, subtitle;

    if (activity.type === 'question') {
      try {
        const llmResponse = JSON.parse(activity.data.llmres);
        title = `Q: ${activity.data.userres}`;
        subtitle = `A: ${llmResponse.answer.substring(0, 60)}${llmResponse.answer.length > 60 ? '...' : ''}`;
      } catch (e) {
        console.error('Error parsing LLM response:', e);
        return null;
      }
    } else if (activity.type === 'vocabulary') {
      title = `Learned: ${activity.data.word}`;
      subtitle = activity.data.meanings[0]?.definitions[0]?.definition?.substring(0, 60) || 'New word added';
      if (subtitle.length > 60) subtitle += '...';
    } else if (activity.type === 'pronunciation') {
      title = `Practiced: ${activity.data.word}`;
      subtitle = `Accuracy: ${activity.data.accuracy}%`;
    } else {
      return null;
    }

    const icon = getActivityIcon(activity.type);

    return (
      <View style={styles.activityContentContainer}>
        <View style={[styles.activityIcon, { backgroundColor: icon.bg }]}>
          <MaterialCommunityIcons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.activityTextContainer}>
          <Text style={[styles.activityTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
          <Text style={[styles.activitySubtitle, { color: theme.secondaryText }]} numberOfLines={2}>
            {subtitle}
          </Text>
          <Text style={styles.activityTime}>
            {formatTimeAgo(activity.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={40} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>
          Error loading recent activity
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.accent }]}
          onPress={fetchRecentActivity}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!recentActivity?.length && !refreshing) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.accent]}
            tintColor={theme.accent}
          />
        }
      >
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="history" size={50} color={theme.secondaryText} />
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            No recent activity found
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.tertiaryText }]}>
            Start learning to see your activity here
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.accent]}
          tintColor={theme.accent}
        />
      }
    >
      <Animated.View
        style={[
          styles.recentActivityContainer,
          { opacity: fadeAnim }
        ]}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="history" size={22} color={'#FFFFFF'} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activities</Text>
          </View>


        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.activityCard,
            { borderColor: theme.cardBorder }
          ]}
        >
          <LinearGradient
            colors={['#06403a', '#032420', '#06403a']}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {stats && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.vocabularyCount}</Text>
                  <Text style={styles.statLabel}>Words</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.pronunciationCount}</Text>
                  <Text style={styles.statLabel}>Pronunciations</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.questionsCount}</Text>
                  <Text style={styles.statLabel}>Questions</Text>
                </View>
              </View>
            )}

            {recentActivity.slice(0, 8).map((activity, index) => (
              <MotiView
                key={`${activity.type}-${activity.data.id || index}`}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 100, type: 'timing', duration: 500 }}
              >
                {index > 0 && <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />}
                {renderActivityContent(activity)}
              </MotiView>
            ))}


          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  recentActivityContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    marginTop: 20,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    marginTop: 20,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    marginTop: 20,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(9, 179, 166, 0.1)',
    borderRadius: 12,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 2,
  },
  activityCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  gradientCard: {
    padding: 16,
    borderRadius: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activityContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  activityTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#fff',
  },
  activitySubtitle: {
    fontSize: 13,
    marginBottom: 4,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    color: '#ffcc80', // Light orange color that should be visible on dark backgrounds
  },
  divider: {
    height: 1,
    marginVertical: 12,
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  viewMoreText: {
    color: '#fff',
    fontWeight: '500',
    marginRight: 6,
  },
});

export default RecentActivity;
