import { View, Text, StyleSheet, ScrollView, Pressable, ImageBackground, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export default function HomeScreen({ navigation }) {
  const [streakCount] = useState(7);
  const [coins] = useState(450);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation for feature cards
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const features = [
    {
      id: 1,
      title: 'Conversation Practice',
      icon: 'chat-processing',
      color: '#FF6B6B',
      gradientColors: ['#FF6B6B', '#FF8E8E'],
      route: 'Conversation',
      description: 'Practice real conversations with AI'
    },
    {
      id: 2,
      title: 'Grammar Lessons',
      icon: 'book-open-variant',
      color: '#4ECDC4',
      gradientColors: ['#4ECDC4', '#6EE7DF'],
      route: 'Grammar',
      description: 'Master grammar rules with examples'
    },
    {
      id: 3,
      title: 'Vocabulary Builder',
      icon: 'dictionary',
      color: '#45B7D1',
      gradientColors: ['#45B7D1', '#67D1E9'],
      route: 'Vocabulary',
      description: 'Learn new words daily'
    },
    {
      id: 4,
      title: 'Pronunciation',
      icon: 'microphone',
      color: '#96CEB4',
      gradientColors: ['#96CEB4', '#B6E8D3'],
      route: 'Pronunciation',
      description: 'Improve your accent'
    },
    {
      id: 5,
      title: 'Daily Challenge',
      icon: 'trophy',
      color: '#FFD166',
      gradientColors: ['#FFD166', '#FFE38A'],
      route: 'Challenge',
      description: 'Test your skills'
    },
    {
      id: 6,
      title: 'Culture Notes',
      icon: 'earth',
      color: '#A78AFF',
      gradientColors: ['#A78AFF', '#C3AFFF'],
      route: 'Culture',
      description: 'Learn cultural context'
    }
  ];

  const handleFeaturePress = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(route);
  };

  const toggleDarkMode = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    background: isDarkMode ? '#121212' : '#F8F9FA',
    text: isDarkMode ? '#FFFFFF' : '#121212',
    card: isDarkMode ? 'rgba(30,30,30,0.75)' : 'rgba(255,255,255,0.75)',
    accent: '#6C63FF',
    secondaryText: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    shadow: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)',
    gradientStart: isDarkMode ? '#2A2A2A' : '#FFFFFF',
    gradientEnd: isDarkMode ? '#1A1A1A' : '#F0F0F0',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ImageBackground
        source={{ 
          uri: isDarkMode 
            ? 'https://api.a0.dev/assets/image?text=abstract%20dark%20gradient%20professional%20education%20background%20with%20subtle%20patterns&aspect=9:16' 
            : 'https://api.a0.dev/assets/image?text=abstract%20light%20gradient%20professional%20education%20background%20with%20subtle%20patterns&aspect=9:16' 
        }}
        style={styles.backgroundImage}
        blurRadius={isDarkMode ? 15 : 10}
      >
        <Animated.View 
          style={[
            styles.overlay,
            { 
              backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
              opacity: fadeAnim
            }
          ]}
        />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Header Section */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.profileSection}>
              <Pressable 
                style={({ pressed }) => [
                  styles.profileButton,
                  { transform: [{ scale: pressed ? 0.95 : 1 }] }
                ]}
                onPress={() => navigation.navigate('Profile')}
              >
                <BlurView
                  intensity={80}
                  tint={isDarkMode ? 'dark' : 'light'}
                  style={styles.profileBlur}
                >
                  <LinearGradient
                    colors={['#6C63FF', '#A78AFF']}
                    style={styles.profileGradient}
                  >
                    <MaterialCommunityIcons name="account-circle" size={32} color="#FFF" />
                  </LinearGradient>
                </BlurView>
              </Pressable>
              
              <View style={styles.statsContainer}>
                <Pressable 
                  style={({ pressed }) => [
                    styles.themeToggle,
                    { 
                      backgroundColor: theme.card,
                      transform: [{ scale: pressed ? 0.95 : 1 }]
                    }
                  ]}
                  onPress={toggleDarkMode}
                >
                  <BlurView
                    intensity={50}
                    tint={isDarkMode ? 'dark' : 'light'}
                    style={styles.themeBlur}
                  >
                    <Ionicons 
                      name={isDarkMode ? 'sunny' : 'moon'} 
                      size={20} 
                      color={isDarkMode ? '#FFD700' : '#6C63FF'} 
                    />
                  </BlurView>
                </Pressable>
                
                <BlurView 
                  intensity={50} 
                  tint={isDarkMode ? 'dark' : 'light'} 
                  style={[styles.streakContainer, { borderColor: 'rgba(255,215,0,0.3)' }]}
                >
                  <View style={styles.iconWrapper}>
                    <MaterialCommunityIcons name="fire" size={20} color="#FFD700" />
                  </View>
                  <Text style={[styles.streakText, { color: theme.text }]}>{streakCount} days</Text>
                </BlurView>
                
                <BlurView 
                  intensity={50} 
                  tint={isDarkMode ? 'dark' : 'light'} 
                  style={[styles.coinsContainer, { borderColor: 'rgba(255,215,0,0.3)' }]}
                >
                  <View style={styles.iconWrapper}>
                    <MaterialCommunityIcons name="coin" size={20} color="#FFD700" />
                  </View>
                  <Text style={[styles.coinsText, { color: theme.text }]}>{coins}</Text>
                </BlurView>
              </View>
            </View>
            
            <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome back!</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Continue your language journey</Text>
          </Animated.View>

          {/* Daily Goal Progress */}
          <Animated.View 
            style={[
              styles.goalContainer,
              { 
                opacity: slideAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }]
              }
            ]}
          >
            <BlurView
              intensity={40}
              tint={isDarkMode ? 'dark' : 'light'}
              style={styles.goalBlur}
            >
              <LinearGradient
                colors={isDarkMode 
                  ? ['rgba(30,30,30,0.7)', 'rgba(20,20,20,0.5)'] 
                  : ['rgba(255,255,255,0.7)', 'rgba(240,240,240,0.5)']}
                style={[
                  styles.goalCard,
                  {
                    shadowColor: theme.shadow,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 15,
                    elevation: 10,
                  }
                ]}
              >
                <View style={styles.goalHeader}>
                  <Text style={[styles.goalTitle, { color: theme.text }]}>Daily Goal</Text>
                  <Pressable 
                    style={({ pressed }) => ({ 
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }]
                    })}
                    onPress={() => navigation.navigate('Achievements')}
                  >
                    <Text style={[styles.viewAll, { color: theme.accent }]}>View All</Text>
                  </Pressable>
                </View>
                
                <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <LinearGradient
                    colors={['#6C63FF', '#A78AFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progress, { width: '70%' }]}
                  >
                    <Animated.View 
                      style={[
                        styles.progressGlow,
                        {
                          opacity: pulseAnim.interpolate({
                            inputRange: [1, 1.05],
                            outputRange: [0.5, 0.8]
                          })
                        }
                      ]}
                    />
                  </LinearGradient>
                </View>
                
                <View style={styles.goalDetails}>
                  <View style={styles.goalFooter}>
                    <Text style={[styles.goalText, { color: theme.secondaryText }]}>7/10 exercises completed</Text>
                    <View style={[styles.badge, { backgroundColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'rgba(255,215,0,0.15)' }]}>
                      <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                    </View>
                  </View>
                  
                  <View style={styles.timeContainer}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={theme.secondaryText} />
                    <Text style={[styles.timeText, { color: theme.secondaryText }]}>20 mins left today</Text>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.id}
                style={[
                  { 
                    opacity: slideAnim,
                    transform: [
                      { 
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50 + (index * 10), 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.featureCard,
                    {
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                      shadowColor: feature.color,
                      shadowOffset: { width: 0, height: 5 },
                      shadowOpacity: 0.25,
                      shadowRadius: 10,
                      elevation: 8,
                    }
                  ]}
                  onPress={() => handleFeaturePress(feature.route)}
                >
                  <BlurView
                    intensity={20}
                    tint={isDarkMode ? 'dark' : 'light'}
                    style={styles.featureBlur}
                  >
                    <LinearGradient
                      colors={feature.gradientColors}
                      style={styles.featureGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.featureContent}>
                        <View style={[styles.featureIconContainer, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                          <MaterialCommunityIcons name={feature.icon} size={28} color="#FFF" />
                        </View>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDescription}>{feature.description}</Text>
                      </View>
                      
                      <View style={styles.featureArrow}>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
                      </View>
                    </LinearGradient>
                  </BlurView>
                </Pressable>
              </Animated.View>
            ))}
          </View>

          {/* Quick Actions */}
          <Animated.View 
            style={[
              styles.quickActionsContainer,
              {
                opacity: slideAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [70, 0]
                  })
                }]
              }
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
            
            <View style={styles.quickActions}>
              <Pressable 
                style={({ pressed }) => [
                  styles.quickAction,
                  { 
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  }
                ]}
                onPress={() => navigation.navigate('Leaderboard')}
              >
                <BlurView
                  intensity={50}
                  tint={isDarkMode ? 'dark' : 'light'}
                  style={[styles.quickActionBlur, { borderColor: 'rgba(108,99,255,0.2)' }]}
                >
                  <LinearGradient
                    colors={isDarkMode 
                      ? ['rgba(30,30,30,0.7)', 'rgba(20,20,20,0.5)'] 
                      : ['rgba(255,255,255,0.7)', 'rgba(240,240,240,0.5)']}
                    style={styles.quickActionGradient}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(108,99,255,0.15)' }]}>
                      <MaterialCommunityIcons name="podium" size={22} color={theme.accent} />
                    </View>
                    <Text style={[styles.quickActionText, { color: theme.text }]}>Leaderboard</Text>
                  </LinearGradient>
                </BlurView>
              </Pressable>
              
              <Pressable 
                style={({ pressed }) => [
                  styles.quickAction,
                  { 
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  }
                ]}
                onPress={() => navigation.navigate('Practice')}
              >
                <BlurView
                  intensity={50}
                  tint={isDarkMode ? 'dark' : 'light'}
                  style={[styles.quickActionBlur, { borderColor: 'rgba(108,99,255,0.2)' }]}
                >
                  <LinearGradient
                    colors={isDarkMode 
                      ? ['rgba(30,30,30,0.7)', 'rgba(20,20,20,0.5)'] 
                      : ['rgba(255,255,255,0.7)', 'rgba(240,240,240,0.5)']}
                    style={styles.quickActionGradient}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(108,99,255,0.15)' }]}>
                      <MaterialCommunityIcons name="clock-fast" size={22} color={theme.accent} />
                    </View>
                    <Text style={[styles.quickActionText, { color: theme.text }]}>Quick Practice</Text>
                  </LinearGradient>
                </BlurView>
              </Pressable>
            </View>
          </Animated.View>
          
          {/* Recommended Practice */}
          <Animated.View 
            style={[
              styles.recommendedSection,
              {
                opacity: slideAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [80, 0]
                  })
                }]
              }
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recommended For You</Text>
            
            <BlurView
              intensity={40}
              tint={isDarkMode ? 'dark' : 'light'}
              style={styles.recommendedBlur}
            >
              <LinearGradient
                colors={['#FF8E8E', '#FF6B6B']}
                style={styles.recommendedCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.recommendedContent}>
                  <MaterialCommunityIcons name="microphone" size={24} color="#FFF" />
                  <View style={styles.recommendedTextContainer}>
                    <Text style={styles.recommendedTitle}>Pronunciation Challenge</Text>
                    <Text style={styles.recommendedSubtitle}>Train your accent with 5 new phrases</Text>
                  </View>
                </View>
                
                <Pressable
                  style={({ pressed }) => [
                    styles.startButton,
                    { transform: [{ scale: pressed ? 0.95 : 1 }] }
                  ]}
                  onPress={() => navigation.navigate('Pronunciation')}
                >
                  <Text style={styles.startButtonText}>Start</Text>
                </Pressable>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </ScrollView>
        
        {/* Bottom Tab Bar */}
        <Animated.View
          style={[
            styles.tabBarContainer,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}
        >
          <BlurView
            intensity={80}
            tint={isDarkMode ? 'dark' : 'light'}
            style={styles.tabBar}
          >
            <Pressable
              style={styles.tabItem}
              onPress={() => setActiveTab('home')}
            >
              <MaterialCommunityIcons 
                name="home" 
                size={24} 
                color={activeTab === 'home' ? theme.accent : theme.secondaryText} 
              />
              <Text style={[
                styles.tabText, 
                { 
                  color: activeTab === 'home' ? theme.accent : theme.secondaryText,
                  opacity: activeTab === 'home' ? 1 : 0.7
                }
              ]}>Home</Text>
            </Pressable>
            
            <Pressable
              style={styles.tabItem}
              onPress={() => navigation.navigate('Discover')}
            >
              <MaterialCommunityIcons 
                name="compass" 
                size={24} 
                color={theme.secondaryText} 
              />
              <Text style={[styles.tabText, { color: theme.secondaryText, opacity: 0.7 }]}>Discover</Text>
            </Pressable>
            
            <Pressable
              style={styles.tabItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <MaterialCommunityIcons 
                name="account" 
                size={24} 
                color={theme.secondaryText} 
              />
              <Text style={[styles.tabText, { color: theme.secondaryText, opacity: 0.7 }]}>Profile</Text>
            </Pressable>
          </BlurView>
        </Animated.View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileBlur: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  themeToggle: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  themeBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakText: {
    marginLeft: 5,
    fontWeight: '600',
    fontSize: 14,
  },
  coinsText: {
    marginLeft: 5,
    fontWeight: '600',
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  goalContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  goalBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  goalCard: {
    padding: 22,
    borderRadius: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 10,
    borderRadius: 6,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 6,
    position: 'relative',
  },
  progressGlow: {
    position: 'absolute',
    right: 0,
    height: '100%',
    width: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  goalDetails: {
    gap: 10,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    padding: 6,
    borderRadius: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  featuresGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  featureCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  featureBlur: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  featureGradient: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  featureContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  featureTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  featureDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 5,
  },
  featureArrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  quickActionsContainer: {
    marginBottom: 25,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  quickAction: {
    width: '48%',
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickActionBlur: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flex: 1,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendedSection: {
    marginBottom: 30,
  },
  recommendedBlur: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
recommendedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recommendedTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  recommendedTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  recommendedSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  startButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 30,
    overflow: 'hidden',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tabText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
  },
});