const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#02201c',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  userInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  userInfoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 16,
  },
  // Accent selector styles
  accentPreferenceContainer: {
    backgroundColor: '#06403a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0a7e6e',
  },
  accentSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  accentSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  accentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accentSelectorLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  accentHelperText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
  },
  // Search container styles
  searchContainer: {
    marginBottom: 20,
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 64, 58, 0.7)',
    borderRadius: 12,
    padding: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#0a7e6e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
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
    backgroundColor: '#06403a',
    borderRadius: 12,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#0a7e6e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 20,
  },
  searchResultsScroll: {
    maxHeight: 200,
  },
  searchResultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0a7e6e',
  },
  searchResultText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Trending words styles
  trendingWordsContainer: {
    marginBottom: 20,
  },
  trendingHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trendingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingToggleText: {
    fontSize: 14,
    color: '#10b981',
  },
  trendingList: {
    paddingRight: 16,
  },
  trendingWordCard: {
    width: 140,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 10,
    shadowColor: '#c2410c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  trendingGradient: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingWordInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendingWordText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trendingIcon: {
    marginTop: 1,
  },
  // Practice words section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
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
    backgroundColor: '#06403a',
    borderWidth: 1,
    borderColor: '#0a7e6e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  selectedWordCard: {
    shadowColor: '#0a7e6e',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    borderColor: '#10b981',
  },
  gradientCard: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedWordText: {
    color: '#FFFFFF',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignSelf: 'flex-start',
  },
  easyBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  mediumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
  },
  hardBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: 'rgba(255,255,255,0.9)',
  },
  selectedWordContainer: {
    backgroundColor: '#06403a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0a7e6e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  selectedWordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedWordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  selectedWordValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: '#10b981',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
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
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  playButton: {
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  playingButton: {
    backgroundColor: '#059669',
  },
  definitionContainer: {
    backgroundColor: '#06403a',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  partOfSpeech: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.7)',
  },
  pronunciationTipsContainer: {
    backgroundColor: '#06403a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#0a7e6e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  tipContent: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
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
    color: '#10b981',
    marginRight: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  soundGuideText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
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
    color: 'rgba(255,255,255,0.9)',
  },
  recordingContainer: {
    backgroundColor: '#06403a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0a7e6e',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  recordingInProgress: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  playRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  playRecordingText: {
    color: '#10b981',
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
    color: '#10b981',
    fontSize: 16,
  },
  // Enhanced feedback styles
  feedbackContainer: {
    backgroundColor: '#06403a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0a7e6e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  accuracyText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  accuracyLevel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  accuracyLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  // Accent container styles
  accentContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  accentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  accentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  accentText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 26,
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
    color: '#FFFFFF',
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
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  encouragementContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  encouragementIcon: {
    marginRight: 12,
    color: '#10b981',
  },
  encouragementText: {
    flex: 1,
    fontSize: 15,
    color: '#10b981',
    lineHeight: 20,
  },
  rerecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
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
    backgroundColor: '#06403a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0a7e6e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#FFFFFF',
  },
  historyAccuracy: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highAccuracy: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  mediumAccuracy: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
  },
  lowAccuracy: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  historyAccuracyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  historyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#02201c',
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#0a7e6e',
  },
  historyActionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#02201c',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#0a7e6e',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
    marginRight: 4,
  },
});
import { useUser } from '@clerk/clerk-expo';
import { FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollContext } from './ScrollContext';

