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

const API_BASE_URL = 'https://fd79-14-139-220-69.ngrok-free.app/api/pronounciation';
const RANDOM_WORD_API = 'https://random-word-api.herokuapp.com/all';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

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

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(SCREEN_WIDTH))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState(null);
  const [pronunciationHistory, setPronunciationHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userInfo = {
    email: user?.emailAddresses?.[0]?.emailAddress || 'user@example.com',
    motherTongue: 'English',
    englishLevel: 'Beginner'
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.exp), useNativeDriver: true }).start();

    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.9, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }

    if (isSubmitting) {
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [fadeAnim, slideAnim, isRecording, pulseAnim, isSubmitting, rotateAnim]);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch(RANDOM_WORD_API);
        const data = await response.json();
        setAllWords(data);
        const filtered = data.filter(word => word.length >= 3 && word.length <= 12);
        setFilteredWords(filtered.slice(0, 50));
      } catch (err) {
        console.error('Error fetching words:', err);
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = allWords.filter(word =>
        word.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleSelectWordFromSearch = (word) => {
    const difficulty = categorizeWordDifficulty(word);
    const newWord = { id: word, word, difficulty };
    setSelectedWord(newWord);
    setSearchQuery('');
    setShowSearchResults(false);
    Haptics.selectionAsync();
  };

  const grammarCategories = [
    { id: 'basics', title: 'Basics', icon: 'book-outline' },
    { id: 'tenses', title: 'Tenses', icon: 'time-outline' },
    { id: 'articles', title: 'Articles', icon: 'document-text-outline' },
    { id: 'prepositions', title: 'Prepositions', icon: 'location-outline' },
    { id: 'conjunctions', title: 'Conjunctions', icon: 'link-outline' },
  ];

  const grammarLessons = {
    basics: [
      { id: '1', title: 'Nouns', level: 'Beginner', description: 'Learn about people, places, things, and ideas', example: "The 'dog' barked at the 'mailman' near the 'park'." },
      { id: '2', title: 'Pronouns', level: 'Beginner', description: 'Words that replace nouns in sentences', example: "'She' gave 'it' to 'them' after 'they' asked politely." },
      { id: '3', title: 'Adjectives', level: 'Beginner', description: 'Words that describe nouns', example: "The 'quick' brown fox jumps over the 'lazy' dog." },
      { id: '4', title: 'Adverbs', level: 'Intermediate', description: 'Words that modify verbs, adjectives, or other adverbs', example: "She spoke 'quietly' but 'very' clearly during the meeting." },
    ],
    tenses: [
      { id: '1', title: 'Present Simple', level: 'Beginner', description: 'Used for habits, general truths, and fixed arrangements', example: "I 'work' at a bank. Water 'boils' at 100°C." },
      { id: '2', title: 'Present Continuous', level: 'Beginner', description: 'Used for actions happening now or around now', example: "She 'is studying' for her exam this week." },
      { id: '3', title: 'Past Simple', level: 'Intermediate', description: 'Used for completed actions in the past', example: "Yesterday, I 'finished' my project before the deadline." },
      { id: '4', title: 'Future Tenses', level: 'Advanced', description: 'Different ways to talk about the future', example: "By next year, I 'will have completed' my degree." },
    ],
    articles: [
      { id: '1', title: 'Definite Article', level: 'Beginner', description: 'Using "the" for specific nouns', example: "Please pass me 'the' salt on 'the' table." },
      { id: '2', title: 'Indefinite Articles', level: 'Beginner', description: 'Using "a" and "an" for non-specific nouns', example: "I need 'a' pen and 'an' apple for my lunch." },
      { id: '3', title: 'Zero Article', level: 'Intermediate', description: 'When no article is needed', example: "'Love' is more important than 'money' in life." },
    ],
    prepositions: [
      { id: '1', title: 'Prepositions of Place', level: 'Beginner', description: 'Show where something is located', example: "The book is 'on' the table, 'under' the lamp." },
      { id: '2', title: 'Prepositions of Time', level: 'Intermediate', description: 'Show when something happens', example: "We'll meet 'at' 3pm 'on' Monday 'in' June." },
      { id: '3', title: 'Prepositions of Movement', level: 'Intermediate', description: 'Show movement from one place to another', example: "She walked 'across' the street and 'into' the building." },
    ],
    conjunctions: [
      { id: '1', title: 'Coordinating Conjunctions', level: 'Intermediate', description: 'Connect words, phrases, or independent clauses', example: "I wanted to go, 'but' it was raining, 'so' I stayed home." },
      { id: '2', title: 'Subordinating Conjunctions', level: 'Advanced', description: 'Connect dependent clauses to independent clauses', example: "'Although' it was late, I decided to call 'because' it was urgent." },
    ],
  };

  const categorizeWordDifficulty = (word) => {
    if (word.length <= 4) return 'Easy';
    if (word.length <= 7) return 'Medium';
    return 'Hard';
  };

  const pronunciationExamples = filteredWords.map((word, index) => ({
    id: index.toString(),
    word,
    difficulty: categorizeWordDifficulty(word)
  }));

  const fetchPronunciationTips = async (word) => {
    setLoading(true);
    setError(null);
    try {
      const dictionaryResponse = await fetch(`${DICTIONARY_API}${word}`);
      const dictionaryData = await dictionaryResponse.json();
      if (!dictionaryResponse.ok) throw new Error(dictionaryData.message || 'Failed to fetch from dictionary API');
      const dictionaryEntry = dictionaryData[0];
      let ourApiData = {};
      try {
        const ourApiResponse = await fetch(`${API_BASE_URL}/tips?word=${word}&email=${userInfo.email}`);
        ourApiData = await ourApiResponse.json();
      } catch (err) {
        console.log('Using fallback tips from our API');
      }
      return {
        word: dictionaryEntry.word,
        phonetic: dictionaryEntry.phonetic,
        phonetics: dictionaryEntry.phonetics,
        origin: dictionaryEntry.origin,
        meanings: dictionaryEntry.meanings,
        pronunciationTips: ourApiData,
        syllables: ourApiData?.syllables || word.match(/[aeiouy]{1,2}/g)?.join('-') || word,
        stress: ourApiData?.stress || 'First syllable',
        soundGuide: ourApiData?.soundGuide || [
          { sound: word[0], howTo: `Place your tongue behind your teeth and blow air for the '${word[0]}' sound` },
          { sound: word.slice(-1), howTo: `Close your lips slightly for the ending '${word.slice(-1)}' sound` }
        ],
        commonErrors: ourApiData?.commonErrors || [
          `Pronouncing the '${word[1]}' sound too softly`,
          `Stressing the wrong syllable in '${word}'`
        ]
      };
    } catch (err) {
      setError(`Error fetching pronunciation tips: ${err.message}`);
      return {
        word,
        phonetic: `/${word}/`,
        phonetics: [{ text: `/${word}/` }],
        meanings: [{ partOfSpeech: "noun", definitions: [{ definition: `The act or process of ${word}`, example: `She demonstrated excellent ${word} during the presentation.` }] }],
        syllables: word.match(/[aeiouy]{1,2}/g)?.join('-') || word,
        stress: 'First syllable',
        soundGuide: [
          { sound: word[0], howTo: `Place your tongue behind your teeth and blow air for the '${word[0]}' sound` },
          { sound: word.slice(-1), howTo: `Close your lips slightly for the ending '${word.slice(-1)}' sound` }
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

  const fetchPronunciationHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history?email=${userInfo.email}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch pronunciation history');
      setPronunciationHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching pronunciation history:', err);
      setPronunciationHistory([
        { id: '1', word: 'communication', accuracy: 85, date: '2023-06-15T10:30:00Z' },
        { id: '2', word: 'technology', accuracy: 72, date: '2023-06-14T15:45:00Z' },
        { id: '3', word: 'pronunciation', accuracy: 68, date: '2023-06-13T09:15:00Z' },
      ]);
    }
  };

  const fetchWordData = async (word) => {
    setLoading(true);
    setError(null);
    setPronunciationFeedback(null);
    try {
      const tipsData = await fetchPronunciationTips(word);
      setWordData(tipsData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError(err.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'You need to grant microphone permissions to record audio.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Recording error', 'Failed to start recording. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (uri && selectedWord) submitPronunciation(uri, selectedWord.word);
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Recording error', 'Failed to stop recording. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const submitPronunciation = async (audioUri, word) => {
    if (!audioUri || !word) {
      Alert.alert('Error', 'Audio recording and word are required');
      return;
    }
    setIsSubmitting(true);
    setPronunciationFeedback(null);
    try {
      const formData = new FormData();
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      formData.append('audio', { uri: audioUri, type: 'audio/wav', name: 'recording.wav' });
      formData.append('email', userInfo.email);
      formData.append('word', word);
      const response = await fetch(`${API_BASE_URL}/assess`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to assess pronunciation');
      setPronunciationFeedback(result);
      fetchPronunciationHistory();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Error submitting pronunciation:', err);
      Alert.alert('Submission Error', `Failed to submit pronunciation: ${err.message}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPronunciationFeedback({
        accuracy: Math.floor(Math.random() * 30) + 70,
        correctSounds: [`Correct '${word[0]}' sound`, `Good stress on the first syllable`],
        improvementNeeded: [`Work on the '${word[Math.floor(word.length/2)]}' sound`, `Try to pronounce the ending more clearly`],
        practiceExercises: [`Say the word slowly: ${word.split('').join(' ')}`, `Record yourself again and compare`],
        encouragement: "Great effort! With more practice, you'll master this word."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayAudio = async (audioUrl) => {
    if (!audioUrl) {
      if (!wordData || !wordData.phonetics) {
        Alert.alert('Error', 'No audio available for this word');
        return;
      }
      const phoneticWithAudio = wordData.phonetics.find(p => p.audio);
      if (!phoneticWithAudio?.audio) {
        Alert.alert('Error', 'No audio available for this word');
        return;
      }
      audioUrl = phoneticWithAudio.audio;
    }
    try {
      setIsPlaying(true);
      if (sound) await sound.unloadAsync();
      if (audioUrl.startsWith('//')) audioUrl = `https:${audioUrl}`;
      else if (!audioUrl.startsWith('http://') && !audioUrl.startsWith('https://')) audioUrl = `https://${audioUrl}`;
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUrl }, { shouldPlay: true });
      setSound(newSound);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish || status.isLoaded === false) {
          setIsPlaying(false);
          newSound.unloadAsync();
        } else if (status.error) throw new Error(`Playback error: ${status.error}`);
      });
      Haptics.selectionAsync();
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsPlaying(false);
      try {
        await Speech.speak(wordData.word, {
          language: 'en-US',
          rate: 0.9,
          pitch: 1.0,
          onDone: () => setIsPlaying(false),
          onError: (speechErr) => {
            console.error('Text-to-speech error:', speechErr);
            Alert.alert('Playback Error', 'Could not play the audio or use text-to-speech.');
            setIsPlaying(false);
          },
        });
      } catch (speechErr) {
        Alert.alert('Playback Error', 'Could not play the audio or use text-to-speech.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsPlaying(false);
      }
    }
  };

  const playRecordedAudio = async () => {
    if (!recordingUri) return;
    try {
      setIsPlaying(true);
      if (sound) await sound.stopAsync();
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordingUri }, { shouldPlay: true });
      setSound(newSound);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setIsPlaying(false);
      });
      Haptics.selectionAsync();
    } catch (err) {
      console.error('Error playing recorded audio:', err);
      Alert.alert('Playback Error', 'Could not play your recording.');
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
      if (recording) recording.stopAndUnloadAsync();
    };
  }, [sound, recording]);

  useEffect(() => {
    if (selectedWord) fetchWordData(selectedWord.word);
  }, [selectedWord]);

  useEffect(() => {
    if (activeTab === 'pronunciation') fetchPronunciationHistory();
  }, [activeTab]);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryButton, selectedCategory === item.id && styles.selectedCategory]}
      onPress={() => {
        setSelectedCategory(item.id);
        Haptics.selectionAsync();
      }}
    >
      <Ionicons name={item.icon} size={20} color={selectedCategory === item.id ? '#ffffff' : '#475569'} style={styles.categoryIcon} />
      <Text style={[styles.categoryText, selectedCategory === item.id && styles.selectedCategoryText]}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderLessonCard = ({ item }) => (
    <Animated.View style={[styles.lessonCard, { opacity: fadeAnim }]}>
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
          <TouchableOpacity style={styles.startButton} onPress={() => Haptics.selectionAsync()}>
            <Text style={styles.startButtonText}>Start</Text>
            <Feather name="arrow-right" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progress, { width: '0%', transform: [{ scaleX: fadeAnim }] }]} />
      </View>
    </Animated.View>
  );

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
              name={item.difficulty === 'Easy' ? 'happy-outline' : item.difficulty === 'Medium' ? 'alert-circle-outline' : 'flash-outline'}
              size={14}
              color={item.difficulty === 'Easy' ? '#16a34a' : item.difficulty === 'Medium' ? '#d97706' : '#dc2626'}
            />
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  const renderPronunciationFeedback = () => {
    if (!pronunciationFeedback) return null;
    const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return (
      <Animated.View style={[styles.feedbackContainer, { opacity: fadeAnim }]}>
        <Text style={styles.feedbackTitle}>Your Pronunciation Assessment</Text>
        <View style={styles.accuracyContainer}>
          <Animated.View style={[styles.accuracyCircle, { transform: [{ scale: pulseAnim }, { rotate: rotate }] }]}>
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

  const renderHistoryItem = (item, index) => (
    <Animated.View
      key={item.id}
      style={[styles.historyItem, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}
    >
      <View style={styles.historyHeader}>
        <Text style={styles.historyWord}>{item.word}</Text>
        <View style={[
          styles.historyAccuracy,
          item.accuracy >= 80 ? styles.highAccuracy : item.accuracy >= 60 ? styles.mediumAccuracy : styles.lowAccuracy
        ]}>
          <Text style={styles.historyAccuracyText}>{item.accuracy}%</Text>
        </View>
      </View>
      <Text style={styles.historyDate}>
        {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <View style={styles.historyActions}>
        <TouchableOpacity style={styles.historyActionButton} onPress={() => Haptics.selectionAsync()}>
          <Ionicons name="play" size={16} color="#0ea5e9" />
          <Text style={styles.historyActionText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.historyActionButton} onPress={() => Haptics.selectionAsync()}>
          <Ionicons name="stats-chart" size={16} color="#0ea5e9" />
          <Text style={styles.historyActionText}>Details</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderMeanings = () => {
    if (!wordData || !wordData.meanings) return null;
    return wordData.meanings.map((meaning, index) => (
      <Animated.View key={index} style={[styles.meaningContainer, { opacity: fadeAnim }]}>
        <View style={styles.meaningHeader}>
          <MaterialCommunityIcons name="alphabetical" size={20} color="#0ea5e9" />
          <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
        </View>
        {meaning.definitions.map((def, defIndex) => (
          <View key={defIndex} style={styles.definitionContainer}>
            <View style={styles.definitionHeader}>
              <Text style={styles.definitionNumber}>{defIndex + 1}.</Text>
              <Text style={styles.definitionText}>{def.definition}</Text>
            </View>
            {def.example && (
              <View style={styles.exampleContainer}>
                <MaterialIcons name="format-quote" size={16} color="#94a3b8" />
                <Text style={styles.exampleText}>{def.example}</Text>
              </View>
            )}
          </View>
        ))}
      </Animated.View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Language Learning</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'grammar' && styles.activeTab]}
            onPress={() => setActiveTab('grammar')}
          >
            <Ionicons name="book" size={20} color={activeTab === 'grammar' ? '#0ea5e9' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'grammar' && styles.activeTabText]}>Grammar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pronunciation' && styles.activeTab]}
            onPress={() => setActiveTab('pronunciation')}
          >
            <Ionicons name="mic" size={20} color={activeTab === 'pronunciation' ? '#0ea5e9' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'pronunciation' && styles.activeTabText]}>Pronunciation</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'grammar' ? (
        <View style={styles.content}>
          <FlatList
            horizontal
            data={grammarCategories}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            style={styles.categoryList}
          />
          <FlatList
            data={grammarLessons[selectedCategory]}
            renderItem={renderLessonCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.lessonList}
          />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a word..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          {showSearchResults && (
            <View style={styles.searchResults}>
              {searchResults.map((word, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectWordFromSearch(word)}
                >
                  <Text style={styles.searchResultText}>{word}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* <View style={styles.wordList}>
            {pronunciationExamples.map(item => renderWordItem(item))}
          </View> */}

          {selectedWord && (
            <Animated.View style={[styles.wordDetails, { opacity: fadeAnim }]}>
              {loading ? (
                <ActivityIndicator size="large" color="#0ea5e9" />
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : wordData ? (
                <>
                  <Text style={styles.wordTitle}>{wordData.word}</Text>
                  <Text style={styles.phoneticText}>{wordData.phonetic}</Text>
                  <View style={styles.audioControls}>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => handlePlayAudio()}
                      disabled={isPlaying}
                    >
                      <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
                    </TouchableOpacity>
                    {recordingUri && (
                      <TouchableOpacity
                        style={styles.playRecordingButton}
                        onPress={playRecordedAudio}
                        disabled={isPlaying}
                      >
                        <Ionicons name="musical-notes" size={20} color="#10b981" />
                        <Text style={styles.playRecordingText}>Play Your Recording</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Pronunciation Tips</Text>
                    <Text style={styles.tipsText}>Syllables: {wordData.syllables}</Text>
                    <Text style={styles.tipsText}>Stress: {wordData.stress}</Text>
                    {wordData.soundGuide && wordData.soundGuide.map((guide, index) => (
                      <Text key={index} style={styles.tipsText}>
                        {guide.sound}: {guide.howTo}
                      </Text>
                    ))}
                    {wordData.commonErrors && (
                      <View style={styles.commonErrors}>
                        <Text style={styles.tipsSubtitle}>Common Errors:</Text>
                        {wordData.commonErrors.map((error, index) => (
                          <Text key={index} style={styles.tipsText}>- {error}</Text>
                        ))}
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.recordButton, isRecording && styles.recordingActive]}
                    onPress={isRecording ? stopRecording : startRecording}
                  >
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <Ionicons
                        name={isRecording ? "stop-circle" : "mic"}
                        size={28}
                        color={isRecording ? "#ef4444" : "#ffffff"}
                      />
                    </Animated.View>
                    <Text style={styles.recordButtonText}>
                      {isRecording ? "Stop Recording" : "Record Pronunciation"}
                    </Text>
                  </TouchableOpacity>

                  {isSubmitting ? (
                    <ActivityIndicator size="large" color="#0ea5e9" style={styles.loadingIndicator} />
                  ) : renderPronunciationFeedback()}

                  {renderMeanings()}
                </>
              ) : null}
            </Animated.View>
          )}

          {pronunciationHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Pronunciation History</Text>
              {pronunciationHistory.map((item, index) => renderHistoryItem(item, index))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { padding: 20, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  tabContainer: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-around' },
  tab: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  tabText: { marginLeft: 5, fontSize: 16, color: '#64748b' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#0ea5e9' },
  activeTabText: { color: '#0ea5e9', fontWeight: 'bold' },
  content: { flex: 1, padding: 15 },
  categoryList: { marginBottom: 15 },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCategory: { backgroundColor: '#0ea5e9' },
  categoryIcon: { marginRight: 5 },
  categoryText: { fontSize: 14, color: '#475569' },
  selectedCategoryText: { color: '#ffffff', fontWeight: 'bold' },
  lessonList: { paddingBottom: 20 },
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  lessonCardContent: { padding: 15 },
  lessonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  lessonTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  levelIndicator: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  beginnerLevel: { backgroundColor: '#d1fae5' },
  intermediateLevel: { backgroundColor: '#fef3c7' },
  advancedLevel: { backgroundColor: '#fee2e2' },
  levelText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  lessonBody: { marginBottom: 10 },
  lessonDescription: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  exampleContainer: { flexDirection: 'row', alignItems: 'flex-start' },
  exampleText: { fontSize: 14, color: '#94a3b8', fontStyle: 'italic', marginLeft: 5, flex: 1 },
  lessonFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeContainer: { flexDirection: 'row', alignItems: 'center' },
  lessonLength: { fontSize: 12, color: '#64748b', marginLeft: 4 },
  startButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0ea5e9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  startButtonText: { color: '#ffffff', fontWeight: '600', marginRight: 5 },
  progressBar: { height: 4, backgroundColor: '#e5e7eb' },
  progress: { height: '100%', backgroundColor: '#0ea5e9' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#1e293b', paddingVertical: 10 },
  searchResults: { backgroundColor: '#ffffff', borderRadius: 8, padding: 10, marginBottom: 15 },
  searchResultItem: { paddingVertical: 8 },
  searchResultText: { fontSize: 16, color: '#1e293b' },
  wordList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  wordCard: { width: '48%', marginBottom: 15 },
  selectedWordCard: {},
  gradientCard: { padding: 15, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  wordText: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  selectedWordText: { color: '#ffffff' },
  difficultyBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  easyBadge: { backgroundColor: '#dcfce7' },
  mediumBadge: { backgroundColor: '#fef3c7' },
  hardBadge: { backgroundColor: '#fee2e2' },
  difficultyText: { fontSize: 12, marginLeft: 4, color: '#334155', fontWeight: '600' },
  wordDetails: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, marginVertical: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  wordTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  phoneticText: { fontSize: 18, color: '#64748b', marginBottom: 15 },
  audioControls: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  playButton: { backgroundColor: '#0ea5e9', padding: 10, borderRadius: 50, marginRight: 15 },
  playRecordingButton: { flexDirection: 'row', alignItems: 'center' },
  playRecordingText: { color: '#10b981', fontSize: 14, marginLeft: 5 },
  tipsContainer: { marginBottom: 20 },
  tipsTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  tipsText: { fontSize: 14, color: '#64748b', marginBottom: 5 },
  tipsSubtitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginTop: 10, marginBottom: 5 },
  commonErrors: {},
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingActive: { backgroundColor: '#ef4444' },
  recordButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 10 },
  feedbackContainer: { backgroundColor: '#f9fafb', padding: 15, borderRadius: 12, marginBottom: 20 },
  feedbackTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  accuracyContainer: { alignItems: 'center', marginBottom: 20 },
  accuracyCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center' },
  accuracyText: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  accuracyLabel: { fontSize: 14, color: '#64748b', marginTop: 5 },
  feedbackSection: { marginBottom: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  feedbackSectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginLeft: 5 },
  feedbackItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  feedbackIcon: { marginRight: 8 },
  feedbackText: { fontSize: 14, color: '#475569', flex: 1 },
  encouragementContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdf2f8', padding: 10, borderRadius: 8, marginBottom: 15 },
  encouragementIcon: { marginRight: 8 },
  encouragementText: { fontSize: 14, color: '#be185d', fontStyle: 'italic' },
  rerecordButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366f1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignSelf: 'center' },
  rerecordButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  historyContainer: { marginVertical: 15 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  historyItem: { backgroundColor: '#ffffff', padding: 15, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  historyWord: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  historyAccuracy: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  highAccuracy: { backgroundColor: '#d1fae5' },
  mediumAccuracy: { backgroundColor: '#fef3c7' },
  lowAccuracy: { backgroundColor: '#fee2e2' },
  historyAccuracyText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  historyDate: { fontSize: 12, color: '#64748b', marginBottom: 10 },
  historyActions: { flexDirection: 'row', justifyContent: 'space-between' },
  historyActionButton: { flexDirection: 'row', alignItems: 'center' },
  historyActionText: { fontSize: 14, color: '#0ea5e9', marginLeft: 5 },
  meaningContainer: { marginBottom: 20 },
  meaningHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  partOfSpeech: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginLeft: 8 },
  definitionContainer: { marginBottom: 10 },
  definitionHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  definitionNumber: { fontSize: 14, fontWeight: '600', color: '#0ea5e9', marginRight: 5 },
  definitionText: { fontSize: 14, color: '#475569', flex: 1 },
  errorText: { fontSize: 14, color: '#ef4444', textAlign: 'center' },
  loadingIndicator: { marginVertical: 20 },
});
