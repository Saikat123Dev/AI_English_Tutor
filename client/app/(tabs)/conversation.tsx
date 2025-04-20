import { useUser } from '@clerk/clerk-expo';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
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
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollEndTimer = useRef<NodeJS.Timeout | null>(null);
  const [suggestions, setSuggestions] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollUpButtonAnim = useRef(new Animated.Value(0)).current;
  const floatingAssistantAnim = useRef(new Animated.Value(0)).current;
  const [showFloatingAssistant, setShowFloatingAssistant] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const suggestionsEntrance = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const recordingAnimation = useRef(new Animated.Value(0)).current;
  const windowHeight = Dimensions.get('window').height;
  const recordingRef = useRef<Audio.Recording | null>(null);

  const { handleScroll: tabBarScrollHandler, tabBarHeight } = useContext(ScrollContext);

  const setFallbackSuggestions = () => {
    setSuggestions([
      "Tell me about yourself",
      "Let's talk about travel",
      "What's your favorite hobby?",
      "How do I improve my vocabulary?"
    ]);
  };

  const speakText = (text: string, messageIndex: number) => {
    Speech.stop();
    setSpeakingMessageIndex(messageIndex);
    Speech.speak(text, {
      language: 'en',
      onDone: () => setSpeakingMessageIndex(null),
      onStopped: () => setSpeakingMessageIndex(null),
      onError: () => setSpeakingMessageIndex(null)
    });
  };

  const replayText = (text: string, messageIndex: number) => {
    if (speakingMessageIndex === messageIndex) {
      Speech.stop();
      setSpeakingMessageIndex(null);
      return;
    }
    speakText(text, messageIndex);
  };

  const startTypingAnimation = () => {
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

  const animateRecording = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(recordingAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
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

    Animated.timing(suggestionsEntrance, {
      toValue: 1,
      duration: 600,
      delay: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true
    }).start();
  };

  const requestAudioPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestAudioPermissions();
      if (!hasPermission) {
        console.warn('Audio recording permissions denied');
        return;
      }

      setIsRecording(true);
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Vibration.vibrate(20);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      animateRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setIsRecording(false);
        recordingAnimation.stopAnimation();
        recordingAnimation.setValue(0);

        // Transcribe the audio using AssemblyAI API
        const transcribedText = await transcribeAudio(uri);
        setInput(transcribedText);

        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Vibration.vibrate(50);
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
    } finally {
      recordingRef.current = null;
    }
  };

  const transcribeAudio = async (audioUri: string | null) => {
    if (!audioUri) return "";

    setIsLoading(true);
    try {
      // Create FormData to send the audio file
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a', // Adjust based on your audio format
        name: 'recording.m4a',
      } as any);

      // Send to your backend API endpoint that handles AssemblyAI integration
      const response = await fetch('https://ai-english-tutor-9ixt.onrender.com/api/transcribe', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      if (data.success && data.transcription) {
        return data.transcription;
      } else {
        throw new Error('No transcription returned');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      return "Could not transcribe audio. Please try again.";
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    animateEntranceElements();
    animateWave();
    startTypingAnimation();

    const fetchInitialQuestions = async () => {
      try {
        if (!user?.primaryEmailAddress?.emailAddress) {
          setFallbackSuggestions();
          return;
        }

        const response = await fetch('https://ai-english-tutor-9ixt.onrender.com/api/chat/getHistory?email=' + user.primaryEmailAddress.emailAddress, {
          method: 'GET',
          headers: {
            "ngrok-skip-browser-warning": "true",
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.history && data.history.length > 0) {
            const historyMessages = data.history.map((item) => {
              const userMessage = {
                role: 'user',
                content: item.userres,
                timestamp: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };

              let assistantContent = "Sorry, I couldn't process this message.";
              let sections = null;

              try {
                const parsedLLM = JSON.parse(item.llmres);

                if (parsedLLM.success) {
                  sections = [];

                  if (parsedLLM.answer) {
                    sections.push({
                      type: 'answer',
                      content: parsedLLM.answer
                    });
                  }

                  if (parsedLLM.explanation) {
                    sections.push({
                      type: 'explanation',
                      content: parsedLLM.explanation,
                      icon: 'lightbulb-outline'
                    });
                  }

                  if (parsedLLM.feedback) {
                    sections.push({
                      type: 'feedback',
                      content: parsedLLM.feedback,
                      icon: 'message-alert-outline'
                    });
                  }

                  if (parsedLLM.followUp) {
                    sections.push({
                      type: 'followUp',
                      content: parsedLLM.followUp,
                      icon: 'chat-question-outline'
                    });
                  }

                  assistantContent = [
                    parsedLLM.answer,
                    parsedLLM.explanation,
                    parsedLLM.feedback,
                    parsedLLM.followUp
                  ].filter(Boolean).join('\n\n');

                  if (parsedLLM.followUp) {
                    generateSuggestionsFromFollowUp(parsedLLM.followUp);
                  }
                }
              } catch (error) {
                console.error('Error parsing LLM response:', error);
                assistantContent = "Error parsing response.";
              }

              const assistantMessage = {
                role: 'assistant',
                content: assistantContent,
                sections: sections,
                timestamp: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };

              return [userMessage, assistantMessage];
            }).flat();

            if (historyMessages.length === 0) {
              setMessages([
                {
                  role: 'assistant',
                  content: `Hi${user?.firstName ? ` ${user.firstName}` : ''}! I'm your language learning assistant. Let's practice conversation! What would you like to talk about?`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isInitial: true
                }
              ]);
            } else {
              setMessages(historyMessages);
            }

            if (data.history.length > 0) {
              const lastItem = data.history[data.history.length - 1];
              try {
                const parsedLLM = JSON.parse(lastItem.llmres);
                if (parsedLLM.followUp) {
                  generateSuggestionsFromFollowUp(parsedLLM.followUp);
                  return;
                }
              } catch (error) {
                console.error('Error parsing last message for suggestions:', error);
              }
            }
          } else {
            setMessages([
              {
                role: 'assistant',
                content: `Hi${user?.firstName ? ` ${user.firstName}` : ''}! I'm your language learning assistant. Let's practice conversation! What would you like to talk about?`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isInitial: true
                }
              ]);
            }
            setFallbackSuggestions();
          } else {
            console.error('Invalid content type from API');
            setFallbackSuggestions();
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
          setFallbackSuggestions();

          setMessages([
            {
              role: 'assistant',
              content: `Hi${user?.firstName ? ` ${user.firstName}` : ''}! I'm your language learning assistant. Let's practice conversation! What would you like to talk about?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isInitial: true
            }
          ]);
        }
      };

      fetchInitialQuestions();

      return () => {
        Speech.stop();
        if (recordingRef.current) {
          recordingRef.current.stopAndUnloadAsync();
        }
      };
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
      const latestMessage = messages[messages.length - 1];
      if (latestMessage?.role === 'assistant' && !latestMessage.isInitial && messages.length > 1) {
        const content = latestMessage.sections
          ? latestMessage.sections.find((section: any) => section.type === 'answer')?.content
          : latestMessage.content;
        if (content) {
          speakText(content, messages.length - 1);
        }
      }
    }, [messages]);

    const scrollToTop = () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    };

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.y;
      const scrollingUp = scrollPosition < lastScrollPosition;
      setLastScrollPosition(scrollPosition);

      tabBarScrollHandler(event);

      const shouldShowScrollButton = scrollPosition > 300;
      Animated.spring(scrollUpButtonAnim, {
        toValue: shouldShowScrollButton ? 1 : 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();

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

          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: formattedResponse.content,
              sections: formattedResponse.sections,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            if (data.followUp) {
              generateSuggestionsFromFollowUp(data.followUp);
            }

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
            colors={['#0b3b4d', '#145241']}
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
                      color="#145241"
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

    const renderMessageContent = (message: any, index: number) => {
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
            {message.sections.map((section: any, sectionIndex: number) => (
              <View key={sectionIndex} style={styles.messageSection}>
                {section.type === 'answer' && (
                  <>
                    <Text style={[styles.messageText, styles.assistantMessageText]}>
                      {section.content}
                    </Text>
                    <TouchableOpacity
                      style={styles.replayButton}
                      onPress={() => replayText(section.content, index)}
                    >
                      <Ionicons
                        name={speakingMessageIndex === index ? "volume-mute" : "volume-high"}
                        size={20}
                        color={speakingMessageIndex === index ? "#FF5722" : "#23cc96"}
                      />
                    </TouchableOpacity>
                  </>
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
          <TouchableOpacity
            style={styles.replayButton}
            onPress={() => replayText(message.content, index)}
          >
            <Ionicons
              name={speakingMessageIndex === index ? "volume-mute" : "volume-high"}
              size={20}
              color={speakingMessageIndex === index ? "#FF5722" : "#23cc96"}
            />
          </TouchableOpacity>
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
              ]}
            />
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


    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar backgroundColor="#1E1E2E" barStyle="light-content" />

        {renderTopicBadge()}

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
              <View style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                message.isInitial && styles.initialMessageBubble
              ]}>
                {renderMessageContent(message, index)}
              </View>
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

          <View style={{ height: 120 }} />
        </ScrollView>

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
            <BlurView intensity={90} tint="dark" style={styles.scrollUpButtonBlur}>
              <Ionicons name="chevron-up" size={40} color="#FFF" />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? tabBarHeight + 20 : 0}
          style={styles.inputContainer}
        >
          <BlurView intensity={90} tint="dark" style={styles.inputBlur}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type or speak your message..."
                placeholderTextColor="#A0A0C0"
                value={input}
                onChangeText={setInput}
                multiline={true}
                maxHeight={100}
              />
              <TouchableOpacity
                style={[styles.micButton, isRecording && styles.micButtonRecording]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={{
                    opacity: recordingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.7]
                    })
                  }}
                >
                  <Ionicons
                    name={isRecording ? "stop" : "mic"}
                    size={18}
                    color={isRecording ? "#FF5722" : "#FFF"}
                  />
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                onPress={() => sendMessage()}
                disabled={!input.trim()}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={input.trim() ? ['#7F5AF0', '#6C56E0'] : ['#3A3A5A', '#3A3A5A']}
                  style={styles.sendButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="send" size={18} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    chatContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
      backgroundColor: '#03302c',
    },
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
      backgroundColor: '#1a4499',
      borderWidth: 1,
      borderColor: '#4752C4',
    },
    topicText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
    },
    messageRow: {
      flexDirection: 'row',
      marginBottom: 10,
      alignItems: 'flex-end',
    },
    userRow: {
      flexDirection: 'row-reverse',
    },
    assistantRow: {
      marginRight: 8,
    },
    messageBubble: {
      padding: 12,
      borderRadius: 18,
      maxWidth: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2,
    },
    userBubble: {
      backgroundColor: '#1a3666',
      borderBottomRightRadius: 4,
      borderWidth: 1,
      borderColor: '#4752C4',
    },
    assistantBubble: {
      backgroundColor: '#1b2638',
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: '#1a4499',
    },
    initialMessageBubble: {
      backgroundColor: 'transparent',
      shadowColor: 'transparent',
      padding: 0,
      maxWidth: '100%',
      borderWidth: 0,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 22,
    },
    userMessageText: {
      color: '#FFFFFF',
    },
    assistantMessageText: {
      color: '#f2f0f0',
    },
    timestamp: {
      fontSize: 12,
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    userTimestamp: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    assistantTimestamp: {
      color: 'rgba(220, 221, 222, 0.8)',
    },
    replayButton: {
      right: 8,
      top: 8,
      left: 2,
      padding: 10,
      borderRadius: 8,
      backgroundColor: 'rgba(35, 204, 150, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(35, 204, 150, 0.3)',
      width: 40,
      height: 40,
      justifyContent: 'center',
    },
    welcomeCard: {
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      backgroundColor: '#23cc96',
      borderWidth: 1,
      borderColor: '#202225',
    },
    welcomeGradient: {
      padding: 20,
      backgroundColor: '#23cc96',
    },
    welcomeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    welcomeAvatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#5865F2',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: '#4752C4',
    },
    welcomeAvatarInner: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    welcomeTitleContainer: {
      flex: 1,
    },
    welcomeTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    welcomeSubtitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    welcomeSubtitle: {
      fontSize: 12,
      color: '#B9BBBE',
    },
    welcomeText: {
      fontSize: 16,
      color: '#DCDDDE',
      lineHeight: 24,
      marginBottom: 16,
    },
    welcomeDivider: {
      height: 1,
      backgroundColor: '#40444B',
      marginBottom: 16,
    },
    welcomeTips: {
      gap: 14,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tipIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(88, 101, 242, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: 'rgba(88, 101, 242, 0.3)',
    },
    tipText: {
      fontSize: 14,
      color: '#DCDDDE',
      flex: 1,
      lineHeight: 20,
    },
    messageSection: {
      marginBottom: 12,
      marginTop: 4,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionIconContainer: {
      width: 26,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      borderWidth: 1,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
    },
    explanationSection: {
      backgroundColor: 'rgba(87, 242, 135, 0.1)',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(87, 242, 135, 0.3)',
    },
    explanationIcon: {
      backgroundColor: 'rgba(87, 242, 135, 0.15)',
      borderColor: 'rgba(87, 242, 135, 0.3)',
    },
    explanationTitle: {
      color: '#23cc96',
    },
    feedbackSection: {
      backgroundColor: 'rgba(255, 177, 66, 0.18)',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 177, 66, 0.4)',
    },
    feedbackIcon: {
      backgroundColor: 'rgba(255, 177, 66, 0.15)',
      borderColor: 'rgba(255, 177, 66, 0.3)',
    },
    feedbackTitle: {
      color: '#FBB848',
    },
    feedbackText: {
      color: '#DCDDDE',
    },
    followUpSection: {
      backgroundColor: 'rgba(235, 69, 158, 0.2)',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(235, 69, 158, 0.4)',
    },
    followUpIcon: {
      backgroundColor: 'rgba(235, 69, 158, 0.15)',
      borderColor: 'rgba(235, 69, 158, 0.3)',
    },
    followUpTitle: {
      color: '#23cc96',
    },
    typingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    typingDotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
      backgroundColor: 'rgba(42, 57, 66, 0.9)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#23cc96',
      marginHorizontal: 2,
    },
    typingText: {
      fontSize: 13,
      color: '#23cc96',
      marginLeft: 4,
    },
    typingBubble: {
      backgroundColor: 'rgba(42, 57, 66, 0.9)',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 2,
    },
    suggestionsContainer: {
      marginTop: 16,
      marginBottom: 16,
    },
    suggestionsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#B9BBBE',
      marginBottom: 10,
    },
    suggestionsScrollView: {
      paddingVertical: 4,
    },
    suggestionBubble: {
      backgroundColor: 'rgba(88, 101, 242, 0.2)',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 10,
      borderWidth: 1,
      borderColor: 'rgba(88, 101, 242, 0.7)',
    },
    suggestionText: {
      fontSize: 13,
      color: '#23cc96',
      fontWeight: '500',
    },
    scrollUpButtonContainer: {
      position: 'absolute',
      bottom: 100,
      right: 16,
      backgroundColor: 'rgba(0, 128, 128, 0.3)',
      zIndex: 100,
    },
    scrollUpButton: {
      width: 45,
      height: 45,
      backgroundColor: 'rgba(0, 128, 128, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputContainer: {
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: 20,
      backgroundColor: '#03302c',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 6,
      paddingHorizontal: 10,
      backgroundColor: '#2a3942',
      borderWidth: 2,
      borderColor: '#1f2a30',
    },
    input: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 10,
      paddingHorizontal: 8,
      color: '#FFFFFF',
      maxHeight: 100,
      backgroundColor: '#03302c',
    },
    micButton: {
      width: 35,
      height: 35,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#5865F2',
      marginRight: 8,
    },
    micButtonRecording: {
      backgroundColor: '#FF5722',
    },
    sendButton: {
      width: 35,
      height: 35,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#064739',
      borderWidth: 0,
    },
    sendButtonDisabled: {
      opacity: 0.7,
      backgroundColor: '#062e25',
    },
    sendButtonGradient: {
      width: 35,
      height: 35,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#00a884',
    },
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#23cc96',
      marginRight: 6,
    },
    avatarContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollUpButtonBlur: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