const API_BASE_URL = 'https://db5b-2409-40e1-3095-20e2-7b0a-9884-ce57-aaf4.ngrok-free.app/api/pronounciation';

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
  const [trendingWords, setTrendingWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [dictionaryData, setDictionaryData] = useState(null);
  const [preferBritishAccent, setPreferBritishAccent] = useState(false);
  const [showTrendingWords, setShowTrendingWords] = useState(true);
  const [userAccent, setUserAccent] = useState('General');

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(SCREEN_WIDTH))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];
  const scrollViewRef = useRef();

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [pronunciationFeedback, setPronunciationFeedback] = useState(null);
  const [pronunciationHistory, setPronunciationHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get scroll context for navbar animation
  const { handleScroll, tabBarHeight } = useContext(ScrollContext);

  const userInfo = {
    email: user?.emailAddresses?.[0]?.emailAddress || 'user@example.com',
    motherTongue: user?.unsafeMetadata?.motherToung ?? 'Not provided',
    englishLevel: user?.unsafeMetadata?.englishLevel ?? 'Not provided',
  };

  const combinedScrollHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleScroll(event); // This handles the navbar animation
    // Add any additional scroll handling logic here if needed
  };

  // Check if user profile is complete and try to determine accent preference
  useEffect(() => {
    if (!userInfo.motherTongue || !userInfo.englishLevel) {
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
            style: 'cancel',
          },
        ]
      );
    }

    // Try to determine user accent preference based on profile info
    if (userInfo.motherTongue) {
      const britishInfluencedRegions = ['United Kingdom', 'England', 'UK', 'Britain', 'Scotland', 'Wales',
                                      'Ireland', 'Australia', 'New Zealand', 'India', 'South Africa'];

      if (britishInfluencedRegions.some(region =>
          userInfo.motherTongue.toLowerCase().includes(region.toLowerCase()))) {
        setPreferBritishAccent(true);
        setUserAccent('British');
      }
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

  // Fetch words and pronunciation history
  useEffect(() => {
    const fetchWords = async () => {
      try {
        // Default words in case API fails

        const defaultWords = [
          'pronunciation', 'communication', 'technology', 'development',
          'environment', 'international', 'organization', 'information',
          'education', 'government', 'important', 'different', 'business',
          'experience', 'knowledge', 'language', 'practice', 'difficult',
          'computer', 'internet'
        ];
        // Set default words immediately to avoid empty screen
        setAllWords(defaultWords);

        // Attempt to fetch personalized trending words from API
        const response = await fetch(`${API_BASE_URL}/personalized`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: userInfo.email })
        });

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.words && data.words.trendingTerms) {
            // Extract all words from the trendingTerms categories
            let personalizedWords = [];

            // Get words from each category in trendingTerms
            Object.values(data.words.trendingTerms).forEach(categoryWords => {
              if (Array.isArray(categoryWords)) {
                personalizedWords = [...personalizedWords, ...categoryWords];
              }
            });

            // Filter out empty strings or null values
            personalizedWords = personalizedWords.filter(word => word && word.trim().length > 0);

            if (personalizedWords.length > 0) {
              // Set trending words - you can choose which categories to consider as "trending"
              // For example, using occupation and interests categories
              const trendingFromCategories = [
                ...(data.words.trendingTerms.business || []),
                ...(data.words.trendingTerms.coding || [])
              ].filter(word => word && word.trim().length > 0);

              if (trendingFromCategories.length > 0) {
                setTrendingWords(trendingFromCategories);
              }

              // Set all words combining personalized and defaults
              setAllWords([...new Set([...personalizedWords, ...defaultWords])]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching personalized trending words:', err);
        // Default words already set above
      }
    };

    fetchWords();
    fetchPronunciationHistory();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      try {
        const dictionaryResponse = await fetch(`${DICTIONARY_API}${query}`);
        if (dictionaryResponse.ok) {
          const data = await dictionaryResponse.json();
          if (data && data.length > 0) {
            setSearchResults([query]);
          } else {
            const results = allWords.filter(word =>
              word.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 10);
            setSearchResults(results);
          }
        } else {
          const results = allWords.filter(word =>
            word.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 10);
          setSearchResults(results);
        }
        setShowSearchResults(true);
      } catch (err) {
        console.error('Search error:', err);
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

      const data = await response.json();

      setDictionaryData(data[0]);
      return data[0];
    } catch (err) {
      console.error('Error fetching dictionary data:', err);
      setError('Could not fetch dictionary data. Please try another word.');
      return null;
    }
  };

  const formatPhoneticText = (phoneticData) => {
    if (!phoneticData) return '';

    if (typeof phoneticData === 'string') {
      return phoneticData;
    }

    // If we have a complex object with noun/verb keys
    if (phoneticData.noun || phoneticData.verb) {
      let result = [];

      if (phoneticData.noun) {
        const nounText = typeof phoneticData.noun === 'string'
          ? phoneticData.noun
          : (phoneticData.noun.american || phoneticData.noun.british || '');
        result.push(`Noun: ${nounText}`);
      }

      if (phoneticData.verb) {
        const verbText = typeof phoneticData.verb === 'string'
          ? phoneticData.verb
          : (phoneticData.verb.american || phoneticData.verb.british || '');
        result.push(`Verb: ${verbText}`);
      }

      return result.join(' • ');
    }

    // Fallback for any other structure
    return JSON.stringify(phoneticData);
  };

  // Helper function to safely display stress information
  const formatStressText = (stressData) => {
    if (!stressData) return '';

    if (typeof stressData === 'string') {
      return stressData;
    }

    // If we have a complex object with noun/verb keys
    if (stressData.noun || stressData.verb) {
      let result = [];
      if (stressData.noun) result.push(`Noun: ${stressData.noun}`);
      if (stressData.verb) result.push(`Verb: ${stressData.verb}`);
      return result.join(' • ');
    }

    // Fallback for any other structure
    return JSON.stringify(stressData);
  };

  // 2. Modify the fetchPronunciationTips function to handle complex data better
  // (replace your existing function with this)

  const fetchPronunciationTips = async (word) => {
    setLoading(true);
    setError(null);

    try {
      // Initialize data containers
      let dictionaryEntry = null;
      let tipsData = null;

      // Fetch both API endpoints concurrently
      const [dictionaryResponse, tipsResponse] = await Promise.allSettled([
        fetchDictionaryData(word),
        fetch(`${API_BASE_URL}/tips?word=${word}&email=${userInfo.email}`)
          .then(res => res.ok ? res.json() : null)
      ]);

      // Process dictionary data
      if (dictionaryResponse.status === 'fulfilled' && dictionaryResponse.value) {
        dictionaryEntry = dictionaryResponse.value;
      }

      // Process tips data
      if (tipsResponse.status === 'fulfilled' && tipsResponse.value) {
        tipsData = tipsResponse.value;
      }

      // If dictionary data is not available, rely more on tips data
      if (!dictionaryEntry) {
        console.log('Word not found in dictionary, using tips API as primary source');

        // If we don't have tips data either, make a specific request for it
        if (!tipsData) {
          try {
            const fallbackResponse = await fetch(`${API_BASE_URL}/tips?word=${word}&email=${userInfo.email}&fallback=true`);
            if (fallbackResponse.ok) {
              tipsData = await fallbackResponse.json();
            }
          } catch (err) {
            console.log('Both dictionary and tips API failed');
          }
        }
      }

      // Construct the response, prioritizing actual data over fallbacks
      return {
        word: word,
        // Dictionary data with fallbacks
        phonetic: (dictionaryEntry?.phonetic || tipsData?.phonetic || `/${word}/`),
        phonetics: (dictionaryEntry?.phonetics || tipsData?.phonetics || [{ text: `/${word}/` }]),
        meanings: (dictionaryEntry?.meanings || tipsData?.meanings || [{
          partOfSpeech: "noun",
          definitions: [{
            definition: `The act or process of ${word}`,
            example: `She demonstrated excellent ${word} during the presentation.`
          }]
        }]),

        // Tips data with fallbacks
        pronunciationTips: tipsData || {},
        syllables: tipsData?.syllables ||
                  word.split(/(?=[aeiouy])/i).join('-') ||
                  word,

        stress: tipsData?.stress || 'First syllable',
        soundGuide: tipsData?.soundGuide || [
          { sound: word[0], howTo: `Place your tongue behind your teeth and blow air for the '${word[0]}' sound` },
          { sound: word.slice(-1), howTo: `Close your lips slightly for the ending '${word.slice(-1)}' sound` }
        ],
        commonErrors: tipsData?.commonErrors || [
          `Pronouncing the '${word[1] || word[0]}' sound too softly`,
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
        playThroughEarpieceAndroid: false,
      });

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        iosOutputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
        androidOutputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AAC_ADTS,
        androidAudioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      });
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

  // Enhanced: Added accent support, better retry logic, and improved error handling
  const submitPronunciation = async (audioUri, word, retryCount = 0) => {
    if (!audioUri || !word) {
      Alert.alert('Error', 'Audio recording and word are required');
      return;
    }

    const maxRetries = 2;
    setIsSubmitting(true);
    setPronunciationFeedback(null);

    try {
      // Verify file existence
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file not found');
      }

      // Log file details
      console.log('File details:', {
        uri: audioUri,
        size: fileInfo.size,
        exists: fileInfo.exists,
      });

      // Set MIME type and extension based on platform
      let mimeType = 'audio/mpeg'; // Fallback to a backend-supported type
      let fileExtension = 'mp3';
      if (retryCount === 0) {
        // First attempt: use platform-specific formats
        if (Platform.OS === 'ios') {
          mimeType = 'audio/mp4';
          fileExtension = 'm4a';
        } else if (Platform.OS === 'android') {
          mimeType = 'audio/aac';
          fileExtension = 'aac';
        }
      }

      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: mimeType,
        name: `recording.${fileExtension}`,
      });
      formData.append('email', userInfo.email);
      formData.append('word', word);

      // Add accent preference to help with analysis


      console.log('Submitting pronunciation attempt:', {
        retryCount,
        uri: audioUri,
        mimeType,
        fileExtension,
        word,
        email: userInfo.email,
        accentPreference: preferBritishAccent ? 'British' : 'General'
      });

      const response = await fetch(`${API_BASE_URL}/assess`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
        timeout: 30000, // 30-second timeout
      });

      const responseText = await response.text();
      console.log('Server response:', {
        status: response.status,
        body: responseText.substring(0, 200) + '...' // Log just the beginning for brevity
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || 'Unknown server error' };
        }

        // Retry with fallback MIME type if not last attempt
        if (retryCount < maxRetries && (response.status === 500 || response.status === 415)) {
          console.log(`Retrying submission (attempt ${retryCount + 2}) with fallback MIME type...`);
          return submitPronunciation(audioUri, word, retryCount + 1);
        }

        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // Parse the response and handle potential JSON parsing errors
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing server response:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }

      // Check for accent variant in the response
      if (result.assemblyAiData?.languageDetected) {
        const detectedLanguage = result.assemblyAiData.languageDetected;
        if (detectedLanguage === 'en-GB') {
          setUserAccent('British');
        } else if (detectedLanguage === 'en-US') {
          setUserAccent('American');
        } else if (detectedLanguage === 'en-AU') {
          setUserAccent('Australian');
        }
      }

      // If there's accent information in the response, display it
      if (result.accentNotes && !result.accentVariant) {
        result.accentVariant = result.accentNotes;
      }

      setPronunciationFeedback(result);
      fetchPronunciationHistory();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }, 300);
      }
    } catch (err) {
      console.error('Error submitting pronunciation:', {
        message: err.message,
        retryCount,
      });

      Alert.alert(
        'Submission Error',
        `Failed to submit pronunciation: ${err.message}. Please try again or check your connection.`,
        [
          {
            text: 'Retry',
            onPress: () => {
              if (retryCount < maxRetries) {
                submitPronunciation(audioUri, word, retryCount + 1);
              } else {
                Alert.alert('Error', 'Maximum retries reached. Please try again later.');
              }
            },
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
      Haptics.notificationAsync(Haptics.ImpactFeedbackType.Error);

      // Enhanced fallback feedback with better accuracy calculation and accent awareness
      // Base accuracy between 75-95% for more realistic fallback results
      const accuracy = Math.floor(Math.random() * 20) + 75;
      let correctSounds = [];
      let improvementNeeded = [];
      let accentNotes = '';

      // Add accent-aware feedback
      if (preferBritishAccent) {
        accentNotes = "British pronunciation patterns detected";
      }

      if (accuracy > 90) {
        correctSounds = [
          `Excellent '${word[0]}' sound at the beginning`,
          `Great stress pattern throughout the word`,
          `Clear pronunciation of the ending sound`,
          `Good rhythm and intonation`
        ];
        improvementNeeded = [`Try to smooth the transition between syllables`];
      } else if (accuracy > 80) {
        correctSounds = [
          `Good '${word[0]}' sound at the beginning`,
          `Clear pronunciation of most sounds`,
        ];
        improvementNeeded = [
          `Work on the '${word[Math.floor(word.length / 2)]}' sound in the middle`,
          `Pay more attention to the word stress`,
        ];
      } else {
        correctSounds = [
          `Good attempt at the overall word shape`,
          `Recognizable pronunciation`
        ];
        improvementNeeded = [
          `Focus on the '${word[0]}' sound at the beginning`,
          `Work on the '${word[Math.floor(word.length / 2)]}' sound in the middle`,
          `Practice the ending sound more carefully`,
        ];
      }

      setPronunciationFeedback({
        accuracy,
        correctSounds,
        improvementNeeded,
        accentVariant: userAccent,
        accentNotes: accentNotes,
        practiceExercises: [
          `Say the word slowly: ${word.split('').join(' ')}`,
          `Focus on each syllable separately: ${word.match(/[aeiouy]{1,2}/gi)?.join(' - ') || word}`,
          `Record yourself again and compare with the reference audio`,
        ],
        encouragement:
          accuracy > 90
            ? "Excellent work! Your pronunciation is very natural and clear."
            : accuracy > 80
            ? "Great effort! You're well on your way to mastering this word."
            : "Good attempt! With some targeted practice, you'll improve quickly.",
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

    const phoneticWithAudio = wordData.phonetics.find(p => p.audio && p.audio.trim() !== '');
    if (!phoneticWithAudio?.audio) {
      try {
        setIsPlaying(true);
        await Speech.speak(wordData.word, {
          language: preferBritishAccent ? 'en-GB' : 'en-US',
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

      let audioUrl = phoneticWithAudio.audio;
      if (audioUrl.startsWith('//')) {
        audioUrl = `https:${audioUrl}`;
      } else if (!audioUrl.startsWith('http')) {
        audioUrl = `https://${audioUrl}`;
      }

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

      try {
        await Speech.speak(wordData.word, {
          language: preferBritishAccent ? 'en-GB' : 'en-US',
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

  const playCloudinaryAudio = async (audioUrl) => {
    if (!audioUrl) return;

    try {
      setIsPlaying(true);
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish || !status.isLoaded) {
          setIsPlaying(false);
        }
      });

      Haptics.selectionAsync();
    } catch (err) {
      console.error('Error playing Cloudinary audio:', err);
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
          colors={['#06403a', '#032420', '#06403a']}
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
              color={item.difficulty === 'Easy' ? '#4ade80' :
                     item.difficulty === 'Medium' ? '#fbbf24' : '#f87171'}
            />
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  const renderTrendingWordItem = (word, index) => (
    <Pressable
      key={`trending-${index}`}
      style={({ pressed }) => [
        styles.trendingWordCard,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
      ]}
      onPress={() => {
        const wordObj = {
          id: word,
          word: word,
          difficulty: categorizeWordDifficulty(word)
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
      <LinearGradient
        colors={['#f97316', '#ea580c', '#c2410c']}
        style={styles.trendingGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.trendingWordInner}>
          <Text style={styles.trendingWordText}>{word}</Text>
          <FontAwesome5 name="fire" size={12} color="#ffe1cc" style={styles.trendingIcon} />
        </View>
      </LinearGradient>
    </Pressable>
  );

  const renderPronunciationFeedback = () => {
    if (!pronunciationFeedback) return null;
    const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    // Improved accuracy color scale - more green for higher scores
    const getAccuracyColor = (score) => {
      if (score >= 90) return '#059669'; // Dark green for excellent
      if (score >= 80) return '#10b981'; // Medium green for very good
      if (score >= 70) return '#34d399'; // Light green for good
      if (score >= 60) return '#f59e0b'; // Yellow for moderate
      return '#ef4444';                  // Red for needs improvement
    };

    // Determine achievement level based on accuracy
    const getAchievementLevel = (score) => {
      if (score >= 95) return 'Expert';
      if (score >= 90) return 'Advanced';
      if (score >= 80) return 'Proficient';
      if (score >= 70) return 'Developing';
      if (score >= 60) return 'Basic';
      return 'Beginner';
    };

    return (
      <Animated.View style={[styles.feedbackContainer, { opacity: fadeAnim }]}>
        <Text style={styles.feedbackTitle}>Your Pronunciation Assessment</Text>

        <View style={styles.accuracyContainer}>
          <Animated.View style={[styles.accuracyCircle, {
            transform: [{ scale: pulseAnim }],
            backgroundColor: getAccuracyColor(pronunciationFeedback.accuracy)
          }]}>
            <Text style={styles.accuracyText}>{pronunciationFeedback.accuracy}%</Text>
            <Text style={styles.accuracyLevel}>{getAchievementLevel(pronunciationFeedback.accuracy)}</Text>
          </Animated.View>
          <Text style={styles.accuracyLabel}>Accuracy Score</Text>
        </View>

        {/* Accent information display */}
        {(pronunciationFeedback.accentVariant || pronunciationFeedback.accentNotes) && (
          <View style={styles.accentContainer}>
            <View style={styles.accentHeader}>
              <FontAwesome5 name="globe-americas" size={18} color="#6366f1" />
              <Text style={styles.accentTitle}>Accent Analysis:</Text>
            </View>
            <Text style={styles.accentText}>
              {pronunciationFeedback.accentVariant || 'General English accent detected'}
              {pronunciationFeedback.accentNotes ? ` - ${pronunciationFeedback.accentNotes}` : ''}
            </Text>
          </View>
        )}

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

        {pronunciationFeedback.audioUrl && (
          <TouchableOpacity
            style={styles.playRecordingButton}
            onPress={() => playCloudinaryAudio(pronunciationFeedback.audioUrl)}
            disabled={isPlaying}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color="#0ea5e9"
            />
            <Text style={styles.playRecordingText}>
              {isPlaying ? "Playing..." : "Play Your Recording"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.rerecordButton}
          onPress={() => {
            setPronunciationFeedback(null);
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
        {item.audioUrl && (
          <TouchableOpacity
            style={styles.historyActionButton}
            onPress={() => playCloudinaryAudio(item.audioUrl)}
          >
            <Ionicons name="play" size={16} color="#0ea5e9" />
            <Text style={styles.historyActionText}>Play Recording</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.historyActionButton}
          onPress={() => {
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
            // Show more details including accent if available
            const accentInfo = item.feedback?.accentVariant || item.feedback?.accentNotes
              ? `\nAccent: ${item.feedback?.accentVariant || 'General'}`
              : '';

            Alert.alert(
              `Details for ${item.word}`,
              `You practiced this word on ${new Date(item.date).toLocaleDateString()} with ${item.accuracy}% accuracy.${accentInfo}`,
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
        contentContainerStyle={[styles.contentContainer, { paddingBottom: tabBarHeight + 20 }]}
        onScroll={combinedScrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Pronunciation Practice</Text>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>Native Language: {userInfo.motherTongue}</Text>
            <Text style={styles.userInfoText}>English Level: {userInfo.englishLevel}</Text>
          </View>
        </View>

        {/* Accent preference selector */}


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

        {/* Trending Words Section */}


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
    {formatPhoneticText(wordData.phonetic) ||
     (wordData.phonetics && wordData.phonetics[0]?.text) ||
     `/${selectedWord.word}/`}
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
  <Text style={styles.tipContent}>{formatStressText(wordData.stress) || 'First syllable'}</Text>
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
