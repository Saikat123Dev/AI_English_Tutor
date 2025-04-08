import { useUser } from '@clerk/clerk-expo';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = 'https://e739-2409-40e1-3119-3b58-e3f-828f-6e98-668f.ngrok-free.app/api/pronounciation';
const RANDOM_WORD_API = 'https://random-word-api.herokuapp.com/all';

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LanguageLearningScreen() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('grammar');
  const [selectedCategory, setSelectedCategory] = useState('basics');
  const [selectedWord, setSelectedWord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sound, setSound] = useState(null);
  const [allWords, setAllWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(SCREEN_WIDTH))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];

  // Recording states
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState(null);
  const [pronunciationHistory, setPronunciationHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User info
  const userInfo = {
    email: user?.emailAddresses?.[0]?.emailAddress || 'user@example.com',
    motherTongue: 'English',
    englishLevel: 'Beginner'
  };

  // Animation effects
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    // Pulse animation for recording button
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.9,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }

    // Rotate animation for refresh icon
    if (isSubmitting) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [fadeAnim, slideAnim, isRecording, pulseAnim, isSubmitting, rotateAnim]);

  // Fetch all words on component mount
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch(RANDOM_WORD_API);
        const data = await response.json();
        setAllWords(data);

        // Filter words by length for better pronunciation practice
        const filtered = data.filter(word => word.length >= 3 && word.length <= 12);
        setFilteredWords(filtered.slice(0, 50)); // Limit to 50 words for performance
      } catch (err) {
        console.error('Error fetching words:', err);
        // Fallback words if API fails
        setFilteredWords([
          'hello', 'world', 'language', 'practice', 'pronunciation',
          'communication', 'education', 'technology', 'innovation', 'creativity',
          'success', 'motivation', 'inspiration', 'knowledge', 'wisdom',
          'experience', 'opportunity', 'challenge', 'solution', 'progress',
          'development', 'achievement', 'happiness', 'gratitude', 'kindness'
        ]);
      }
    };

    fetchWords();
  }, []);

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = allWords.filter(word =>
        word.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10); // Limit to 10 results
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  // Select a word from search results
  const handleSelectWordFromSearch = (word) => {
    const difficulty = categorizeWordDifficulty(word);
    const newWord = {
      id: word,
      word,
      difficulty
    };
    setSelectedWord(newWord);
    setSearchQuery('');
    setShowSearchResults(false);
    Haptics.selectionAsync();
  };

  // Grammar Data with real-world examples
  const grammarCategories = [
    { id: 'basics', title: 'Basics', icon: 'book-outline' },
    { id: 'tenses', title: 'Tenses', icon: 'time-outline' },
    { id: 'articles', title: 'Articles', icon: 'document-text-outline' },
    { id: 'prepositions', title: 'Prepositions', icon: 'location-outline' },
    { id: 'conjunctions', title: 'Conjunctions', icon: 'link-outline' },
  ];

  const grammarLessons = {
    basics: [
      {
        id: '1',
        title: 'Nouns',
        level: 'Beginner',
        description: 'Learn about people, places, things, and ideas',
        example: "The 'dog' barked at the 'mailman' near the 'park'."
      },
      {
        id: '2',
        title: 'Pronouns',
        level: 'Beginner',
        description: 'Words that replace nouns in sentences',
        example: "'She' gave 'it' to 'them' after 'they' asked politely."
      },
      {
        id: '3',
        title: 'Adjectives',
        level: 'Beginner',
        description: 'Words that describe nouns',
        example: "The 'quick' brown fox jumps over the 'lazy' dog."
      },
      {
        id: '4',
        title: 'Adverbs',
        level: 'Intermediate',
        description: 'Words that modify verbs, adjectives, or other adverbs',
        example: "She spoke 'quietly' but 'very' clearly during the meeting."
      },
    ],
    tenses: [
      {
        id: '1',
        title: 'Present Simple',
        level: 'Beginner',
        description: 'Used for habits, general truths, and fixed arrangements',
        example: "I 'work' at a bank. Water 'boils' at 100°C."
      },
      {
        id: '2',
        title: 'Present Continuous',
        level: 'Beginner',
        description: 'Used for actions happening now or around now',
        example: "She 'is studying' for her exam this week."
      },
      {
        id: '3',
        title: 'Past Simple',
        level: 'Intermediate',
        description: 'Used for completed actions in the past',
        example: "Yesterday, I 'finished' my project before the deadline."
      },
      {
        id: '4',
        title: 'Future Tenses',
        level: 'Advanced',
        description: 'Different ways to talk about the future',
        example: "By next year, I 'will have completed' my degree."
      },
    ],
    articles: [
      {
        id: '1',
        title: 'Definite Article',
        level: 'Beginner',
        description: 'Using "the" for specific nouns',
        example: "Please pass me 'the' salt on 'the' table."
      },
      {
        id: '2',
        title: 'Indefinite Articles',
        level: 'Beginner',
        description: 'Using "a" and "an" for non-specific nouns',
        example: "I need 'a' pen and 'an' apple for my lunch."
      },
      {
        id: '3',
        title: 'Zero Article',
        level: 'Intermediate',
        description: 'When no article is needed',
        example: "'Love' is more important than 'money' in life."
      },
    ],
    prepositions: [
      {
        id: '1',
        title: 'Prepositions of Place',
        level: 'Beginner',
        description: 'Show where something is located',
        example: "The book is 'on' the table, 'under' the lamp."
      },
      {
        id: '2',
        title: 'Prepositions of Time',
        level: 'Intermediate',
        description: 'Show when something happens',
        example: "We'll meet 'at' 3pm 'on' Monday 'in' June."
      },
      {
        id: '3',
        title: 'Prepositions of Movement',
        level: 'Intermediate',
        description: 'Show movement from one place to another',
        example: "She walked 'across' the street and 'into' the building."
      },
    ],
    conjunctions: [
      {
        id: '1',
        title: 'Coordinating Conjunctions',
        level: 'Intermediate',
        description: 'Connect words, phrases, or independent clauses',
        example: "I wanted to go, 'but' it was raining, 'so' I stayed home."
      },
      {
        id: '2',
        title: 'Subordinating Conjunctions',
        level: 'Advanced',
        description: 'Connect dependent clauses to independent clauses',
        example: "'Although' it was late, I decided to call 'because' it was urgent."
      },
    ],
  };

  // Categorize words by difficulty based on length and complexity
  const categorizeWordDifficulty = (word) => {
    if (word.length <= 4) return 'Easy';
    if (word.length <= 7) return 'Medium';
    return 'Hard';
  };

  // Pronunciation examples from the filtered words
  const pronunciationExamples = filteredWords.map((word, index) => ({
    id: index.toString(),
    word,
    difficulty: categorizeWordDifficulty(word)
  }));

  // Function to fetch pronunciation tips from our backend
  const fetchPronunciationTips = async (word) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/tips?word=${word}&email=${userInfo.email}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pronunciation tips');
      }

      return data;
    } catch (err) {
      setError(`Error fetching pronunciation tips: ${err.message}`);
      console.error('Error fetching pronunciation tips:', err);

      // Return mock tips if API fails
      return {
        phonetic: `/${word}/`,
        syllables: word.match(/[aeiouy]{1,2}/g)?.join('-') || word,
        stress: 'First syllable',
        soundGuide: [
          {
            sound: word[0],
            howTo: `Place your tongue behind your teeth and blow air for the '${word[0]}' sound`
          },
          {
            sound: word.slice(-1),
            howTo: `Close your lips slightly for the ending '${word.slice(-1)}' sound`
          }
        ],
        commonErrors: [
          `Pronouncing the '${word[1]}' sound too softly`,
          `Stressing the wrong syllable in '${word}'`
        ]
      };
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch pronunciation history from our backend
  const fetchPronunciationHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history?email=${userInfo.email}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pronunciation history');
      }

      setPronunciationHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching pronunciation history:', err);
      // Mock history if API fails
      setPronunciationHistory([
        { id: '1', word: 'communication', accuracy: 85, date: '2023-06-15T10:30:00Z' },
        { id: '2', word: 'technology', accuracy: 72, date: '2023-06-14T15:45:00Z' },
        { id: '3', word: 'pronunciation', accuracy: 68, date: '2023-06-13T09:15:00Z' },
      ]);
    }
  };

  // Fetch word data from external dictionary API and our API
  const fetchWordData = async (word) => {
    setLoading(true);
    setError(null);
    setPronunciationFeedback(null);
    try {
      // Mock data since we don't have a dictionary API key
      const mockData = {
        word: word,
        phonetic: `/${word}/`,
        phonetics: [
          {
            text: `/${word}/`,
            audio: `https://example.com/audio/${word}.mp3` // This won't actually work
          }
        ],
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition: `The act or process of ${word}`,
                example: `She demonstrated excellent ${word} during the presentation.`
              }
            ]
          }
        ]
      };

      // Fetch tips from our backend API
      const tipsData = await fetchPronunciationTips(word);

      // Combine data from both sources
      const combinedData = {
        ...mockData,
        pronunciationTips: tipsData
      };

      setWordData(combinedData);

      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching word data:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  // Start recording function
  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'You need to grant microphone permissions to record audio.');
        return;
      }

      // Prepare recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create new recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Recording error', 'Failed to start recording. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Stop recording function
  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);

      console.log('Recording stopped, URI:', uri);

      // Reset recording mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Optionally, auto-submit the recording
      if (uri && selectedWord) {
        submitPronunciation(uri, selectedWord.word);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Recording error', 'Failed to stop recording. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Submit pronunciation for assessment
  const submitPronunciation = async (audioUri, word) => {
    if (!audioUri || !word) {
      Alert.alert('Error', 'Audio recording and word are required');
      return;
    }

    setIsSubmitting(true);
    setPronunciationFeedback(null);

    try {
      // Create form data for the file upload
      const formData = new FormData();

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(audioUri);

      // Add the audio file
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      });

      // Add other required parameters
      formData.append('email', userInfo.email);
      formData.append('word', word);

      // Send to API
      const response = await fetch(`${API_BASE_URL}/assess`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to assess pronunciation');
      }

      // Set feedback
      setPronunciationFeedback(result);

      // Refresh history
      fetchPronunciationHistory();

      console.log('Pronunciation assessment result:', result);

      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Error submitting pronunciation:', err);
      Alert.alert('Submission Error', `Failed to submit pronunciation: ${err.message}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Mock feedback if API fails
      setPronunciationFeedback({
        accuracy: Math.floor(Math.random() * 30) + 70, // Random between 70-100
        correctSounds: [
          `Correct '${word[0]}' sound`,
          `Good stress on the first syllable`
        ],
        improvementNeeded: [
          `Work on the '${word[Math.floor(word.length/2)]}' sound`,
          `Try to pronounce the ending more clearly`
        ],
        practiceExercises: [
          `Say the word slowly: ${word.split('').join(' ')}`,
          `Record yourself again and compare`
        ],
        encouragement: "Great effort! With more practice, you'll master this word."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Play audio from the API
  const handlePlayAudio = async () => {
    if (!wordData || !wordData.phonetics) {
      Alert.alert('Error', 'Word data not available');
      return;
    }

    try {
      setIsPlaying(true);

      // Stop any currently playing sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Find the first phonetic with audio
      const phoneticWithAudio = wordData.phonetics.find(p => p.audio);
      if (!phoneticWithAudio?.audio) {
        throw new Error('No audio available for this word');
      }

      let audioUrl = phoneticWithAudio.audio;
      // Ensure the URL has a proper protocol
      if (audioUrl.startsWith('//')) {
        audioUrl = `https:${audioUrl}`;
      } else if (!audioUrl.startsWith('http://') && !audioUrl.startsWith('https://')) {
        audioUrl = `https://${audioUrl}`;
      }

      console.log('Attempting to play audio from:', audioUrl);

      // Load and play the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);

      // Set up playback status update
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish || status.isLoaded === false) {
          setIsPlaying(false);
          newSound.unloadAsync(); // Clean up after playback
        } else if (status.error) {
          throw new Error(`Playback error: ${status.error}`);
        }
      });

      // Haptic feedback
      Haptics.selectionAsync();
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsPlaying(false);

      // Fallback to text-to-speech
      try {
        console.log('Falling back to text-to-speech for:', wordData.word);
        await Speech.speak(wordData.word, {
          language: 'en-US',
          rate: 0.9,
          pitch: 1.0,
          onDone: () => {
            setIsPlaying(false);
            console.log('Text-to-speech completed');
          },
          onError: (speechErr) => {
            console.error('Text-to-speech error:', speechErr);
            Alert.alert(
              'Playback Error',
              'Could not play the audio or use text-to-speech. Please try recording your own pronunciation.'
            );
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setIsPlaying(false);
          },
        });
      } catch (speechErr) {
        console.error('Text-to-speech failed:', speechErr);
        Alert.alert(
          'Playback Error',
          'Could not play the audio or use text-to-speech. Please try recording your own pronunciation.'
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsPlaying(false);
      }
    }
  };

  // Play recorded audio
  const playRecordedAudio = async () => {
    if (!recordingUri) return;

    try {
      setIsPlaying(true);

      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
      }

      // Load and play the recording
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );

      setSound(newSound);

      // Set up playback status update
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      // Haptic feedback
      Haptics.selectionAsync();
    } catch (err) {
      console.error('Error playing recorded audio:', err);
      setIsPlaying(false);
      Alert.alert('Playback Error', 'Could not play your recording.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [sound, recording]);

  // Fetch word data when selectedWord changes
  useEffect(() => {
    if (selectedWord) {
      fetchWordData(selectedWord.word);
    }
  }, [selectedWord]);

  // Fetch pronunciation history on tab change
  useEffect(() => {
    if (activeTab === 'pronunciation') {
      fetchPronunciationHistory();
    }
  }, [activeTab]);

  // Grammar Components
  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategory
      ]}
      onPress={() => {
        setSelectedCategory(item.id);
        Haptics.selectionAsync();
      }}
    >
      <Ionicons
        name={item.icon}
        size={20}
        color={selectedCategory === item.id ? '#ffffff' : '#475569'}
        style={styles.categoryIcon}
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.selectedCategoryText
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderLessonCard = ({ item }) => (
    <Animated.View
      style={[
        styles.lessonCard,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.lessonCardContent}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          <View style={[
            styles.levelIndicator,
            item.level === 'Beginner' ? styles.beginnerLevel :
            item.level === 'Intermediate' ? styles.intermediateLevel :
            styles.advancedLevel
          ]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>

        <View style={styles.lessonBody}>
          <Text style={styles.lessonDescription}>{item.description}</Text>
          <View style={styles.exampleContainer}>
            <MaterialIcons name="format-quote" size={18} color="#94a3b8" />
            <Text style={styles.exampleText}>{item.example}</Text>
          </View>
        </View>

        <View style={styles.lessonFooter}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color="#64748b" />
            <Text style={styles.lessonLength}>15 min</Text>
          </View>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => Haptics.selectionAsync()}
          >
            <Text style={styles.startButtonText}>Start</Text>
            <Feather name="arrow-right" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progress,
            {
              width: '0%',
              transform: [{ scaleX: fadeAnim }]
            }
          ]}
        />
      </View>
    </Animated.View>
  );

  // Pronunciation Components
  const renderWordItem = (item) => {
    const isSelected = selectedWord?.id === item.id;

    return (
      <Pressable
        key={item.id}
        style={({ pressed }) => [
          styles.wordCard,
          isSelected && styles.selectedWordCard,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
        ]}
        onPress={() => {
          setSelectedWord(item);
          Haptics.selectionAsync();
        }}
      >
        <LinearGradient
          colors={isSelected ? ['#0ea5e9', '#3b82f6'] : ['#ffffff', '#f5f5f7']}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.wordText, isSelected && styles.selectedWordText]}>{item.word}</Text>
          <View style={[
            styles.difficultyBadge,
            item.difficulty === 'Easy' ? styles.easyBadge :
            item.difficulty === 'Medium' ? styles.mediumBadge :
            styles.hardBadge
          ]}>
            <Ionicons
              name={
                item.difficulty === 'Easy' ? 'happy-outline' :
                item.difficulty === 'Medium' ? 'alert-circle-outline' :
                'flash-outline'
              }
              size={14}
              color={
                item.difficulty === 'Easy' ? '#16a34a' :
                item.difficulty === 'Medium' ? '#d97706' :
                '#dc2626'
              }
            />
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  // Render pronunciation feedback
  const renderPronunciationFeedback = () => {
    if (!pronunciationFeedback) return null;

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });

    return (
      <Animated.View
        style={[
          styles.feedbackContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.feedbackTitle}>Your Pronunciation Assessment</Text>

        <View style={styles.accuracyContainer}>
          <Animated.View
            style={[
              styles.accuracyCircle,
              {
                transform: [
                  { scale: pulseAnim },
                  { rotate: rotate }
                ]
              }
            ]}
          >
            <Text style={styles.accuracyText}>{pronunciationFeedback.accuracy}%</Text>
          </Animated.View>
          <Text style={styles.accuracyLabel}>Accuracy Score</Text>
        </View>

        {pronunciationFeedback.correctSounds && pronunciationFeedback.correctSounds.length > 0 && (
          <View style={styles.feedbackSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-done-circle" size={20} color="#10b981" />
              <Text style={styles.feedbackSectionTitle}>Well Pronounced:</Text>
            </View>
            {pronunciationFeedback.correctSounds.map((sound, index) => (
              <View key={`correct-${index}`} style={styles.feedbackItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" style={styles.feedbackIcon} />
                <Text style={styles.feedbackText}>{sound}</Text>
              </View>
            ))}
          </View>
        )}

        {pronunciationFeedback.improvementNeeded && pronunciationFeedback.improvementNeeded.length > 0 && (
          <View style={styles.feedbackSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={20} color="#f59e0b" />
              <Text style={styles.feedbackSectionTitle}>Areas to Improve:</Text>
            </View>
            {pronunciationFeedback.improvementNeeded.map((sound, index) => (
              <View key={`improve-${index}`} style={styles.feedbackItem}>
                <Ionicons name="alert-circle" size={16} color="#f59e0b" style={styles.feedbackIcon} />
                <Text style={styles.feedbackText}>{sound}</Text>
              </View>
            ))}
          </View>
        )}

        {pronunciationFeedback.practiceExercises && pronunciationFeedback.practiceExercises.length > 0 && (
          <View style={styles.feedbackSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={20} color="#6366f1" />
              <Text style={styles.feedbackSectionTitle}>Practice Tips:</Text>
            </View>
            {pronunciationFeedback.practiceExercises.map((tip, index) => (
              <View key={`tip-${index}`} style={styles.feedbackItem}>
                <Ionicons name="bulb" size={16} color="#6366f1" style={styles.feedbackIcon} />
                <Text style={styles.feedbackText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {pronunciationFeedback.encouragement && (
          <View style={styles.encouragementContainer}>
            <Ionicons name="heart" size={20} color="#ec4899" style={styles.encouragementIcon} />
            <Text style={styles.encouragementText}>{pronunciationFeedback.encouragement}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.rerecordButton}
          onPress={() => {
            setPronunciationFeedback(null);
            setRecordingUri(null);
            Haptics.selectionAsync();
          }}
        >
          <Ionicons name="refresh" size={18} color="white" />
          <Text style={styles.rerecordButtonText}>Try Again</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render pronunciation history
  const renderHistoryItem = ({ item, index }) => {
    return (
      <Animated.View
        style={[
          styles.historyItem,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyWord}>{item.word}</Text>
          <View style={[
            styles.historyAccuracy,
            item.accuracy >= 80 ? styles.highAccuracy :
            item.accuracy >= 60 ? styles.mediumAccuracy :
            styles.lowAccuracy
          ]}>
            <Text style={styles.historyAccuracyText}>{item.accuracy}%</Text>
          </View>
        </View>
        <Text style={styles.historyDate}>
          {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
        <View style={styles.historyActions}>
          <TouchableOpacity
            style={styles.historyActionButton}
            onPress={() => Haptics.selectionAsync()}
          >
            <Ionicons name="play" size={16} color="#0ea5e9" />
            <Text style={styles.historyActionText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.historyActionButton}
            onPress={() => Haptics.selectionAsync()}
          >
            <Ionicons name="stats-chart" size={16} color="#0ea5e9" />
            <Text style={styles.historyActionText}>Details</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Render word meanings from API data
  const renderMeanings = () => {
    if (!wordData || !wordData.meanings) return null;

    return wordData.meanings.map((meaning, index) => (
      <Animated.View
        key={index}
        style={[
          styles.meaningContainer,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.meaningHeader}>
          <MaterialCommunityIcons name="alphabetical" size={20} color="#0ea5e9" />
          <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
        </View>
        {meaning.definitions.map((def, defIndex) => (
          <View key={defIndex} style={styles.definitionContainer}>
            <View style={styles.definitionHeader}>
              <MaterialIcons name="adjust" size={16} color="#0ea5e9" />
              <Text style={styles.definitionText}>{def.definition}</Text>
            </View>
            {def.example && (
              <View style={styles.exampleContainer}>
                <MaterialIcons name="format-quote" size={16} color="#94a3b8" />
                <Text style={styles.exampleText}>"{def.example}"</Text>
              </View>
            )}
          </View>
        ))}
      </Animated.View>
    ));
  };

  // Render pronunciation tips from our API
  const renderPronunciationTips = () => {
    if (!wordData || !wordData.pronunciationTips) return null;

    const tips = wordData.pronunciationTips;

    return (
      <Animated.View
        style={[
          styles.tipsContainer,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.tipsHeader}>
          <Ionicons name="volume-high" size={20} color="#0ea5e9" />
          <Text style={styles.tipsTitle}>Pronunciation Guide</Text>
        </View>

        {tips.phonetic && (
          <View style={styles.phoneticContainer}>
            <MaterialCommunityIcons name="alphabetical" size={20} color="#64748b" />
            <View style={styles.phoneticTextContainer}>
              <Text style={styles.phoneticLabel}>Phonetic Spelling:</Text>
              <Text style={styles.phoneticText}>{tips.phonetic}</Text>
            </View>
          </View>
        )}

        <View style={styles.tipsGrid}>
          {tips.syllables && (
            <View style={styles.tipCard}>
              <Ionicons name="pause" size={20} color="#0ea5e9" />
              <Text style={styles.tipCardLabel}>Syllables</Text>
              <Text style={styles.tipCardValue}>{tips.syllables}</Text>
            </View>
          )}

          {tips.stress && (
            <View style={styles.tipCard}>
              <MaterialCommunityIcons name="music-accent" size={20} color="#0ea5e9" />
              <Text style={styles.tipCardLabel}>Stress</Text>
              <Text style={styles.tipCardValue}>{tips.stress}</Text>
            </View>
          )}
        </View>

        {tips.soundGuide && tips.soundGuide.length > 0 && (
          <View style={styles.soundGuideContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="ear-hearing" size={20} color="#0ea5e9" />
              <Text style={styles.soundGuideTitle}>Sound Guide:</Text>
            </View>
            {tips.soundGuide.map((sound, index) => (
              <View key={index} style={styles.soundGuideItem}>
                <View style={styles.soundBadge}>
                  <Text style={styles.soundName}>{sound.sound}</Text>
                </View>
                <Text style={styles.soundHowTo}>{sound.howTo}</Text>
              </View>
            ))}
          </View>
        )}

        {tips.commonErrors && tips.commonErrors.length > 0 && (
          <View style={styles.commonErrorsContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="alert" size={20} color="#ef4444" />
              <Text style={styles.commonErrorsTitle}>Common Mistakes:</Text>
            </View>
            {tips.commonErrors.map((error, index) => (
              <View key={index} style={styles.errorItem}>
                <Ionicons name="alert-circle-outline" size={16} color="#ef4444" style={styles.errorIcon} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  // Render search results
  const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleSelectWordFromSearch(item)}
    >
      <Text style={styles.searchResultText}>{item}</Text>
      <Ionicons name="arrow-forward" size={18} color="#64748b" />
    </TouchableOpacity>
  );

  // Render the search bar component
  const renderSearchBar = () => (
    <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a word..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setShowSearchResults(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {showSearchResults && searchResults.length > 0 && (
        <Animated.View style={[styles.searchResultsContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResultItem}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            style={styles.searchResultsList}
          />
        </Animated.View>
      )}

      {showSearchResults && searchResults.length === 0 && (
        <Animated.View style={[styles.searchResultsContainer, { opacity: fadeAnim }]}>
          <Text style={styles.noResultsText}>No words found</Text>
        </Animated.View>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <Animated.View
        style={[
          styles.navbar,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => Haptics.selectionAsync()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>

        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>Language Learning</Text>
          <Text style={styles.navSubtitle}>{user?.firstName || 'Student'}</Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => Haptics.selectionAsync()}
        >
          <Ionicons name="settings-outline" size={24} color="#0f172a" />
        </TouchableOpacity>
      </Animated.View>

      {/* Tab Selector */}
      <Animated.View
        style={[
          styles.tabContainer,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'grammar' && styles.activeTab]}
          onPress={() => {
            setActiveTab('grammar');
            Haptics.selectionAsync();
          }}
        >
          <Ionicons
            name="book"
            size={20}
            color={activeTab === 'grammar' ? '#0ea5e9' : '#64748b'}
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === 'grammar' && styles.activeTabText]}>Grammar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pronunciation' && styles.activeTab]}
          onPress={() => {
            setActiveTab('pronunciation');
            Haptics.selectionAsync();
          }}
        >
          <Ionicons
            name="mic"
            size={20}
            color={activeTab === 'pronunciation' ? '#0ea5e9' : '#64748b'}
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === 'pronunciation' && styles.activeTabText]}>Pronunciation</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'grammar' ? (
          <>
            <Animated.View
              style={[
                styles.header,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.title}>Grammar Mastery</Text>
              <Text style={styles.subtitle}>Build your language foundation</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.categoriesContainer,
                { opacity: fadeAnim }
              ]}
            >
              <FlatList
                data={grammarCategories}
                renderItem={renderCategory}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.lessonsContainer,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="library" size={20} color="#0f172a" />
                <Text style={styles.sectionTitle}>{
                  grammarCategories.find(cat => cat.id === selectedCategory)?.title
                } Lessons</Text>
              </View>

              <FlatList
                data={grammarLessons[selectedCategory]}
                renderItem={renderLessonCard}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />

              <View style={styles.recommendedSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="sparkles" size={20} color="#0f172a" />
                  <Text style={styles.sectionTitle}>Recommended Practice</Text>
                </View>
                <TouchableOpacity
                  style={styles.practiceCard}
                  onPress={() => Haptics.selectionAsync()}
                >
                  <View style={styles.practiceCardHeader}>
                    <Ionicons name="trophy" size={24} color="#f59e0b" />
                    <Text style={styles.practiceTitle}>Daily Grammar Quiz</Text>
                  </View>
                  <Text style={styles.practiceDescription}>5 questions • 3 min</Text>
                  <View style={styles.practiceProgress}>
                    <Text style={styles.practiceProgressText}>Your streak: 3 days</Text>
                    <View style={styles.streakContainer}>
                      {[1, 2, 3].map((day) => (
                        <View key={day} style={styles.streakDay}>
                          <Ionicons name="flame" size={16} color="#f59e0b" />
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </>
        ) : (
          <>
            <Animated.View
              style={[
                styles.header,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.title}>Pronunciation Coach</Text>
              <Text style={styles.subtitle}>Perfect your speaking skills</Text>
            </Animated.View>

            {/* Search Bar */}
            {renderSearchBar()}

            <Animated.View
              style={[
                styles.wordsContainer,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="search" size={20} color="#0f172a" />
                <Text style={styles.sectionTitle}>Select a Word to Practice</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.wordsList}
              >
                {pronunciationExamples.map(renderWordItem)}
              </ScrollView>
            </Animated.View>

            {/* History Panel */}
            {pronunciationHistory.length > 0 && (
              <Animated.View
                style={[
                  styles.historyContainer,
                  { opacity: fadeAnim }
                ]}
              >
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={20} color="#0f172a" />
                  <Text style={styles.historyTitle}>Your Recent Practice</Text>
                </View>
                <FlatList
                  data={pronunciationHistory.slice(0, 3)} // Show only the 3 most recent
                  renderItem={renderHistoryItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                />
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => Haptics.selectionAsync()}
                >
                  <Text style={styles.viewMoreText}>View All History</Text>
                  <Ionicons name="chevron-forward" size={16} color="#0ea5e9" />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Word Detail Card */}
            {selectedWord ? (
              <Animated.View
                style={[
                  styles.detailCard,
                  { opacity: fadeAnim }
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="large" color="#0ea5e9" style={styles.loadingIndicator} />
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={24} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : pronunciationFeedback ? (
                  // Show feedback if available
                  renderPronunciationFeedback()
                ) : wordData ? (
                  <>
                    <View style={styles.wordHeader}>
                      <Text style={styles.detailWord}>{wordData.word}</Text>
                      <View style={styles.wordMeta}>
                        <Text style={styles.detailPhonetic}>
                          {wordData.phonetic || (wordData.phonetics && wordData.phonetics[0]?.text)}
                        </Text>
                        <View style={styles.wordDifficulty}>
                          <Ionicons
                            name={
                              selectedWord.difficulty === 'Easy' ? 'happy-outline' :
                              selectedWord.difficulty === 'Medium' ? 'alert-circle-outline' :
                              'flash-outline'
                            }
                            size={16}
                            color={
                              selectedWord.difficulty === 'Easy' ? '#16a34a' :
                              selectedWord.difficulty === 'Medium' ? '#d97706' :
                              '#dc2626'
                            }
                          />
                          <Text style={styles.wordDifficultyText}>{selectedWord.difficulty}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Audio Controls */}
                    {wordData.phonetics && wordData.phonetics.some(p => p.audio) && (
                      <View style={styles.audioControls}>
                        <TouchableOpacity
                          style={[styles.playButton, isPlaying && styles.playingButton]}
                          onPress={handlePlayAudio}
                          activeOpacity={0.8}
                          disabled={loading}
                        >
                          {loading ? (
                            <ActivityIndicator color="white" />
                          ) : (
                            <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="white" />
                          )}
                        </TouchableOpacity>
                        <View style={styles.audioInfo}>
                          <Text style={styles.playText}>{isPlaying ? "Playing..." : "Play Native Pronunciation"}</Text>
                          {isPlaying && (
                            <View style={styles.progressBar}>
                              <View style={styles.progressIndicator} />
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Recording Controls */}
                    {recordingUri && (
                      <View style={styles.recordingPreview}>
                        <Text style={styles.recordingPreviewText}>Your Recording</Text>
                        <TouchableOpacity
                          style={styles.playRecordingButton}
                          onPress={playRecordedAudio}
                        >
                          <Ionicons name="play-circle" size={24} color="#0ea5e9" />
                          <Text style={styles.playRecordingText}>Play</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Pronunciation Tips from our API */}
                    {renderPronunciationTips()}

                    {/* Word Meanings */}
                    {renderMeanings()}

                    {/* Recording Button */}
                    <Animated.View
                      style={[
                        styles.recordButtonContainer,
                        { transform: [{ scale: pulseAnim }] }
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.recordButton,
                          isRecording && styles.recordingActiveButton,
                          isSubmitting && styles.recordingDisabledButton
                        ]}
                        activeOpacity={0.8}
                        onPress={isRecording ? stopRecording : startRecording}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <ActivityIndicator color="white" size="small" />
                            <Text style={styles.recordButtonText}>Processing...</Text>
                          </>
                        ) : (
                          <>
                            <Ionicons
                              name={isRecording ? "stop" : "mic"}
                              size={22}
                              color="white"
                            />
                            <Text style={styles.recordButtonText}>
                              {isRecording ? "Stop Recording" : "Record Pronunciation"}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  </>
                ) : null}
              </Animated.View>
            ) : (
              <Animated.View
                style={[
                  styles.placeholderCard,
                  { opacity: fadeAnim }
                ]}
              >
                <View style={styles.placeholderIconContainer}>
                  <Ionicons name="mic-outline" size={60} color="#0ea5e9" />
                </View>
                <Text style={styles.placeholderText}>Select a word to practice pronunciation</Text>
                <Text style={styles.placeholderSubtext}>We'll guide you through proper pronunciation with audio examples and feedback</Text>
                <TouchableOpacity
                  style={styles.placeholderButton}
                  onPress={() => {
                    // Select a random word from filteredWords
                    const randomIndex = Math.floor(Math.random() * filteredWords.length);
                    const randomWord = filteredWords[randomIndex];
                    const difficulty = categorizeWordDifficulty(randomWord);
                    setSelectedWord({
                      id: randomWord,
                      word: randomWord,
                      difficulty
                    });
                    Haptics.selectionAsync();
                  }}
                >
                  <Ionicons name="shuffle" size={16} color="#0ea5e9" />
                  <Text style={styles.placeholderButtonText}>Suggest a Word</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navButton: {
    padding: 8,
  },
  navTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  navSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0ea5e9',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoriesContainer: {
    marginVertical: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryIcon: {
    marginRight: 6,
  },
  selectedCategory: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  lessonsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonCardContent: {
    marginBottom: 12,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  levelIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  beginnerLevel: {
    backgroundColor: '#dcfce7',
  },
  intermediateLevel: {
    backgroundColor: '#fef9c3',
  },
  advancedLevel: {
    backgroundColor: '#fee2e2',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0f172a',
  },
  lessonBody: {
    marginBottom: 16,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 20,
  },
  exampleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginLeft: 4,
    lineHeight: 20,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonLength: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0ea5e9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginRight: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
  },
  recommendedSection: {
    marginTop: 24,
  },
  practiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  practiceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  practiceDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  practiceProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  practiceProgressText: {
    fontSize: 12,
    color: '#64748b',
  },
  streakContainer: {
    flexDirection: 'row',
  },
  streakDay: {
    marginLeft: 4,
  },
  // Pronunciation tab styles
  wordsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  wordsList: {
    paddingVertical: 8,
  },
  wordCard: {
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedWordCard: {
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  gradientCard: {
    padding: 16,
    minWidth: 120,
    height: 80,
    justifyContent: 'space-between',
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  selectedWordText: {
    color: '#ffffff',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'flex-start',
  },
  easyBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  mediumBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  hardBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    marginLeft: 4,
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  wordHeader: {
    marginBottom: 16,
  },
  detailWord: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  wordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailPhonetic: {
    fontSize: 16,
    color: '#64748b',
  },
  wordDifficulty: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  wordDifficultyText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  playingButton: {
    backgroundColor: '#0284c7',
  },
  audioInfo: {
    flex: 1,
  },
  playText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    width: '30%',
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
  },
  recordButtonContainer: {
    marginTop: 16,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  recordingActiveButton: {
    backgroundColor: '#ef4444',
  },
  recordingDisabledButton: {
    backgroundColor: '#94a3b8',
  },
  recordButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  meaningContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  meaningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  partOfSpeech: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  definitionContainer: {
    marginBottom: 12,
  },
  definitionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  definitionText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
    lineHeight: 20,
  },
  exampleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginLeft: 24,
    marginTop: 8,
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginLeft: 4,
    lineHeight: 20,
  },
  placeholderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  placeholderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  placeholderButtonText: {
    color: '#0ea5e9',
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingIndicator: {
    marginVertical: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginLeft: 8,
  },
  // Pronunciation tips styles
  tipsContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  phoneticContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  phoneticTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  phoneticLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4,
  },
  phoneticText: {
    fontSize: 18,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  tipsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tipCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tipCardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 8,
  },
  tipCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 4,
  },
  soundGuideContainer: {
    marginTop: 12,
  },
  soundGuideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  soundGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
  },
  soundBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  soundHowTo: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
  },
  commonErrorsContainer: {
    marginTop: 12,
  },
  commonErrorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
  },
  // Feedback styles
  feedbackContainer: {
    padding: 16,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  accuracyContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  accuracyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  accuracyText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  accuracyLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  feedbackSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  feedbackIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
  },
  encouragementContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  encouragementIcon: {
    marginRight: 8,
  },
  encouragementText: {
    flex: 1,
    fontSize: 14,
    color: '#0369a1',
    fontStyle: 'italic',
  },
  rerecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  rerecordButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  // Recording preview
  recordingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recordingPreviewText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  playRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playRecordingText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '500',
    marginLeft: 8,
  },
  // History styles
  historyContainer: {
    padding: 16,
    backgroundColor: '#f8fafc',
    marginBottom: 16,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  historyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  historyAccuracy: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  highAccuracy: {
    backgroundColor: '#dcfce7',
  },
  mediumAccuracy: {
    backgroundColor: '#fef9c3',
  },
  lowAccuracy: {
    backgroundColor: '#fee2e2',
  },
  historyAccuracyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  historyActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  historyActionText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
    marginLeft: 8,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    justifyContent: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0ea5e9',
    marginRight: 4,
  },
  // Search bar styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#0f172a',
  },
  clearButton: {
    padding: 4,
  },
  searchResultsContainer: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchResultsList: {
    padding: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchResultText: {
    fontSize: 16,
    color: '#0f172a',
  },
  noResultsText: {
    padding: 16,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});
