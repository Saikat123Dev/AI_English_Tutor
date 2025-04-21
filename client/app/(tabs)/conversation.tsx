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
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollEndTimer = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollButtonAnim = useRef(new Animated.Value(0)).current;
  const floatingAssistantAnim = useRef(new Animated.Value(0)).current;
  const [showFloatingAssistant, setShowFloatingAssistant] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const suggestionsEntrance = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const recordingAnimation = useRef(new Animated.Value(0)).current;
  const windowHeight = Dimensions.get('window').height;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isNearTop, setIsNearTop] = useState(false);

  const { handleScroll: tabBarScrollHandler, tabBarHeight } = useContext(ScrollContext);

  const setFallbackSuggestions = () => {
    setSuggestions([
      "Tell me about yourself",
      "Let's talk about travel",
      "What's your favorite hobby?",
      "How do I improve my vocabulary?"
    ]);
  };

  const speakText = (text, messageIndex) => {
    Speech.stop();
    setSpeakingMessageIndex(messageIndex);
    Speech.speak(text, {
      language: 'en',
      onDone: () => setSpeakingMessageIndex(null),
      onStopped: () => setSpeakingMessageIndex(null),
      onError: () => setSpeakingMessageIndex(null)
    });
  };

  const replayText = (text, messageIndex) => {
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

  const animateFloatingAssistant = (show) => {
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
        alert("Microphone permission is required for recording");
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
      alert(`Recording failed: ${error.message}`);
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
        if (transcribedText) {
          setInput(transcribedText); // Set transcribed text to input box
        }

        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Vibration.vibrate(50);
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert(`Failed to stop recording: ${error.message}`);
      setIsRecording(false);
    } finally {
      recordingRef.current = null;
    }
  };

  const transcribeAudio = async (audioUri) => {
    if (!audioUri) return "";

    setIsLoading(true);
    try {
      // Create FormData with the audio file
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a', // Adjust based on your audio format
        name: 'recording.m4a',
      });

      // Send to your backend endpoint that will call AssemblyAI
      const response = await fetch('https://ai-english-tutor-9ixt.onrender.com/api/transcribe', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response)
      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();

      // Handle the AssemblyAI response
      if (data.success && data.transcription && data.transcription.text) {
        return data.transcription.text;
      } else {
        throw new Error('No transcription text returned');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Could not transcribe audio. Please try again.');
      return "";
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
        ? latestMessage.sections.find((section) => section.type === 'answer')?.content
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

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleScroll = useCallback((event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const scrollingUp = scrollPosition < lastScrollPosition;
    setLastScrollPosition(scrollPosition);

    // Check if we're near the top (within 100 pixels)
    const nearTop = scrollPosition < 100;
    if (nearTop !== isNearTop) {
      setIsNearTop(nearTop);
    }

    tabBarScrollHandler(event);

    const shouldShowScrollButton = scrollPosition > 300;
    Animated.spring(scrollButtonAnim, {
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
  }, [lastScrollPosition, tabBarScrollHandler, isNearTop]);

  const sendMessage = async (text) => {
    const messageText = text !== undefined ? text : input;

    if (!messageText || messageText.trim() === '') return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Vibration.vibrate(20);
    }

    setIsLoading(true);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user', content: messageText, timestamp, isInitial: false };
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
          message: messageText,
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

  const formatResponseFromAPI = (data) => {
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

  const generateSuggestionsFromFollowUp = (followUp) => {
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

  const handleSuggestionPress = (suggestion) => {
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
          <View style={styles.welcomeHeader}></View>
            <View>
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

  const renderMessageContent = (message, index) => {
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
          {message.sections.map((section, sectionIndex) => (
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
                    <Text style={styles.sectionTitle}>Language Explanation</Text>
                  </View>
                  <Text style={styles.explanationText}>
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
                    <Text style={styles.sectionTitle}>Feedback</Text>
                  </View>
                  <Text style={styles.feedbackText}>
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
                    <Text style={styles.sectionTitle}>Follow-up Questions</Text>
                  </View>
                  <Text style={styles.followUpText}>
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
        {message.role === 'assistant' && (
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
        )}
        <Text style={[styles.timestamp, styles.assistantTimestamp]}>
          {message.timestamp}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {renderTopicBadge()}
        <Text style={styles.headerTitle}>Language Partner</Text>
        <View style={styles.headerRight}>
          <MaterialCommunityIcons name="robot-happy" size={24} color="#6C63FF" />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: insets.bottom + 80 }
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.role === 'user' ? styles.userContainer : styles.assistantContainer
            ]}
          >
            {renderMessageContent(message, index)}
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <BlurView intensity={80} style={styles.loadingBlur} tint="dark">
              <View style={styles.typingIndicator}>
                <Animated.View
                  style={[
                    styles.typingDot,
                    {
                      opacity: typingDot1
                    }
                  ]}
                />
                <Animated.View
                  style={[
                    styles.typingDot,
                    {
                      opacity: typingDot2
                    }
                  ]}
                />
                <Animated.View
                  style={[
                    styles.typingDot,
                    {
                      opacity: typingDot3
                    }
                  ]}
                />
              </View>
            </BlurView>
          </View>
        )}
      </ScrollView>

      <Animated.View
  style={[
    styles.scrollButton,
    {
      opacity: scrollButtonAnim,
      transform: [
        {
          scale: scrollButtonAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1]
          })
        }
      ]
    }
  ]}
>
  <TouchableOpacity
    onPress={isNearTop ? scrollToBottom : scrollToTop}
    style={styles.scrollButtonInner}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={isNearTop ? ['#3B82F6', '#6366F1'] : ['#6366F1', '#A855F7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.scrollButtonGradient}
    />
    <Animated.View
      style={[
        styles.scrollButtonPulse,
        {
          opacity: waveAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.5]
          }),
          transform: [
            {
              scale: waveAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2]
              })
            }
          ]
        }
      ]}
    />
    <MaterialCommunityIcons
      name={isNearTop ? "arrow-down" : "arrow-up"}
      size={28}
      color="#FFF"
      style={styles.scrollButtonIcon}
    />
  </TouchableOpacity>
