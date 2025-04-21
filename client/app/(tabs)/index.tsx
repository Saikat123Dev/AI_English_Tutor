import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecentActivity from '../../components/RecentActivity';
const { width, height } = Dimensions.get('window');
const nodeCount = 10;

export default function HomeScreen() {
  const { user } = useUser();
  const [activeTab] = useState('home');
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [nodePositions, setNodePositions] = useState([]);
  const nodeAnimations = useRef(Array(nodeCount).fill().map(() => ({
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.5),
    position: new Animated.ValueXY()
  }))).current;
  const connectionOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const initialNodePositions = Array(nodeCount).fill().map(() => {
      const centerX = Math.random() > 0.5 ? width * 0.3 : width * 0.7;
      const centerY = Math.random() > 0.5 ? height * 0.3 : height * 0.7;
      const radius = Math.min(width, height) * 0.25;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;

      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        size: Math.random() * 110 + 70,
        delay: Math.random() * 3000,
        duration: Math.random() * 2000 + 2000,
        color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, 255, 0.9)`
      };
    });
    setNodePositions(initialNodePositions);

    nodeAnimations.forEach((anim, index) => {
      const { x, y, delay, duration } = initialNodePositions[index];
      const destX = x + (Math.random() - 0.5) * width * 0.2;
      const destY = y + (Math.random() - 0.5) * height * 0.2;

      anim.position.setValue({ x, y });

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: Math.random() * 0.1 + 0.3,
            duration: duration * 0.3,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.scale, {
            toValue: Math.random() * 0.1 + 0.8,
            duration: duration * 0.4,
            easing: Easing.out(Easing.elastic(1)),
            useNativeDriver: true,
          })
        ]),
        Animated.loop(Animated.sequence([
          Animated.timing(anim.position, {
            toValue: { x: destX, y: destY },
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim.position, {
            toValue: { x, y },
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
        ]))
      ]).start();
    });

    return () => nodeAnimations.forEach(anim => {
      anim.opacity.stopAnimation();
      anim.scale.stopAnimation();
      anim.position.stopAnimation();
    });
  }, []);


  const features = [
    {
      id: 1,
      title: 'Conversation',
      icon: 'chat-processing',
      color: '#FF6B6B',
      gradientColors: ['#FF6B6B', '#FF8E8E'],
      route: 'conversation',
      description: 'Practice real-world dialogues'
    },
    {
      id: 2,
      title: 'Profile',
      icon: 'admin',
      color: '#4ECDC4',
      gradientColors: ['#4ECDC4', '#6EE7DF'],
      route: 'profile',
      description: 'Visit your profile to see progress'
    },
    {
      id: 3,
      title: 'Vocabulary',
      icon: 'book-open-variant',
      color: '#45B7D1',
      gradientColors: ['#45B7D1', '#67D1E9'],
      route: 'vocubulary',
      description: 'Expand your word bank by learning daily'
    },
    {
      id: 4,
      title: 'Pronunciation',
      icon: 'microphone',
      color: '#96CEB4',
      gradientColors: ['#96CEB4', '#B6E8D3'],
      route: 'pronounciation',
      description: 'Perfect your accent by practicing'
    }
  ];

  const handleFeaturePress = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push(route);
  };

  const theme = {
    text: '#FFFFFF',
    accent: '#0a6b63',
    secondaryText: 'rgba(255,255,255,0.7)',
    progressBackground: 'rgba(124,58,237,0.15)',
    cardBorder: 'rgba(255,255,255,0.2)',
    cardGlow: 'rgba(124,58,237,1)',
    background: '#121212'
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Enhanced Background with Animated Nodes and Connections */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors = {['#041b1a', '#06403a', '#041b1a']}

          style={styles.backgroundGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />



        {/* Render nodes */}
        {nodePositions.map((node, index) => (
          <Animated.View
            key={`node-${index}`}
            style={{
              position: 'absolute',
              width: node.size,
              height: node.size,
              borderRadius: node.size / 2,
              backgroundColor: node.color || '#5F9EFF',
              transform: [
                { translateX: Animated.subtract(nodeAnimations[index].position.x, node.size / 2) },
                { translateY: Animated.subtract(nodeAnimations[index].position.y, node.size / 2) },
                { scale: nodeAnimations[index].scale }
              ],
              opacity: nodeAnimations[index].opacity,
              shadowColor: '#fff',
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 5,
            }}
          />
        ))}


      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Pressable
              style={styles.profileButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/profile');
              }}
            >
              <LinearGradient
                colors={['#07403b', '#1f8079']}
                style={styles.profileGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="robot-happy" size={34} color="#FFF" />
              </LinearGradient>
            </Pressable>
          </View>

          <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome back {user?.firstName ? user.firstName : ''}!</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>What would you like to learn today?</Text>
        </View>

        {/* Daily Goal Progress */}



        {/* Features Grid */}

        <View style={styles.featuresGrid}>
  {features.map((feature) => (
    <Pressable
      key={feature.id}
      style={({ pressed }) => [
        styles.featureCard,
        {
          transform: [{ scale: pressed ? 0.95 : 1 }],
          borderWidth: 2,
          borderColor: theme.cardBorder,
          overflow: 'hidden' // Add this to contain the gradient
        }
      ]}
      onPress={() => handleFeaturePress(feature.route)}
    >
      <LinearGradient
        colors={['#06403a', '#032420', '#06403a']}
        style={styles.gradientCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.featureContent}>
          <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
            <MaterialCommunityIcons name={feature.icon} size={24} color={feature.color} />
          </View>
          <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
          <Text style={[styles.featureDescription, { color: theme.secondaryText }]}>{feature.description}</Text>

          <View style={styles.progressMiniContainer}>
            <View style={[styles.progressMiniBar, { backgroundColor: theme.progressBackground }]}>
              <LinearGradient
                colors={feature.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressMini, { width: '40%' }]}
              />
            </View>

          </View>
        </View>
      </LinearGradient>
    </Pressable>
  ))}
</View>

        {/* Recent Activity */}
     <RecentActivity theme={theme} router={router} />



{/* Bottom Spacer */}
<View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    width: width,
    height: height,
    overflow: 'hidden',
  },
  activitySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 8,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    overflow: 'hidden',
  },
  profileGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalContainer: {
    paddingHorizontal: 14,
    marginTop: 16,
  },
  goalCard: {
    borderRadius: 20,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

  },
  goalContent: {
    padding: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    flex: 1,
    marginRight: 10,
  },
  progress: {
    height: '100%',
    borderRadius: 8,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  continueButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientCard: {
    justifyContent: 'space-between',
    borderRadius: 18,
  },

  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 24,
    gap: 16,
  },
  featureCard: {
    width: (width - 40) / 2,
    borderRadius: 20,
    position: 'relative',
  },
  featureContent: {
    flex: 1,
    padding: 14,
  },
  featureIconContainer: {
    width: 25,
    height: 25,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  progressMiniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressMiniBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    flex: 1,
    marginRight: 8,
  },
  progressMini: {
    height: '100%',
    borderRadius: 3,
  },
  progressMiniText: {
    fontSize: 12,
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },

  recentActivityContainer: {
    paddingHorizontal: 14,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  activityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginHorizontal: 8,
    opacity: 0.4,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginTop: 20,
    backgroundColor:'#072624', // or a darker color if preferred
  },
  footerButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  footerText: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Inter_500Medium',
  },



});
