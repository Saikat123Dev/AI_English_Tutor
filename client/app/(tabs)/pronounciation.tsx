import { useUser } from '@clerk/clerk-expo';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = 'https://ai-english-tutor-9ixt.onrender.com/api/pronounciation';
const RANDOM_WORD_API = 'https://random-word-api.herokuapp.com/word?number=50';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PronunciationPracticeScreen() {
  const { user } = useUser();
  const [selectedWord, setSelectedWord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sound, setSound] = useState(null);
  const [allWords, setAllWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [dictionaryData, setDictionaryData] = useState(null);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(SCREEN_WIDTH))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];
  const scrollViewRef = useRef();

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState(null);
  const [pronunciationHistory, setPronunciationHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userInfo = {
    email: user?.emailAddresses?.[0]?.emailAddress || 'user@example.com',
    motherTongue: user?.unsafeMetadata?.motherTongue ?? 'Not provided',
    englishLevel: user?.unsafeMetadata?.englishLevel ?? 'Not provided',
  };

  useEffect(() => {
    if (!userInfo.motherTongue || userInfo.motherTongue === 'Not provided' ||
        !userInfo.englishLevel || userInfo.englishLevel === 'Not provided') {
      Alert.alert(
        'Profile Information Required',
        'Please complete your profile settings before using the pronunciation practice feature.',
        [
          {
            text: 'Go to Settings',
            onPress: () => router.push('/settings'),
          },
          {
            text: 'Continue Anyway',
            style: 'cancel'
          }
        ]
      );
    }
  }, [userInfo.motherTongue, userInfo.englishLevel]);

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
        if (!response.ok) throw new Error('Failed to fetch random words');
        const data = await response.json();
        setAllWords(data);
      } catch (err) {
        console.error('Error fetching words:', err);
        // Fallback words if API fails
        setAllWords([
          'hello', 'world', 'language', 'practice', 'pronunciation',
          'communication', 'education', 'technology', 'innovation', 'creativity',
          'success', 'motivation', 'inspiration', 'knowledge', 'wisdom',
          'experience', 'opportunity', 'challenge', 'solution', 'progress',
          'development', 'achievement', 'happiness', 'gratitude', 'kindness'
        ]);
      }
    };
    fetchWords();
    fetchPronunciationHistory();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      try {
        // First check if word exists in dictionary API
        const dictionaryResponse = await fetch(`${DICTIONARY_API}${query}`);

        if (dictionaryResponse.ok) {
          const data = await dictionaryResponse.json();
          if (data && data.length > 0) {
            setSearchResults([query]); // If found in dictionary, show it as the result
          } else {
            // If not found in dictionary, filter from our list
            const results = allWords.filter(word =>
              word.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 10);
            setSearchResults(results);
          }
        } else {
          // Dictionary API failed, fallback to local filtering
          const results = allWords.filter(word =>
            word.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 10);
          setSearchResults(results);
        }

        setShowSearchResults(true);
      } catch (err) {
        console.error('Search error:', err);
        // Fallback to local filtering if API fails
        const results = allWords.filter(word =>
          word.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);
        setSearchResults(results);
        setShowSearchResults(true);
      }
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

    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollTo({ y: 300, animated: true });
      }, 300);
    }
  };

  const categorizeWordDifficulty = (word) => {
    if (word.length <= 4) return 'Easy';
    if (word.length <= 7) return 'Medium';
    return 'Hard';
  };

  const pronunciationExamples = allWords.slice(0, 20).map((word, index) => ({
    id: index.toString(),
    word,
    difficulty: categorizeWordDifficulty(word)
  }));

  const fetchDictionaryData = async (word) => {
    try {
      const response = await fetch(`${DICTIONARY_API}${word}`);
      if (!response.ok) throw new Error('Word not found in dictionary');

      const data = await response.json();
      if (!data || !data.length) throw new Error('No data returned from dictionary');

      setDictionaryData(data[0]);
      return data[0];
    } catch (err) {
      console.error('Error fetching dictionary data:', err);
      setError('Could not fetch dictionary data. Please try another word.');
      return null;
    }
  };

  const fetchPronunciationTips = async (word) => {
    setLoading(true);
    setError(null);
    try {
      // First fetch dictionary data
      const dictionaryEntry = await fetchDictionaryData(word);
      if (!dictionaryEntry) {
        throw new Error('Word not found in dictionary');
      }

      // Then try to get additional pronunciation tips from our API
      let ourApiData = {};
      try {
        const ourApiResponse = await fetch(`${API_BASE_URL}/tips?word=${word}&email=${userInfo.email}`);
        if (ourApiResponse.ok) {
          ourApiData = await ourApiResponse.json();
        }
      } catch (err) {
        console.log('Using fallback tips, our API unavailable');
      }

      // Combine data from both sources
      return {
        word: dictionaryEntry.word,
        phonetic: dictionaryEntry.phonetic || `/${word}/`,
        phonetics: dictionaryEntry.phonetics || [{ text: `/${word}/` }],
        meanings: dictionaryEntry.meanings || [{
          partOfSpeech: "noun",
          definitions: [{
            definition: `The act or process of ${word}`,
            example: `She demonstrated excellent ${word} during the presentation.`
          }]
        }],
        pronunciationTips: ourApiData,
        syllables: ourApiData?.syllables || word.match(/[aeiouy]{1,2}/gi)?.join('-') || word,
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
      console.error('Error fetching pronunciation tips:', err);
      throw err;
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
      // Fallback data if API fails
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
      setError(err.message || 'Failed to fetch word data');
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
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });

      // Stop any playing audio before recording
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
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
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (uri && selectedWord) {
        submitPronunciation(uri, selectedWord.word);
      }
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
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav'
      });
      formData.append('email', userInfo.email);
      formData.append('word', word);

      const response = await fetch(`${API_BASE_URL}/assess`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        // If server responds with error, throw it
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assess pronunciation');
      }

      const result = await response.json();
      setPronunciationFeedback(result);
      fetchPronunciationHistory();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Scroll to feedback
      if (scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }, 300);
      }
    } catch (err) {
      console.error('Error submitting pronunciation:', err);

      // Show error to user
      Alert.alert('Submission Error', 'Failed to submit pronunciation. Using simulated feedback.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Generate fallback feedback
      const accuracy = Math.floor(Math.random() * 30) + 70;

      // Customize feedback based on accuracy
      let correctSounds = [];
      let improvementNeeded = [];

      if (accuracy > 85) {
        correctSounds = [
          `Excellent '${word[0]}' sound at the beginning`,
          `Great stress pattern throughout the word`,
          `Clear pronunciation of the ending sound`
        ];
        improvementNeeded = [
          `Try to smooth the transition between syllables`
        ];
      } else if (accuracy > 75) {
        correctSounds = [
          `Good '${word[0]}' sound at the beginning`,
          `Clear pronunciation of most sounds`
        ];
        improvementNeeded = [
          `Work on the '${word[Math.floor(word.length/2)]}' sound in the middle`,
          `Pay more attention to the word stress`
        ];
      } else {
        correctSounds = [
          `Good attempt at the overall word shape`
        ];
        improvementNeeded = [
          `Focus on the '${word[0]}' sound at the beginning`,
          `Work on the '${word[Math.floor(word.length/2)]}' sound in the middle`,
          `Practice the ending sound more carefully`
        ];
      }

      setPronunciationFeedback({
        accuracy,
        correctSounds,
        improvementNeeded,
        practiceExercises: [
          `Say the word slowly: ${word.split('').join(' ')}`,
          `Focus on each syllable separately: ${word.match(/[aeiouy]{1,2}/gi)?.join(' - ') || word}`,
          `Record yourself again and compare with the reference audio`
        ],
        encouragement: accuracy > 80
          ? "Excellent work! You're very close to mastering this word."
          : accuracy > 70
            ? "Good effort! With some targeted practice, you'll improve quickly."
            : "Keep practicing! Focus on the specific sounds that need improvement."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!wordData || !wordData.phonetics) {
      Alert.alert('Error', 'No audio available for this word');
      return;
    }

    // Find phonetic entry with audio
    const phoneticWithAudio = wordData.phonetics.find(p => p.audio && p.audio.trim() !== '');

    if (!phoneticWithAudio?.audio) {
      // If no audio in the dictionary data, use text-to-speech
      try {
        setIsPlaying(true);
        await Speech.speak(wordData.word, {
          language: 'en-US',
          rate: 0.9,
          pitch: 1.0,
          onDone: () => setIsPlaying(false),
          onStopped: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
        Haptics.selectionAsync();
        return;
      } catch (speechErr) {
        console.error('Text-to-speech error:', speechErr);
        Alert.alert('Playback Error', 'Could not play the audio or use text-to-speech.');
        setIsPlaying(false);
        return;
      }
    }

    try {
      setIsPlaying(true);
      if (sound) {
        await sound.unloadAsync();
      }

      // Fix URL if needed
      let audioUrl = phoneticWithAudio.audio;
      if (audioUrl.startsWith('//')) {
        audioUrl = `https:${audioUrl}`;
      } else if (!audioUrl.startsWith('http')) {
        audioUrl = `https://${audioUrl}`;
      }

      console.log('Playing audio from URL:', audioUrl);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish || !status.isLoaded) {
          setIsPlaying(false);
          newSound.unloadAsync();
        }
      });

      Haptics.selectionAsync();
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsPlaying(false);

      // Fallback to text-to-speech if audio playback fails
      try {
        await Speech.speak(wordData.word, {
          language: 'en-US',
          rate: 0.9,
          pitch: 1.0,
          onDone: () => setIsPlaying(false),
          onStopped: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      } catch (speechErr) {
        console.error('Text-to-speech error:', speechErr);
        Alert.alert('Playback Error', 'Could not play the audio or use text-to-speech.');
        setIsPlaying(false);
      }
    }
  };

  const playRecordedAudio = async () => {
    if (!recordingUri) return;
    try {
      setIsPlaying(true);
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
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
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      Speech.stop();
    };
  }, [sound, recording]);

  useEffect(() => {
    if (selectedWord) {
      fetchWordData(selectedWord.word);
    }
  }, [selectedWord]);

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
          if (scrollViewRef.current) {
            setTimeout(() => {
              scrollViewRef.current.scrollTo({ y: 300, animated: true });
            }, 300);
          }
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
              name={item.difficulty === 'Easy' ? 'happy-outline' :
                    item.difficulty === 'Medium' ? 'alert-circle-outline' : 'flash-outline'}
              size={14}
              color={item.difficulty === 'Easy' ? '#16a34a' :
                     item.difficulty === 'Medium' ? '#d97706' : '#dc2626'}
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
          <Animated.View style={[styles.accuracyCircle, {
            transform: [{ scale: pulseAnim }],
            backgroundColor: pronunciationFeedback.accuracy >= 80 ? '#10b981' :
                           pronunciationFeedback.accuracy >= 60 ? '#f59e0b' : '#ef4444'
          }]}>
            <Text style={styles.accuracyText}>{pronunciationFeedback.accuracy}%</Text>
          </Animated.View>
          <Text style={styles.accuracyLabel}>Accuracy Score</Text>
        </View>

        {pronunciationFeedback.correctSounds?.length > 0 && (
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

        {pronunciationFeedback.improvementNeeded?.length > 0 && (
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

        {pronunciationFeedback.practiceExercises?.length > 0 && (
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
      style={[styles.historyItem, {
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }]
      }]}
    >
      <View style={styles.historyHeader}>
        <Text style={styles.historyWord}>{item.word}</Text>
        <View style={[
          styles.historyAccuracy,
          item.accuracy >= 80 ? styles.highAccuracy :
          item.accuracy >= 60 ? styles.mediumAccuracy : styles.lowAccuracy
        ]}>
          <Text style={styles.historyAccuracyText}>{item.accuracy}%</Text>
        </View>
      </View>
      <Text style={styles.historyDate}>
        {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
      <View style={styles.historyActions}>
        <TouchableOpacity
          style={styles.historyActionButton}
          onPress={() => {
            // Set this word as selected to practice it again
            const wordObj = {
              id: item.word,
              word: item.word,
              difficulty: categorizeWordDifficulty(item.word)
            };
            setSelectedWord(wordObj);
            Haptics.selectionAsync();
            if (scrollViewRef.current) {
              setTimeout(() => {
                scrollViewRef.current.scrollTo({ y: 300, animated: true });
              }, 300);
            }
          }}
        >
          <Ionicons name="play" size={16} color="#0ea5e9" />
          <Text style={styles.historyActionText}>Practice Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.historyActionButton}
          onPress={() => {
            // Show a details popup for this history item
            Alert.alert(
              `Details for ${item.word}`,
              `You practiced this word on ${new Date(item.date).toLocaleDateString()} with ${item.accuracy}% accuracy.`,
              [{ text: 'OK', style: 'default' }]
            );
            Haptics.selectionAsync();
          }}
        >
          <Ionicons name="information-circle" size={16} color="#6366f1" />
          <Text style={styles.historyActionText}>Details</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Pronunciation Practice</Text>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>Native Language: {userInfo.motherTongue}</Text>
            <Text style={styles.userInfoText}>English Level: {userInfo.englishLevel}</Text>
          </View>
        </View>

        <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for words..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#94a3b8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                style={styles.clearSearch}
              >
                <Ionicons name="close-circle" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
          {showSearchResults && searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <ScrollView
                style={styles.searchResultsScroll}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {searchResults.map((word, index) => (
                  <TouchableOpacity
                    key={`search-${index}`}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectWordFromSearch(word)}
                  >
                    <Text style={styles.searchResultText}>{word}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </Animated.View>

        <Animated.View style={[styles.wordsListContainer, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Practice Words</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wordsList}
          >
            {pronunciationExamples.map(renderWordItem)}
          </ScrollView>
        </Animated.View>

        {selectedWord && (
          <Animated.View style={[styles.selectedWordContainer, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.selectedWordHeader}>
              <Text style={styles.selectedWordTitle}>Practice: </Text>
              <Text style={styles.selectedWordValue}>{selectedWord.word}</Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text style={styles.loadingText}>Loading word data...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => fetchWordData(selectedWord.word)}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : wordData ? (
              <View style={styles.wordDataContainer}>
                <View style={styles.wordHeader}>
                  <View style={styles.phoneticContainer}>
                    <Text style={styles.phoneticText}>
                      {wordData.phonetic || (wordData.phonetics && wordData.phonetics[0]?.text) || `/${selectedWord.word}/`}
                    </Text>
                    <TouchableOpacity
                      style={[styles.playButton, isPlaying && styles.playingButton]}
                      onPress={handlePlayAudio}
                      disabled={isPlaying}
                    >
                      {isPlaying ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name="volume-high" size={18} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>

                  {dictionaryData?.meanings && dictionaryData.meanings.length > 0 && (
                    <View style={styles.definitionContainer}>
                      <Text style={styles.partOfSpeech}>
                        {dictionaryData.meanings[0].partOfSpeech}
                      </Text>
                      <Text style={styles.definitionText}>
                        {dictionaryData.meanings[0].definitions[0].definition}
                      </Text>
                      {dictionaryData.meanings[0].definitions[0].example && (
                        <Text style={styles.exampleText}>
                          "{dictionaryData.meanings[0].definitions[0].example}"
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                <View style={styles.pronunciationTipsContainer}>
                  <Text style={styles.tipsTitle}>Pronunciation Tips</Text>

                  <View style={styles.tipSection}>
                    <View style={styles.tipHeader}>
                      <MaterialIcons name="short-text" size={18} color="#0ea5e9" />
                      <Text style={styles.tipTitle}>Syllables:</Text>
                    </View>
                    <Text style={styles.tipContent}>{wordData.syllables || selectedWord.word}</Text>
                  </View>

                  <View style={styles.tipSection}>
                    <View style={styles.tipHeader}>
                      <MaterialCommunityIcons name="volume-vibrate" size={18} color="#0ea5e9" />
                      <Text style={styles.tipTitle}>Word Stress:</Text>
                    </View>
                    <Text style={styles.tipContent}>{wordData.stress || 'First syllable'}</Text>
                  </View>

                  {wordData.soundGuide && (
                    <View style={styles.tipSection}>
                      <View style={styles.tipHeader}>
                        <MaterialIcons name="record-voice-over" size={18} color="#0ea5e9" />
                        <Text style={styles.tipTitle}>Sound Guide:</Text>
                      </View>
                      {wordData.soundGuide.map((guide, index) => (
                        <View key={`guide-${index}`} style={styles.soundGuideItem}>
                          <Text style={styles.soundHighlight}>{guide.sound}</Text>
                          <Text style={styles.soundGuideText}>{guide.howTo}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {wordData.commonErrors && (
                    <View style={styles.tipSection}>
                      <View style={styles.tipHeader}>
                        <MaterialIcons name="warning" size={18} color="#f59e0b" />
                        <Text style={styles.tipTitle}>Common Errors:</Text>
                      </View>
                      {wordData.commonErrors.map((error, index) => (
                        <View key={`error-${index}`} style={styles.commonErrorItem}>
                          <MaterialIcons name="error-outline" size={16} color="#f59e0b" style={styles.errorIcon} />
                          <Text style={styles.commonErrorText}>{error}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Recording section */}
                <View style={styles.recordingContainer}>
                  <Text style={styles.recordingTitle}>Record Your Pronunciation</Text>

                  <View style={styles.recordingControls}>
                    <TouchableOpacity
                      style={[
                        styles.recordButton,
                        isRecording && styles.stopButton
                      ]}
                      onPress={isRecording ? stopRecording : startRecording}
                      disabled={isSubmitting}
                    >
                      <Animated.View style={[
                        styles.recordButtonInner,
                        isRecording && styles.recordingInProgress,
                        { transform: [{ scale: isRecording ? pulseAnim : 1 }] }
                      ]}>
                        <Ionicons
                          name={isRecording ? "stop" : "mic"}
                          size={32}
                          color="white"
                        />
                      </Animated.View>
                      <Text style={styles.recordButtonText}>
                        {isRecording ? "Stop Recording" : "Start Recording"}
                      </Text>
                    </TouchableOpacity>

                    {recordingUri && !isSubmitting && !pronunciationFeedback && (
                      <TouchableOpacity
                        style={styles.playRecordingButton}
                        onPress={playRecordedAudio}
                        disabled={isPlaying}
                      >
                        <Ionicons
                          name={isPlaying ? "pause" : "play"}
                          size={24}
                          color="#0ea5e9"
                        />
                        <Text style={styles.playRecordingText}>
                          {isPlaying ? "Playing..." : "Play Recording"}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {isSubmitting && (
                      <View style={styles.submittingContainer}>
                        <Animated.View style={{ transform: [{ rotate }] }}>
                          <Ionicons name="sync" size={24} color="#0ea5e9" />
                        </Animated.View>
                        <Text style={styles.submittingText}>Analyzing pronunciation...</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ) : null}
          </Animated.View>
        )}

        {pronunciationFeedback && renderPronunciationFeedback()}

        {pronunciationHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Your Progress History</Text>
            {pronunciationHistory.slice(0, 5).map(renderHistoryItem)}

            {pronunciationHistory.length > 5 && (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => {
                  Alert.alert('View More', 'This would show all your pronunciation history');
                  Haptics.selectionAsync();
                }}
              >
                <Text style={styles.viewMoreText}>View All History</Text>
                <Ionicons name="chevron-forward" size={16} color="#0ea5e9" />
              </TouchableOpacity>
            )}
          </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  userInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  userInfoText: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 16,
  },
  searchContainer: {
    marginBottom: 20,
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 8,
  },
  clearSearch: {
    padding: 4,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 20,
  },
  searchResultsScroll: {
    maxHeight: 200,
  },
  searchResultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchResultText: {
    fontSize: 16,
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  wordsListContainer: {
    marginBottom: 20,
  },
  wordsList: {
    paddingRight: 16,
  },
  wordCard: {
    width: 140,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
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
    shadowRadius: 8,
    elevation: 5,
  },
  gradientCard: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
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
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  easyBadge: {
    backgroundColor: '#dcfce7',
  },
  mediumBadge: {
    backgroundColor: '#fef3c7',
  },
  hardBadge: {
    backgroundColor: '#fee2e2',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: '#64748b',
  },
  selectedWordContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedWordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedWordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  selectedWordValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0ea5e9',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  wordDataContainer: {
    gap: 16,
  },
  wordHeader: {
    gap: 12,
  },
  phoneticContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneticText: {
    fontSize: 18,
    color: '#64748b',
    fontStyle: 'italic',
  },
  playButton: {
    backgroundColor: '#0ea5e9',
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingButton: {
    backgroundColor: '#0284c7',
  },
  definitionContainer: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  partOfSpeech: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#64748b',
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#64748b',
  },
  pronunciationTipsContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  tipSection: {
    gap: 6,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  tipContent: {
    fontSize: 16,
    color: '#334155',
    marginLeft: 26,
  },
  soundGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 26,
    marginBottom: 6,
  },
  soundHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0ea5e9',
    marginRight: 8,
    backgroundColor: '#e0f2fe',
    padding: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  soundGuideText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
  },
  commonErrorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 26,
    marginBottom: 6,
  },
  errorIcon: {
    marginRight: 8,
  },
  commonErrorText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
  },
  recordingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  recordingControls: {
    alignItems: 'center',
    gap: 16,
  },
  recordButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stopButton: {
    opacity: 0.9,
  },
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recordingInProgress: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  recordButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '500',
  },
  playRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    gap: 8,
  },
  playRecordingText: {
    color: '#0ea5e9',
    fontSize: 16,
    fontWeight: '500',
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submittingText: {
    color: '#0ea5e9',
    fontSize: 16,
  },
  feedbackContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  accuracyContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  accuracyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  accuracyText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  accuracyLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  feedbackSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  feedbackSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 8,
  },
  feedbackIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  feedbackText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    lineHeight: 20,
  },
  encouragementContainer: {
    backgroundColor: '#fdf2f8',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  encouragementIcon: {
    marginRight: 12,
  },
  encouragementText: {
    flex: 1,
    fontSize: 15,
    color: '#9d174d',
    lineHeight: 20,
  },
  rerecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  rerecordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  historyContainer: {
    marginTop: 20,
  },
  historyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  historyAccuracy: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
  },
  highAccuracy: {
    backgroundColor: '#dcfce7',
  },
  mediumAccuracy: {
    backgroundColor: '#fef3c7',
  },
  lowAccuracy: {
    backgroundColor: '#fee2e2',
  },
  historyAccuracyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  historyDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  historyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    gap: 6,
  },
  historyActionText: {
    fontSize: 14,
    color: '#1e293b',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0ea5e9',
    marginRight: 4,
  },
});
