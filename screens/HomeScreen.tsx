import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Defs, RadialGradient, Stop, Rect, G, Ellipse } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [streakCount] = useState(7);
  const [coins] = useState(450);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const blurIntensityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Store animation references for cleanup
    const animations = [];
    
    // Separate animation creation from starting
    const createAndStartAnimation = (animation) => {
      animations.push(animation);
      animation.start();
      return animation;
    };
    
    // Wave animation - already infinite with Animated.loop
    const waveAnimation = createAndStartAnimation(
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 0.7,
          duration: 1800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false, // Required for layout animations like width
        })
      )
    );
    
    // Floating animation - already infinite with Animated.loop
    const floatAnimation = createAndStartAnimation(
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
        ])
      )
    );
    
    // Rotating animation - already infinite with Animated.loop
    const rotateAnimation = createAndStartAnimation(
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    );
  
    // Master animation sequence - making it infinite with Animated.loop
    const masterAnimation = createAndStartAnimation(
      Animated.loop( // Added loop here to make the entire sequence infinite
        Animated.sequence([
          // Initial animations sequence
          Animated.stagger(80, [
            // Fade in
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            
            // Parallel animations for core elements
            Animated.parallel([
              // Slide up with improved back easing
              Animated.timing(slideAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.back(1.7)),
                useNativeDriver: true,
              }),
              
              // Progress bar animation
              Animated.timing(progressAnim, {
                toValue: 0.7,
                duration: 1500,
                easing: Easing.out(Easing.exp),
                useNativeDriver: false,
              }),
              
              // Scale animation with reduced elasticity
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1200,
                easing: Easing.elastic(1.2),
                useNativeDriver: true,
              }),
            ]),
          ]),
          
          // Long-running continuous animations
          Animated.parallel([
            // Blur intensity animation cycle
            Animated.sequence([
              Animated.timing(blurIntensityAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: false,
              }),
              Animated.timing(blurIntensityAnim, {
                toValue: 0.5, // Cycle between full and half blur
                duration: 1500,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: false,
              })
            ]),
            
            // Pulse effect - already infinite
            Animated.loop(
              Animated.sequence([
                Animated.timing(pulseAnim, {
                  toValue: 1.03,
                  duration: 1500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                  toValue: 1,
                  duration: 1500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
            
            // Add delay before resetting the main sequence
            Animated.delay(10000) // Allow animations to run for 10 seconds before restarting
          ]),
          
          // Reset animations before looping
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0, // Reset fade
              duration: 800,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0, // Reset slide
              duration: 800,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0, // Reset scale
              duration: 800,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ])
        ])
      )
    );
  
    // Cleanup function to stop all animations when component unmounts
    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, );

  const features = [
    {
      id: 1,
      title: 'Conversation',
      icon: 'chat-processing',
      color: '#FF6B6B',
      gradientColors: ['#FF6B6B', '#FF8E8E'],
      route: 'Conversation',
      description: 'Practice real-world dialogues'
    },
    {
      id: 2,
      title: 'Grammar',
      icon: 'book-open-variant',
      color: '#4ECDC4',
      gradientColors: ['#4ECDC4', '#6EE7DF'],
      route: 'Grammar',
      description: 'Master essential rules'
    },
    {
      id: 3,
      title: 'Vocabulary',
      icon: 'book-open-variant',
      color: '#45B7D1',
      gradientColors: ['#45B7D1', '#67D1E9'],
      route: 'Vocabulary',
      description: 'Expand your word bank'
    },
    {
      id: 4,
      title: 'Pronunciation',
      icon: 'microphone',
      color: '#96CEB4',
      gradientColors: ['#96CEB4', '#B6E8D3'],
      route: 'Pronunciation',
      description: 'Perfect your accent'
    }
  ];

  const handleFeaturePress = (route:any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigation.navigate(route);
  };

  const toggleDarkMode = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsDarkMode(!isDarkMode);
  };

