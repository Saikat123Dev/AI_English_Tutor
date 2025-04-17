import { useUser } from '@clerk/clerk-expo';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollContext } from './ScrollContext';

export default function ConversationScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi${user?.firstName ? ` ${user.firstName}` : ''}! I'm your language learning assistant. Let's practice conversation! What would you like to talk about?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInitial: true
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollEndTimer = useRef<NodeJS.Timeout | null>(null);
  const [suggestions, setSuggestions] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollUpButtonAnim = useRef(new Animated.Value(0)).current;
  const floatingAssistantAnim = useRef(new Animated.Value(0)).current;
  const [showFloatingAssistant, setShowFloatingAssistant] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const suggestionsEntrance = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const successCheckAnimation = useRef(new Animated.Value(0)).current;
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const windowHeight = Dimensions.get('window').height;

  // Get scroll context for tab bar animation
  const { handleScroll: tabBarScrollHandler, tabBarHeight } = useContext(ScrollContext);

  const setFallbackSuggestions = () => {
    setSuggestions([
      "Tell me about yourself",
      "Let's talk about travel",
      "What's your favorite hobby?",
      "How do I improve my vocabulary?"
    ]);
  };

  const startTypingAnimation = () => {
    // Dot animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingDot1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot3, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot1, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot2, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot3, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Typing indicator animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateWave = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateSuccessCheck = () => {
    Animated.sequence([
      Animated.timing(successCheckAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(successCheckAnimation, {
        toValue: 0,
        duration: 300,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateFloatingAssistant = (show: boolean) => {
    setShowFloatingAssistant(show);
    Animated.spring(floatingAssistantAnim, {
      toValue: show ? 1 : 0,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const animateEntranceElements = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true
      })
    ]).start();

    // Delay suggestion animation entrance
    Animated.timing(suggestionsEntrance, {
      toValue: 1,
      duration: 600,
      delay: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true
    }).start();
  };

  useEffect(() => {
    animateEntranceElements();
    animateWave();
    startTypingAnimation();

    // Fetch initial questions
    const fetchInitialQuestions = async () => {
      try {
        if (!user?.primaryEmailAddress?.emailAddress) return false;

        const response = await fetch('https://ai-english-tutor-9ixt.onrender.com/api/initialQuestions', {
          method: 'POST',
          headers: {
            "ngrok-skip-browser-warning": "true",
            'Accept':'application/json',
            'Content-Type':'application/json',
          },
          body: JSON.stringify({
            email: user.primaryEmailAddress.emailAddress
          }),
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.questions) {
            setSuggestions(data.questions);
            return;
          }
        }
        setFallbackSuggestions();
      } catch (error) {
        console.error('Error fetching initial questions:', error);
        setFallbackSuggestions();
      }
    };

    fetchInitialQuestions();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current && messages.length > 1) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      startTypingAnimation();
    } else {
      typingDot1.setValue(0);
      typingDot2.setValue(0);
      typingDot3.setValue(0);
      typingAnimation.setValue(0);
    }
  }, [isLoading]);

  useEffect(() => {
    if (showSuccessAnimation) {
      animateSuccessCheck();
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 2000);
    }
  }, [showSuccessAnimation]);

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const scrollingUp = scrollPosition < lastScrollPosition;
    setLastScrollPosition(scrollPosition);

    // Pass scroll event to tab bar handler
    tabBarScrollHandler(event);

    // Show the scroll up button if user has scrolled down more than 300
    const shouldShowScrollButton = scrollPosition > 300;
    Animated.spring(scrollUpButtonAnim, {
      toValue: shouldShowScrollButton ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();

    // Show floating assistant when scrolling up and not at the top
    if (scrollingUp && scrollPosition > 200) {
      animateFloatingAssistant(true);
    } else {
      animateFloatingAssistant(false);
    }

    setIsScrolling(true);
    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
    }
    scrollEndTimer.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [lastScrollPosition, tabBarScrollHandler]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;

    // Haptic feedback when sending message
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Vibration.vibrate(20);
    }

    setIsLoading(true);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user', content: text, timestamp };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      if (!user?.primaryEmailAddress?.emailAddress) return false;

      const response = await fetch('https://ai-english-tutor-9ixt.onrender.com/api/conversation/ask', {
        method: 'POST',
        headers: {
          "ngrok-skip-browser-warning": "true",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.primaryEmailAddress.emailAddress,
          message: text,
          selectedTopic: selectedTopic
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      const data = await response.json();

      if (data.success) {
        const formattedResponse = formatResponseFromAPI(data);

        // Show success animation briefly
        setShowSuccessAnimation(true);

        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: formattedResponse.content,
            sections: formattedResponse.sections,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);

          // Generate new suggestions if available
          if (data.followUp) {
            generateSuggestionsFromFollowUp(data.followUp);
          }

          // Animate suggestions entrance
          suggestionsEntrance.setValue(0);
          Animated.timing(suggestionsEntrance, {
            toValue: 1,
            duration: 600,
            delay: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true
          }).start();
        }, 500);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm sorry, I couldn't process your message. Please try again.",
          timestamp
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, there was an error connecting to the service.",
        timestamp
      }]);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const formatResponseFromAPI = (data: any) => {
    const sections = [];

    if (data.answer) {
      sections.push({
        type: 'answer',
        content: data.answer
      });
    }

    if (data.explanation) {
      sections.push({
        type: 'explanation',
        content: data.explanation,
        icon: 'lightbulb-outline'
      });
    }

    if (data.feedback) {
      sections.push({
        type: 'feedback',
        content: data.feedback,
        icon: 'message-alert-outline'
      });
    }

    if (data.followUp) {
      sections.push({
        type: 'followUp',
        content: data.followUp,
        icon: 'chat-question-outline'
      });
    }

    const content = [
      data.answer,
      data.explanation,
      data.feedback,
      data.followUp
    ].filter(Boolean).join('\n\n');

    return {
      content,
      sections
    };
  };

  const generateSuggestionsFromFollowUp = (followUp: string) => {
    const newSuggestions = [];

    if (followUp.includes("aspect of travel")) {
      setSelectedTopic("travel");
      newSuggestions.push(
        "I love exploring historical sites",
        "I prefer relaxing beach vacations",
        "I enjoy trying local cuisine when traveling",
        "Adventure travel is my favorite"
      );
    } else if (followUp.includes("vocabulary")) {
      setSelectedTopic("vocabulary");
      newSuggestions.push(
        "Help me with business vocabulary",
        "I need everyday conversation phrases",
        "Let's practice advanced idioms",
        "Formal language for presentations"
      );
    } else if (followUp.includes("hobby")) {
      setSelectedTopic("hobbies");
      newSuggestions.push(
        "I enjoy photography",
        "I love cooking new recipes",
        "Reading books is my favorite pastime",
        "I play tennis regularly"
      );
    } else {
      newSuggestions.push(
        "Can you explain that more clearly?",
        "Let's continue practicing",
        "Give me a challenging exercise",
        "How can I improve my grammar?"
      );
    }

    setSuggestions(newSuggestions);
  };

  const handleSuggestionPress = (suggestion: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    sendMessage(suggestion);
  };

  const renderTopicBadge = () => {
    if (!selectedTopic) return null;

    const topicIcons = {
      "travel": <FontAwesome5 name="plane" size={12} color="#FFF" />,
      "vocabulary": <FontAwesome5 name="book" size={12} color="#FFF" />,
      "hobbies": <FontAwesome5 name="palette" size={12} color="#FFF" />
    };

    const topicColors = {
      "travel": ['#FF9800', '#FF5722'],
      "vocabulary": ['#4CAF50', '#2E7D32'],
      "hobbies": ['#9C27B0', '#7B1FA2']
    };

    return (
      <View style={styles.topicBadgeContainer}>
        <LinearGradient
          colors={topicColors[selectedTopic] || ['#6C63FF', '#8A63FF']}
          style={styles.topicBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {topicIcons[selectedTopic]}
          <Text style={styles.topicText}>
            {selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1)}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderWelcomeCard = () => {
    return (
      <Animated.View
        style={[
          styles.welcomeCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}
      >
        <LinearGradient
          colors={['#6C63FF', '#8A63FF']}
          style={styles.welcomeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeAvatarContainer}>
              <View style={styles.welcomeAvatarInner}>
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: waveAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['-15deg', '15deg']
                        })
                      }
                    ]
                  }}
                >
                  <MaterialCommunityIcons
                    name="robot-happy"
                    size={36}
                    color="#6C63FF"
                  />
                </Animated.View>
              </View>
            </View>
            <View style={styles.welcomeTitleContainer}>
              <Text style={styles.welcomeTitle}>Welcome to Language Partner</Text>
              <View style={styles.welcomeSubtitleContainer}>
                <View style={styles.onlineDot} />
                <Text style={styles.welcomeSubtitle}>AI-Powered Learning</Text>
              </View>
            </View>
          </View>

          <Text style={styles.welcomeText}>
            {`Hi${user?.firstName ? ` ${user.firstName}` : ''}! I'm your AI language coach. Let's practice conversation to improve your skills!`}
          </Text>

          <View style={styles.welcomeDivider} />

          <View style={styles.welcomeTips}>
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <MaterialCommunityIcons name="message-text-outline" size={18} color="#FFD700" />
              </View>
              <Text style={styles.tipText}>Natural conversations with tailored feedback</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#76FF03" />
              </View>
              <Text style={styles.tipText}>Learn vocabulary, grammar, and cultural nuances</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <MaterialCommunityIcons name="chart-line-variant" size={18} color="#FF9800" />
              </View>
              <Text style={styles.tipText}>Track your progress and build confidence</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderMessageContent = (message: any) => {
    if (message.isInitial) {
      return renderWelcomeCard();
    }

    if (message.role === 'user') {
      return (
        <View>
          <Text style={[styles.messageText, styles.userMessageText]}>
            {message.content}
          </Text>
          <Text style={[styles.timestamp, styles.userTimestamp]}>
            {message.timestamp}
          </Text>
        </View>
      );
    }

    if (message.sections) {
      return (
        <View>
          {message.sections.map((section: any, index: number) => (
            <View key={index} style={styles.messageSection}>
              {section.type === 'answer' && (
                <Text style={[styles.messageText, styles.assistantMessageText]}>
                  {section.content}
                </Text>
              )}

              {section.type === 'explanation' && (
                <View style={styles.explanationSection}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconContainer, styles.explanationIcon]}>
                      <MaterialCommunityIcons
                        name="lightbulb-outline"
                        size={16}
                        color="#FFF"
                      />
                    </View>
                    <Text style={[styles.sectionTitle, styles.explanationTitle]}>Tips & Explanation</Text>
                  </View>
                  <Text style={[styles.messageText, styles.assistantMessageText]}>
                    {section.content}
                  </Text>
                </View>
              )}

              {section.type === 'feedback' && (
                <View style={styles.feedbackSection}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconContainer, styles.feedbackIcon]}>
                      <MaterialCommunityIcons
                        name="message-alert-outline"
                        size={16}
                        color="#FFF"
                      />
                    </View>
                    <Text style={[styles.sectionTitle, styles.feedbackTitle]}>Feedback</Text>
                  </View>
                  <Text style={[styles.messageText, styles.assistantMessageText, styles.feedbackText]}>
                    {section.content}
                  </Text>
                </View>
              )}

              {section.type === 'followUp' && (
                <View style={styles.followUpSection}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconContainer, styles.followUpIcon]}>
                      <MaterialCommunityIcons
                        name="chat-question-outline"
                        size={16}
                        color="#FFF"
                      />
                    </View>
                    <Text style={[styles.sectionTitle, styles.followUpTitle]}>Continue Learning</Text>
                  </View>
                  <Text style={[styles.messageText, styles.assistantMessageText]}>
                    {section.content}
                  </Text>
                </View>
              )}
            </View>
          ))}
          <Text style={[styles.timestamp, styles.assistantTimestamp]}>
            {message.timestamp}
          </Text>
        </View>
      );
    }

    return (
      <View>
        <Text style={[styles.messageText, styles.assistantMessageText]}>
          {message.content}
        </Text>
        <Text style={[styles.timestamp, styles.assistantTimestamp]}>
          {message.timestamp}
        </Text>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingDotsContainer}>
          <Animated.View style={[
            styles.typingDot,
            {
              opacity: typingDot1.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1]
              }),
              transform: [{
                translateY: typingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5]
                })
              }]
            }
          ]} />
          <Animated.View style={[
            styles.typingDot,
            {
              opacity: typingDot2.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1]
              }),
              transform: [{
                translateY: typingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5]
                })
              }]
            }
          ]} />
          <Animated.View style={[
            styles.typingDot,
            {
              opacity: typingDot3.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1]
              }),
              transform: [{
                translateY: typingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5]
                })
              }]
            }
          ]} />
        </View>
        <Text style={styles.typingText}>Assistant is thinking</Text>
      </View>
    );
  };

  const renderSuccessAnimation = () => {
    return (
      <Animated.View style={[
        styles.successAnimationContainer,
        {
          opacity: successCheckAnimation,
          transform: [{
            scale: successCheckAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1]
            })
          }]
        }
      ]}>
        <View style={styles.successCheckContainer}>
          <Animated.View style={[
            styles.successCheckBackground,
            {
              transform: [{
                scale: successCheckAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1]
                })
              }]
            }
          ]} />
          <Animated.View style={[
            styles.successCheck,
            {
              opacity: successCheckAnimation,
              transform: [
                {
                  scale: successCheckAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1.1, 1]
                  })
                }
              ]
            }
          ]}>
            <MaterialCommunityIcons name="check" size={48} color="#4CAF50" />
          </Animated.View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor="#6C63FF" barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={['#6C63FF', '#8A63FF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Language Partner</Text>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Active now</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Topic Badge */}
      {renderTopicBadge()}

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.chatContainer, { paddingBottom: tabBarHeight + 20 }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {messages.map((message, index) => (
          <Animated.View
            key={index}
            style={[
              styles.messageRow,
              message.role === 'user' ? styles.userRow : styles.assistantRow,
              {
                opacity: fadeAnim,
                transform: index > 0 ? [] : [{ translateY }]
              }
            ]}
          >
            {message.role === 'assistant' && !message.isInitial && (
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#6C63FF', '#8A63FF']}
                  style={styles.avatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons name="robot-happy-outline" size={20} color="#FFF" />
                </LinearGradient>
              </View>
            )}

            <View style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              message.isInitial && styles.initialMessageBubble
            ]}>
              {renderMessageContent(message)}
            </View>

            {message.role === 'user' && (
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#E91E63', '#FF5252']}
                  style={[styles.avatar, styles.userAvatar]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <FontAwesome5 name="user" size={16} color="#FFF" />
                </LinearGradient>
              </View>
            )}
          </Animated.View>
        ))}

        {isLoading && (
          <View style={[styles.messageRow, styles.assistantRow]}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#6C63FF', '#8A63FF']}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="robot-happy-outline" size={20} color="#FFF" />
              </LinearGradient>
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
              {renderTypingIndicator()}
            </View>
          </View>
        )}

        {/* Success Animation Overlay */}
        {showSuccessAnimation && renderSuccessAnimation()}

        {/* Suggestions */}
        {!isLoading && suggestions.length > 0 && (
          <Animated.View
            style={[
              styles.suggestionsContainer,
              {
                opacity: suggestionsEntrance,
                transform: [{
                  translateY: suggestionsEntrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            <Text style={styles.suggestionsTitle}>Quick Suggestions</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsScrollView}
            >
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionBubble}
                  onPress={() => handleSuggestionPress(suggestion)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Empty space at bottom to allow scrolling past the last message */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Scroll Up Button */}
      <Animated.View
        style={[
          styles.scrollUpButtonContainer,
          {
            opacity: scrollUpButtonAnim,
            transform: [{
              scale: scrollUpButtonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.scrollUpButton}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(108, 99, 255, 0.9)', 'rgba(138, 99, 255, 0.9)']}
            style={styles.scrollUpButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="chevron-up" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Floating Assistant */}
      {showFloatingAssistant && (
        <Animated.View
          style={[
            styles.floatingAssistantContainer,
            {
              opacity: floatingAssistantAnim,
              transform: [{
                scale: floatingAssistantAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }]
            }
          ]}
        >
          <BlurView intensity={80} tint="light" style={styles.floatingAssistantBlur}>
            <View style={styles.floatingAssistantContent}>
              <View style={styles.floatingAssistantAvatar}>
                <LinearGradient
                  colors={['#6C63FF', '#8A63FF']}
                  style={styles.floatingAssistantAvatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons name="robot-happy" size={24} color="#FFF" />
                </LinearGradient>
              </View>
              <Text style={styles.floatingAssistantText}>Need any help?</Text>
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? tabBarHeight + 20 : 0}
        style={styles.inputContainer}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.95)']}
          style={styles.inputGradient}
          locations={[0, 0.3, 0.5]}
        />

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={input}
            onChangeText={setInput}
            multiline={true}
            maxHeight={100}
            placeholderTextColor="#9E9E9E"
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim()}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={input.trim() ? ['#6C63FF', '#8A63FF'] : ['#D1D1D1', '#C7C7C7']}
              style={styles.sendButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="send" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Styles */}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  // Container & Main Layout
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 3,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  backButton: {
    padding: 8,
  },
  infoButton: {
    padding: 8,
  },

  // Topic Badge
  topicBadgeContainer: {
    position: 'absolute',
    top: 70,
    right: 16,
    zIndex: 11,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  topicText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Message Styles
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userRow: {
    flexDirection: 'row-reverse',
    marginLeft: 40,
  },
  assistantRow: {
    marginRight: 40,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#6C63FF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
  },
  initialMessageBubble: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    padding: 0,
    maxWidth: '100%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  userMessageText: {
    color: '#FFF',
  },
  assistantMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  assistantTimestamp: {
    color: '#888',
  },

  // Avatar Styles
  avatarContainer: {
    marginHorizontal: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: '#E91E63',
  },

  // Welcome Card
  welcomeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  welcomeGradient: {
    padding: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  welcomeAvatarInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitleContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  welcomeSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
    marginBottom: 16,
  },
  welcomeDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  welcomeTips: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    flex: 1,
  },

  // Message Sections
  messageSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  explanationSection: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  explanationIcon: {
    backgroundColor: '#4CAF50',
  },
  explanationTitle: {
    color: '#2E7D32',
  },
  feedbackSection: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  feedbackIcon: {
    backgroundColor: '#FF9800',
  },
  feedbackTitle: {
    color: '#E65100',
  },
  feedbackText: {
    color: '#333',
  },
  followUpSection: {
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  followUpIcon: {
    backgroundColor: '#9C27B0',
  },
  followUpTitle: {
    color: '#7B1FA2',
  },

  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6C63FF',
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 12,
    color: '#888',
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },

  // Success Animation
  successAnimationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
  successCheckContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCheckBackground: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  successCheck: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Suggestions
  suggestionsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  suggestionsScrollView: {
    paddingVertical: 4,
  },
  suggestionBubble: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  suggestionText: {
    fontSize: 14,
    color: '#6C63FF',
  },

  // Scroll Up Button
  scrollUpButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    zIndex: 100,
  },
  scrollUpButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollUpButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Floating Assistant
  floatingAssistantContainer: {
    position: 'absolute',
    bottom: 160,
    right: 16,
    zIndex: 100,
  },
  floatingAssistantBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  floatingAssistantContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  floatingAssistantAvatar: {
    marginRight: 8,
  },
  floatingAssistantAvatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingAssistantText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  // Input Area
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  inputGradient: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingRight: 8,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