</Animated.View>

      {showFloatingAssistant && (
        <Animated.View
          style={[
            styles.floatingAssistant,
            {
              opacity: floatingAssistantAnim,
              transform: [
                {
                  scale: floatingAssistantAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1]
                  })
                },
                {
                  translateY: floatingAssistantAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }
              ]
            }
          ]}
        >
          <BlurView intensity={90} style={styles.floatingAssistantBlur} tint="dark">
            <View style={styles.floatingAssistantInner}>
              <View style={styles.floatingAssistantIconContainer}>
                <MaterialCommunityIcons name="robot-happy" size={20} color="#6C63FF" />
              </View>
              <Text style={styles.floatingAssistantText}>
                Need help with anything else?
              </Text>
            </View>
          </BlurView>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.suggestionsContainer,
          {
            opacity: suggestionsEntrance,
            transform: [
              {
                translateY: suggestionsEntrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }
            ]
          }
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScrollContent}
        >
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionButton}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"

          value={input}
          onChangeText={setInput}
          multiline
          maxHeight={100}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordingButton
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: recordingAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2]
                      })
                    }
                  ]
                }}
              >
                <FontAwesome5 name="microphone" size={18} color="#FFF" />
              </Animated.View>
            ) : (
              <FontAwesome5 name="microphone" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendButton,
              input.trim().length === 0 ? styles.sendButtonDisabled : {}
            ]}
            onPress={() => sendMessage()}
            disabled={input.trim().length === 0}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03302c',
  },
  scrollButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    zIndex: 100,
  },
  scrollButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scrollButtonGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  scrollButtonIcon: {
    position: 'relative',
    zIndex: 1,
  },
  scrollButtonPulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  headerRight: {
    position: 'absolute',
    right: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    padding: 12,
    borderRadius: 18,
  },
  userMessageText: {
    backgroundColor: '#3B82F6',
    color: '#FFF',
    borderBottomRightRadius: 2,
  },
  assistantMessageText: {
    backgroundColor: '#1E293B',
    color: '#FFF',
    borderBottomLeftRadius: 2,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
  },
  userTimestamp: {
    color: '#94A3B8',
    textAlign: 'right',
    marginRight: 4,
  },
  assistantTimestamp: {
    color: '#94A3B8',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 12,
    paddingRight: 100,
    color: '#FFF',
    fontSize: 16,
    maxHeight: 100,
  },
  buttonContainer: {
    position: 'absolute',
    right: 22,
    bottom: 17,
    flexDirection: 'row',
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
  },
  recordButton: {
    backgroundColor: '#6366F1',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  loadingContainer: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  loadingBlur: {
    borderRadius: 18,
    overflow: 'hidden',
    padding: 14,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginHorizontal: 2,
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
  },
  suggestionsScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  suggestionButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  suggestionText: {
    color: '#FFF',
    fontSize: 14,
  },
  welcomeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  welcomeGradient: {
    padding: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeAvatarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  welcomeAvatarInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 50,
    height: 50,
    borderRadius: 25,
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
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  welcomeText: {
    fontSize: 15,
    color: '#FFF',
    lineHeight: 22,
    marginBottom: 12,
  },
  welcomeDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 12,
  },
  welcomeTips: {
    marginTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
  },
  messageSection: {
    marginBottom: 12,
  },
  explanationSection: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  feedbackSection: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  followUpSection: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#A855F7',
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
  explanationIcon: {
    backgroundColor: '#38BDF8',
  },
  feedbackIcon: {
    backgroundColor: '#6366F1',
  },
  followUpIcon: {
    backgroundColor: '#A855F7',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    opacity: 0.9,
  },
  explanationText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  feedbackText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  followUpText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  replayButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollUpButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
  },
  scrollUpButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  floatingAssistant: {
    position: 'absolute',
    bottom: 150,
    left: 16,
    right: 16,
  },
  floatingAssistantBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  floatingAssistantInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  floatingAssistantIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  floatingAssistantText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  topicBadgeContainer: {
    position: 'absolute',
    left: 16,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  topicText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  }
});