const theme = {
    background: isDarkMode ? '#0A0A0A' : '#F8FAFC',
    text: isDarkMode ? '#FFFFFF' : '#0F172A',
    card: isDarkMode ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.96)',
    accent: isDarkMode ? '#A78AFF' : '#6C63FF',
    accentHover: isDarkMode ? '#917CFF' : '#574FD1',
    secondaryText: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.75)',
    shadow: isDarkMode ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.1)',
    featureCard: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
    featureText: isDarkMode ? '#FFFFFF' : '#0F172A',
    tabBar: isDarkMode ? 'rgba(25,25,25,0.95)' : 'rgba(255,255,255,0.95)',
    progressBackground: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(108,99,255,0.15)',
    iconBackground: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(108,99,255,0.15)',
    cardBorder: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    wavePrimary: isDarkMode ? 'rgba(138,124,255,0.2)' : 'rgba(108,99,255,0.15)',
    waveSecondary: isDarkMode ? 'rgba(167,138,255,0.15)' : 'rgba(167,138,255,0.1)',
    glassReflection: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)',
    glassBorder: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
    backgroundGlow1: isDarkMode ? '#6C63FF' : '#A78AFF',
    backgroundGlow2: isDarkMode ? '#8A42A5' : '#6C63FF',
    backgroundGlow3: isDarkMode ? '#4E46E5' : '#FFD166',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    overlay: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
  };

  // Animated Background Component
  const AnimatedBackground = () => {
    return (
      <View style={StyleSheet.absoluteFill}>
        {/* Dark overlay/base color */}
        <View style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: theme.background }
        ]} />
        
        {/* Animated Gradient Orbs */}
        <Animated.View 
          style={[
            styles.orb,
            {
              top: '10%',
              left: '15%',
              backgroundColor: theme.backgroundGlow1,
              opacity: 0.5,
              transform: [
                { 
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20]
                  })
                },
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [1, 1.05],
                    outputRange: [1, 1.2]
                  })
                }
              ]
            }
          ]}
        />
        
        <Animated.View 
          style={[
            styles.orb,
            {
              top: '30%',
              right: '10%',
              backgroundColor: theme.backgroundGlow2,
              opacity: 0.4,
              transform: [
                { 
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 30]
                  })
                },
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [1, 1.05],
                    outputRange: [1.1, 0.9]
                  })
                }
              ]
            }
          ]}
        />
        
        <Animated.View 
          style={[
            styles.orb,
            {
              bottom: '25%',
              left: '20%',
              backgroundColor: theme.backgroundGlow3,
              opacity: 0.3,
              transform: [
                { 
                  translateX: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15]
                  })
                },
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [1, 1.05],
                    outputRange: [0.9, 1.1]
                  })
                }
              ]
            }
          ]}
        />
        
        {/* Animated SVG Mesh */}
        <Animated.View 
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: 0.12,
              transform: [{
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }]
            }
          ]}
        >
          <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
            <Defs>
              <RadialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <Stop offset="0%" stopColor={theme.accent} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={theme.background} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <G opacity="0.4">
              {Array.from({length: 6}).map((_, i) => (
                <Path
                  key={i}
                  d={`M${Math.random() * width} ${Math.random() * height} 
                     Q ${Math.random() * width} ${Math.random() * height}, 
                       ${Math.random() * width} ${Math.random() * height}
                     T ${Math.random() * width} ${Math.random() * height}
                    `}
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth="0.5"
                  opacity={0.2 + (Math.random() * 0.3)}
                />
              ))}
              <Circle cx={width/2} cy={height/2} r={width * 0.7} fill="url(#grad)" />
            </G>
          </Svg>
        </Animated.View>
        
        {/* Glass Blur Overlay */}
        <BlurView
          intensity={15}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        {/* Wave Background */}
        <Animated.View 
          style={[
            styles.waveContainer,
            {
              transform: [{
                translateX: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -width]
                })
              }]
            }
          ]}
        >
          <Svg width={width * 2} height={height * 0.3} viewBox={`0 0 ${width} 200`}>
            <Path 
              fill={theme.wavePrimary} 
              d={`
                M0,120 
                C150,200 350,50 500,120 
                S850,150 1000,80 
                L1000,0 
                L0,0 
                Z
              `}
              transform={`translate(0, 50)`}
            />
            <Path 
              fill={theme.waveSecondary} 
              d={`
                M0,120 
                C200,80 350,150 500,100 
                S800,180 1000,120 
                L1000,0 
                L0,0 
                Z
              `}
              transform={`translate(0, 70)`}
            />
          </Svg>
        </Animated.View>
      </View>
    );
  };

  // Glass Panel Component
  const GlassPanel = ({ children, style, intensity = 65, onPress, withShimmer = true }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.glassPanel,
          style,
          pressed && onPress ? { transform: [{ scale: 0.98 }] } : {}
        ]}
        onPress={onPress}
      >
        <BlurView
            intensity={intensity}
        >
          {children}
          
          {withShimmer && (
            <View style={styles.glassShimmer}>
              <LinearGradient
                colors={['transparent', theme.glassReflection, 'transparent']}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.7, y: 1 }}
                style={styles.shimmer}
              />
            </View>
          )}
        </BlurView>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Animated Backgrounds */}
      <AnimatedBackground />

      {/* Main Content */}
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
                  outputRange: [-30, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.profileSection}>
            <GlassPanel
              style={styles.profileButton}
              intensity={90}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Profile');
              }}
            >
              <LinearGradient
                colors={isDarkMode ? ['#8A7CFF', '#6C63FF'] : ['#6C63FF', '#A78AFF']}
                style={styles.profileGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="account-circle" size={34} color="#FFF" />
              </LinearGradient>
            </GlassPanel>
            
            <View style={styles.statsContainer}>
              <GlassPanel 
                style={[
                  styles.themeToggle,
                  { backgroundColor: isDarkMode ? 'rgba(40,40,40,0.5)' : 'rgba(255,255,255,0.5)' }
                ]}
                onPress={toggleDarkMode}
                intensity={80}
              >
                <Animated.View
                  style={{
                    transform: [{
                      rotate: isDarkMode 
                        ? fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['180deg', '0deg']
                          })
                        : fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                          })
                    }]
                  }}
                >
                  <Ionicons 
                    name={isDarkMode ? 'sunny' : 'moon'} 
                    size={22} 
                    color={isDarkMode ? '#FFD700' : '#6C63FF'} 
                  />
                </Animated.View>
              </GlassPanel>
              
              <GlassPanel 
                style={[
                  styles.streakContainer, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(40,40,40,0.5)' : 'rgba(255,215,0,0.1)',
                    borderColor: isDarkMode ? 'rgba(255,215,0,0.3)' : 'rgba(255,215,0,0.2)',
                  }
                ]}
                intensity={75}
              >
                <View style={styles.iconWrapper}>
                  <Animated.View
                    style={{
                      transform: [{
                        scale: pulseAnim
                      }]
                    }}
                  >
                    <MaterialCommunityIcons name="fire" size={20} color="#FFA500" />
                  </Animated.View>
                </View>
                <Text style={[styles.streakText, { color: theme.text }]}>{streakCount}</Text>
              </GlassPanel>
              
              <GlassPanel 
                style={[
                  styles.coinsContainer, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(40,40,40,0.5)' : 'rgba(255,215,0,0.1)',
                    borderColor: isDarkMode ? 'rgba(255,215,0,0.3)' : 'rgba(255,215,0,0.2)',
                  }
                ]}
                intensity={75}
              >
                <View style={styles.iconWrapper}>
                  <Animated.View
                    style={{
                      transform: [{
                        rotateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }]
                    }}
                  >
                    <MaterialCommunityIcons name="coin" size={20} color="#FFD700" />
                  </Animated.View>
                </View>
                <Text style={[styles.coinsText, { color: theme.text }]}>{coins}</Text>
              </GlassPanel>
            </View>
          </View>
          
          <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome back!</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>What would you like to learn today?</Text>
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
  <GlassPanel
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('Achievements');
    }}
    style={[
      styles.goalCard,
      {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDarkMode ? 0.3 : 0.2,
        shadowRadius: 16,
        elevation: 10,
        borderColor: theme.glassBorder,
        borderWidth: 1
      }
    ]}
    intensity={75}
  >
    <View style={styles.goalHeader}>
      <View style={styles.titleContainer}>
        <MaterialCommunityIcons name="trophy-outline" size={18} color={theme.accent} style={{marginRight: 6}} />
        <Text style={[styles.goalTitle, { color: theme.text }]}>Daily Goal</Text>
      </View>
      <Pressable 
        style={({ pressed }) => ({ 
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
          flexDirection: 'row',
          alignItems: 'center'
        })}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('Achievements');
        }}
      >
        <Text style={[styles.viewAll, { color: theme.accent }]}>View All</Text>
        <MaterialCommunityIcons name="chevron-right" size={16} color={theme.accent} style={{marginLeft: 2}} />
      </Pressable>
    </View>
    
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { backgroundColor: theme.progressBackground }]}>
        <Animated.View style={{
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%']
          }),
          height: '100%',
          borderRadius: 8,
        }}>
          <LinearGradient
            colors={isDarkMode ? ['#8A7CFF', '#A78AFF'] : ['#6C63FF', '#A78AFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progress, {
              shadowColor: isDarkMode ? '#8A7CFF' : '#6C63FF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 8,
            }]}
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
        </Animated.View>
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
            <Text >7</Text>/10 Tasks completed
          </Text>
        </View>
        <View style={[styles.badge, { 
          backgroundColor: isDarkMode ? 'rgba(255,215,0,0.15)' : 'rgba(255,215,0,0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255,215,0,0.3)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center'
        }]}>
          <Animated.View style={{
            transform: [{
              rotate: pulseAnim.interpolate({
                inputRange: [1, 1.05],
                outputRange: ['0deg', '15deg']
              })
            }]
          }}>
            <MaterialCommunityIcons name="star" size={16} color="#000" />
          </Animated.View>
          <Text style={{ color: '#000', marginLeft: 4, fontWeight: '800', fontSize: 12 }}>70 pts</Text>
        </View>
      </View>
      
      <View style={styles.timeContainer}>
        <MaterialCommunityIcons name="clock-outline" size={14} color={theme.secondaryText} style={{marginRight: 4}} />

      </View>
    </View>
    
    <Pressable 
      style={({ pressed }) => ([
        styles.continueButton, {
          backgroundColor: theme.accent,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          marginTop: 12,
          paddingVertical: 10,
          borderRadius: 8,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center'
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
  </GlassPanel>
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
                        outputRange: [70 + (index * 15), 0]
                      })
                    },
                    { 
                      scale: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1]
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
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: isDarkMode ? 0.5 : 0.2,
                    shadowRadius: 15,
                    elevation: 10,
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                    borderWidth: 1,
                    overflow: 'hidden'
                  }
                ]}
                onPress={() => handleFeaturePress(feature.route)}
              >
                <BlurView
                  intensity={65}
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
                      <View style={[styles.featureIconContainer, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                        <MaterialCommunityIcons name={feature.icon} size={30} color="#FFF" />
                      </View>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                    
                    <View style={styles.featureArrow}>
                      <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(255,255,255,0.9)" />
                    </View>
                    
                    {/* Glass Reflection */}
                    <View style={styles.featureShimmer}>
                      <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
                        start={{ x: 0.1, y: 0 }}
                        end={{ x: 0.9, y: 1 }}
                        style={styles.shimmer}
                      />
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
                  outputRange: [90, 0]
                })
              }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <GlassPanel 
              style={[
                styles.quickAction,
                { 
                  borderColor: isDarkMode ? 'rgba(108,99,255,0.3)' : 'rgba(108,99,255,0.2)',
                  borderWidth: 1,
                  backgroundColor: isDarkMode ? 'rgba(30,30,30,0.5)' : 'rgba(255,255,255,0.5)'
                }
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Leaderboard');
              }}
              intensity={75}
            >
              <View style={styles.quickActionContent}>
                <View style={[styles.quickActionIcon, { 
                  backgroundColor: isDarkMode ? 'rgba(108,99,255,0.2)' : theme.iconBackground 
                }]}>
                  <MaterialCommunityIcons name="podium" size={24} color={theme.accent} />
                </View>
                <Text style={[styles.quickActionText, { color: theme.text }]}>Leaderboard</Text>
              </View>
            </GlassPanel>
            
            <GlassPanel 
              style={[
                styles.quickAction,
                { 
                  borderColor: isDarkMode ? 'rgba(108,99,255,0.3)' : 'rgba(108,99,255,0.2)',
                  borderWidth: 1,
                  backgroundColor: isDarkMode ? 'rgba(30,30,30,0.5)' : 'rgba(255,255,255,0.5)'
                }
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Practice');
              }}
              intensity={75}
            >
              <View style={styles.quickActionContent}>
                <View style={[styles.quickActionIcon, { 
                  backgroundColor: isDarkMode ? 'rgba(108,99,255,0.2)' : theme.iconBackground 
                }]}>
                  <MaterialCommunityIcons name="repeat" size={24} color={theme.accent} />
                </View>
                <Text style={[styles.quickActionText, { color: theme.text }]}>Daily Practice</Text>
              </View>
            </GlassPanel>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View 
          style={[
            styles.recentActivityContainer,
            {
              opacity: slideAnim,
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
            <Pressable 
              style={({ pressed }) => ({ 
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }]
              })}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Activity');
              }}
            >
              <Text style={[styles.viewAll, { color: theme.accent }]}>View All</Text>
            </Pressable>
          </View>
          
          <GlassPanel
           onPress={()=>{}}
            style={[
              styles.activityCard,
              {
                shadowColor: theme.shadow,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: isDarkMode ? 0.3 : 0.2,
                shadowRadius: 20,
                elevation: 15,
                borderColor: theme.glassBorder,
                borderWidth: 1
              }
            ]}
            intensity={70}
          >
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: isDarkMode ? 'rgba(255,107,107,0.2)' : 'rgba(255,107,107,0.1)' }]}>
                <MaterialCommunityIcons name="chat-processing" size={20} color="#FF6B6B" />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>Conversation Practice</Text>
                <Text style={[styles.activityTime, { color: theme.secondaryText }]}>30 minutes ago</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: isDarkMode ? 'rgba(76,217,100,0.2)' : 'rgba(76,217,100,0.1)' }]}>
                <Text style={[styles.activityBadgeText, { color: '#4CD964' }]}>+15 XP</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: isDarkMode ? 'rgba(78,205,196,0.2)' : 'rgba(78,205,196,0.1)' }]}>
                <MaterialCommunityIcons name="book-open-variant" size={20} color="#4ECDC4" />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>Grammar Lesson</Text>
                <Text style={[styles.activityTime, { color: theme.secondaryText }]}>2 hours ago</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: isDarkMode ? 'rgba(76,217,100,0.2)' : 'rgba(76,217,100,0.1)' }]}>
                <Text style={[styles.activityBadgeText, { color: '#4CD964' }]}>+10 XP</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: isDarkMode ? 'rgba(255,209,102,0.2)' : 'rgba(255,209,102,0.1)' }]}>
                <MaterialCommunityIcons name="trophy" size={20} color="#4CD964" />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>Daily Challenge</Text>
                <Text style={[styles.activityTime, { color: theme.secondaryText }]}>Yesterday</Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: isDarkMode ? 'rgba(255,215,0,0.2)' : 'rgba(255,215,0,0.1)' }]}>
                <Text style={[styles.activityBadgeText, { color: '#4CD964' }]}>+50 XP</Text>
              </View>
            </View>
          </GlassPanel>
        </Animated.View>
        
        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <Animated.View 
        style={[
          styles.tabBar,
          { 
            backgroundColor: theme.tabBar,
            borderTopColor: theme.cardBorder,
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        
        <Pressable 
          style={styles.tabItem}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons 
            name={activeTab === 'home' ? 'home' : 'home-outline'} 
            size={24} 
            color={activeTab === 'home' ? theme.accent : theme.secondaryText} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'home' ? theme.accent : theme.secondaryText }
          ]}>
            Home
          </Text>
        </Pressable>
        
        <Pressable 
          style={styles.tabItem}
          onPress={() => setActiveTab('learn')}
        >
          <Ionicons 
            name={activeTab === 'learn' ? 'book' : 'book-outline'} 
            size={24} 
            color={activeTab === 'learn' ? theme.accent : theme.secondaryText} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'learn' ? theme.accent : theme.secondaryText }
          ]}>
            Learn
          </Text>
        </Pressable>
        
        <Pressable 
          style={styles.tabItem}
          onPress={() => {
            setActiveTab('practice');
            navigation.navigate('Practice');
          }}
        >
          <View style={[
            styles.centralTab,
            {
              backgroundColor: theme.accent,
              shadowColor: theme.accent,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
            }
          ]}>
            <Ionicons 
              name="barbell" 
              size={24} 
              color="#FFF" 
            />
          </View>
        </Pressable>
        
        <Pressable 
          style={styles.tabItem}
          onPress={() => setActiveTab('progress')}
        >
          <Ionicons 
            name={activeTab === 'progress' ? 'stats-chart' : 'stats-chart-outline'} 
            size={24} 
            color={activeTab === 'progress' ? theme.accent : theme.secondaryText} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'progress' ? theme.accent : theme.secondaryText }
          ]}>
            Progress
          </Text>
        </Pressable>
        
        <Pressable 
          style={styles.tabItem}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name={activeTab === 'profile' ? 'person' : 'person-outline'} 
            size={24} 
            color={activeTab === 'profile' ? theme.accent : theme.secondaryText} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'profile' ? theme.accent : theme.secondaryText }
          ]}>
            Profile
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 60,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconWrapper: {
    marginRight: 6,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
  },
  coinsText: {
    fontSize: 16,
    fontWeight: '600',
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
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 12,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 8,
  },
  progressGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
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
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featureBlur: {
    flex: 1,
  },
  featureGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  featureContent: {
    flex: 1,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  featureArrow: {
    alignSelf: 'flex-end',
  },
  featureShimmer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  recentActivityContainer: {
    paddingHorizontal: 24,
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityCard: {
    borderRadius: 20,
    paddingVertical: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  activityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  centralTab: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 15,
  },
  glassPanel: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassBlur: {
    flex: 1,
  },
  glassShimmer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,

  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});