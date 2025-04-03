import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const nodeCount = 25;

export default function HomeScreen() {
  const [activeTab] = useState('home');
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
        size: Math.random() * 15 + 5,
        delay: Math.random() * 3000,
        duration: Math.random() * 2000 + 2000,
        color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, 255, 0.5)`
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

  const renderConnections = () => {
    const connectionDistance = Math.min(width, height) * 0.2;
    return nodePositions.flatMap((nodeA, i) => 
      nodePositions.slice(i + 1).map((nodeB, j) => {
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < connectionDistance ? (
          <Animated.View
            key={`connection-${i}-${j}`}
            style={{

              width: distance,
              height: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              opacity: Animated.multiply(connectionOpacity, 
                Animated.subtract(1, Animated.divide(distance, connectionDistance))),
              transform: [
                { translateX: -distance / 2 },
                { translateY: 0 },
                { rotate: `${Math.atan2(dy, dx)}rad` },
                { translateX: distance / 2 },
              ]
            }}
          />
        ) : null;
      })
    ).filter(Boolean);
  };


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
      title: 'Grammar',
      icon: 'book-open-variant',
      color: '#4ECDC4',
      gradientColors: ['#4ECDC4', '#6EE7DF'],
      route: 'grammer',
      description: 'Master essential rules'
    },
    {
      id: 3,
      title: 'Vocabulary',
      icon: 'book-open-variant',
      color: '#45B7D1',
      gradientColors: ['#45B7D1', '#67D1E9'],
      route: 'vocubulary',
      description: 'Expand your word bank'
    },
    {
      id: 4,
      title: 'Pronunciation',
      icon: 'microphone',
      color: '#96CEB4',
      gradientColors: ['#96CEB4', '#B6E8D3'],
      route: 'pronounciation',
      description: 'Perfect your accent'
    }
  ];

  const handleFeaturePress = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push(route);
  };

  const theme = {
    text: '#FFFFFF',
    accent: '#7C3AED',
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
          colors={['#1E0B4B', '#0F0824', '#0A061D']}
          style={styles.backgroundGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        
        {/* Render connections */}
        {nodePositions.length > 0 && renderConnections()}
        
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
                colors={['#6C63FF', '#A78AFF']}
                style={styles.profileGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="robot-happy" size={34} color="#FFF" />
              </LinearGradient>
            </Pressable>
          </View>

          <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome back!</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>What would you like to learn today?</Text>
        </View>

        {/* Daily Goal Progress */}
        <View style={styles.goalContainer}>
          <View style={[styles.goalCard, { 
            backgroundColor: 'rgba(124, 58, 237, 0.01)',
            borderWidth: 1,
            borderColor: theme.cardBorder,
          }]}>
            <View style={styles.blurOverlay} />
            <View style={styles.goalContent}>
              <View style={styles.goalHeader}>
                <View style={styles.titleContainer}>
                  <MaterialCommunityIcons name="trophy-outline" size={18} color={theme.accent} style={{marginRight: 6}} />
                  <Text style={[styles.goalTitle, { color: theme.text }]}>Daily Goal</Text>
                </View>
                <Pressable
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: 'row',
                    alignItems: 'center'
                  })}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/achievements');
                  }}
                >
                  <Text style={[styles.viewAll, { color: theme.accent }]}>View All</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={theme.accent} style={{marginLeft: 2}} />
                </Pressable>
              </View>

              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: theme.progressBackground }]}>
                  <LinearGradient
                    colors={['#6C63FF', '#A78AFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progress, { width: '70%' }]}
                  />
                </View>

                <Text style={[styles.progressText, { color: theme.text, marginLeft: 0 }]}>
                  70<Text style={{ fontSize: 14, color: theme.secondaryText }}>%</Text>
                </Text>
              </View>

              <View style={styles.goalDetails}>
                <View style={styles.goalFooter}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={16} color={theme.accent} style={{marginRight: 4}} />
                    <Text style={[styles.goalText, { color: theme.secondaryText }]}>
                      <Text>7</Text>/10 Tasks completed
                    </Text>
                  </View>
                  <View style={styles.badge}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                    <Text style={{ color: theme.text, marginLeft: 4, fontWeight: '800', fontSize: 12 }}>70 pts</Text>
                  </View>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => ([
                  styles.continueButton, {
                    backgroundColor: theme.accent,
                    opacity: pressed ? 0.9 : 1,
                  }
                ])}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  // Handle continue action
                }}
              >
                <Text style={{color: '#FFFFFF', fontWeight: '600', marginRight: 6}}>Continue</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <Pressable
              key={feature.id}
              style={({ pressed }) => [
                styles.featureCard,
                {
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  backgroundColor: 'rgba(124, 58, 237, 0.2)',
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                }
              ]}
              onPress={() => handleFeaturePress(feature.route)}
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
                  <Text style={[styles.progressMiniText, { color: theme.secondaryText }]}>40%</Text>
                </View>
                
              </View>
            </Pressable>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>

          <View style={styles.quickActions}>
            <Pressable
              style={[styles.quickAction, { 
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                borderWidth: 1,
                borderColor: theme.cardBorder,
              }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/leaderboard');
              }}
            >
              <View style={styles.quickActionContent}>
                <View style={[styles.quickActionIcon, {
                  backgroundColor: theme.progressBackground
                }]}>
                  <MaterialCommunityIcons name="podium" size={24} color={theme.accent} />
                </View>
                <Text style={[styles.quickActionText, { color: theme.text }]}>Rank</Text>
              </View>
            </Pressable>

            <Pressable
              style={[styles.quickAction, { 
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                borderWidth: 1,
                borderColor: theme.cardBorder,
              }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/practice');
              }}
            >
              <View style={styles.quickActionContent}>
                <View style={[styles.quickActionIcon, {
                  backgroundColor: theme.progressBackground
                }]}>
                  <MaterialCommunityIcons name="repeat" size={24} color={theme.accent} />
                </View>
                <Text style={[styles.quickActionText, { color: theme.text }]}>Repeat</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
            <Pressable
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/activity');
              }}
            >
              <Text style={[styles.viewAll, { color: theme.accent }]}>View All</Text>
            </Pressable>
          </View>

          <View style={[styles.activityCard, { 
            backgroundColor: 'rgba(124, 58, 237, 0.2)',
            borderWidth: 1,
            borderColor: theme.cardBorder,
          }]}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: 'rgba(255,107,107,0.1)' }]}>
                <MaterialCommunityIcons name="chat-processing" size={20} color="#FF6B6B" />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>Conversation Practice</Text>
                <Text style={[styles.activityTime, { color: theme.secondaryText }]}>30 minutes ago</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: 'rgba(76,217,100,0.1)' }]}>
                <Text style={[styles.activityBadgeText, { color: '#4CD964' }]}>+15 XP</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: 'rgba(78,205,196,0.1)' }]}>
                <MaterialCommunityIcons name="book-open-variant" size={20} color="#4ECDC4" />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>Grammar Lesson</Text>
                <Text style={[styles.activityTime, { color: theme.secondaryText }]}>2 hours ago</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: 'rgba(76,217,100,0.1)' }]}>
                <Text style={[styles.activityBadgeText, { color: '#4CD964' }]}>+10 XP</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: 'rgba(76,217,100,0.1)' }]}>
                <MaterialCommunityIcons name="trophy" size={20} color="#4CD964" />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>Daily Challenge</Text>
                <Text style={[styles.activityTime, { color: theme.secondaryText }]}>Yesterday</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: 'rgba(76,217,100,0.1)' }]}>
                <Text style={[styles.activityBadgeText, { color: '#4CD964' }]}>+50 XP</Text>
                </View>
            </View>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
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
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
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
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  goalContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  goalCard: {
    borderRadius: 20,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#fff',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  goalContent: {
    padding: 20,
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
    alignItems: 'center'
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 16,
  },
  featureCard: {
    width: (width - 56) / 2,
    height: 170,
    borderRadius: 20,
    position: 'relative',
  },
  featureContent: {
    flex: 1,
    padding: 16,
  },
  featureIconContainer: {
    width: 34,
    height: 34,
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
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  recentActivityContainer: {
    paddingHorizontal: 24,
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
    padding: 16,
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

});