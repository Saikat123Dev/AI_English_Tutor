import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const nodeCount = 10;

export default function DailyGoalScreen() {
  const [nodePositions, setNodePositions] = useState([]);
  const nodeAnimations = useRef(Array(nodeCount).fill().map(() => ({
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.5),
    position: new Animated.ValueXY()
  }))).current;
  const connectionOpacity = useRef(new Animated.Value(0)).current;

  const theme = {
    text: '#FFFFFF',
    accent: '#098f5e',
    secondaryText: 'rgba(255,255,255,0.7)',
    progressBackground: 'rgba(124,58,237,0.15)',
    cardBorder: 'rgba(255,255,255,0.2)',
    cardGlow: 'rgba(124,58,237,1)',
    background: '#121212'
  };

  const dailyGoals = [
    {
      id: 1,
      title: 'Conversation Practice',
      icon: 'chat-processing',
      color: '#FF6B6B',
      gradientColors: ['#FF6B6B', '#FF8E8E'],
      route: 'conversation',
      progress: 70,
      tasksCompleted: 7,
      totalTasks: 10,
      points: 35
    },
    {
      id: 2,
      title: 'Vocabulary Expansion',
      icon: 'book-open-variant',
      color: '#45B7D1',
      gradientColors: ['#45B7D1', '#67D1E9'],
      route: 'vocubulary',
      progress: 40,
      tasksCompleted: 4,
      totalTasks: 10,
      points: 20
    },
    {
      id: 3,
      title: 'Pronunciation Drills',
      icon: 'microphone',
      color: '#96CEB4',
      gradientColors: ['#96CEB4', '#B6E8D3'],
      route: 'pronounciation',
      progress: 60,
      tasksCompleted: 6,
      totalTasks: 10,
      points: 30
    }
  ];

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

  const handleGoalPress = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push(route);
  };

  const calculateOverallProgress = () => {
    const totalProgress = dailyGoals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(totalProgress / dailyGoals.length);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['#041b1a', '#06403a', '#041b1a']}
          style={styles.backgroundGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        {nodePositions.length > 0 && renderConnections()}
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
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Daily Goals</Text>
          <Text style={[styles.headerSubtitle, { color: theme.secondaryText }]}>
            Track your progress and earn rewards!
          </Text>
        </View>

        <View style={styles.overallProgressContainer}>
          <View style={[styles.overallProgressCard, { backgroundColor: '#07403b', borderColor: theme.cardBorder }]}>
            <View style={styles.overallProgressContent}>
              <View style={styles.overallProgressHeader}>
                <View style={styles.titleContainer}>
                  <MaterialCommunityIcons name="trophy-outline" size={18} color={theme.accent} style={{ marginRight: 6 }} />
                  <Text style={[styles.overallProgressTitle, { color: theme.text }]}>Overall Progress</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: theme.progressBackground }]}>
                  <LinearGradient
                    colors={['#07403b', '#A78AFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progress, { width: `${calculateOverallProgress()}%` }]}
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.text }]}>
                  {calculateOverallProgress()}
                  <Text style={{ fontSize: 14, color: theme.secondaryText }}>%</Text>
                </Text>
              </View>
              <View style={styles.overallProgressFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={16} color={theme.accent} style={{ marginRight: 4 }} />
                  <Text style={[styles.goalText, { color: theme.secondaryText }]}>
                    {dailyGoals.reduce((sum, goal) => sum + goal.tasksCompleted, 0)}/{dailyGoals.reduce((sum, goal) => sum + goal.totalTasks, 0)} Tasks
                  </Text>
                </View>
                <View style={styles.badge}>
                  <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                  <Text style={{ color: theme.text, marginLeft: 4, fontWeight: '800', fontSize: 12 }}>
                    {dailyGoals.reduce((sum, goal) => sum + goal.points, 0)} pts
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.goalsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Goals</Text>
          {dailyGoals.map((goal) => (
            <Pressable
              key={goal.id}
              style={({ pressed }) => [
                styles.goalCard,
                {
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  backgroundColor: '#07403b',
                  borderColor: theme.cardBorder,
                }
              ]}
              onPress={() => handleGoalPress(goal.route)}
            >
              <View style={styles.goalContent}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIconContainer, { backgroundColor: goal.color + '20' }]}>
                    <MaterialCommunityIcons name={goal.icon} size={24} color={goal.color} />
                  </View>
                  <Text style={[styles.goalTitle, { color: theme.text }]}>{goal.title}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: theme.progressBackground }]}>
                    <LinearGradient
                      colors={goal.gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progress, { width: `${goal.progress}%` }]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: theme.text }]}>
                    {goal.progress}
                    <Text style={{ fontSize: 12, color: theme.secondaryText }}>%</Text>
                  </Text>
                </View>
                <View style={styles.goalFooter}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={16} color={theme.accent} style={{ marginRight: 4 }} />
                    <Text style={[styles.goalText, { color: theme.secondaryText }]}>
                      {goal.tasksCompleted}/{goal.totalTasks} Tasks
                    </Text>
                  </View>
                  <View style={styles.badge}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                    <Text style={{ color: theme.text, marginLeft: 4, fontWeight: '800', fontSize: 12 }}>
                      {goal.points} pts
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.continueButton,
                    {
                      backgroundColor: goal.color,
                      opacity: pressed ? 0.9 : 1,
                    }
                  ]}
                  onPress={() => handleGoalPress(goal.route)}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', marginRight: 6 }}>Continue</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.rewardsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Rewards</Text>
          <View style={[styles.rewardsCard, { backgroundColor: '#07403b', borderColor: theme.cardBorder }]}>
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, { backgroundColor: 'rgba(255,215,0,0.1)' }]}>
                <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
              </View>
              <View style={styles.rewardTextContainer}>
                <Text style={[styles.rewardTitle, { color: theme.text }]}>Daily Completion Bonus</Text>
                <Text style={[styles.rewardDescription, { color: theme.secondaryText }]}>
                  Complete all tasks for 50 bonus points!
                </Text>
              </View>
              <View style={[styles.rewardBadge, { backgroundColor: 'rgba(76,217,100,0.1)' }]}>
                <Text style={[styles.rewardBadgeText, { color: '#4CD964' }]}>+50 pts</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, { backgroundColor: 'rgba(124,58,237,0.1)' }]}>
                <MaterialCommunityIcons name="trophy" size={24} color="#7C3AED" />
              </View>
              <View style={styles.rewardTextContainer}>
                <Text style={[styles.rewardTitle, { color: theme.text }]}>Weekly Streak</Text>
                <Text style={[styles.rewardDescription, { color: theme.secondaryText }]}>
                  Maintain a 7-day streak for 100 points!
                </Text>
              </View>
              <View style={[styles.rewardBadge, { backgroundColor: 'rgba(76,217,100,0.1)' }]}>
                <Text style={[styles.rewardBadgeText, { color: '#4CD964' }]}>+100 pts</Text>
              </View>
            </View>
          </View>
        </View>

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
    paddingBottom: 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  overallProgressContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  overallProgressCard: {
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  overallProgressContent: {
    padding: 20,
  },
  overallProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  overallProgressTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    borderRadius: 8,
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
  overallProgressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalsContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  goalCard: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  goalContent: {
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    alignItems: 'center',
  },
  continueButton: {
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardsContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  rewardsCard: {
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardTextContainer: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    fontWeight: '500',
  },
  rewardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rewardBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },
});
