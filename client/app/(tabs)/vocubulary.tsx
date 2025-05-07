

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#032420',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0a3d39',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
    tintColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  streakInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  streakText: {
    color: '#a7c4c0',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  inactiveStreakText: {
    color: '#6e8985',
  },
  nextMilestoneText: {
    color: '#FFD700',
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a3d39',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
    tintColor: '#a7c4c0',
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: 'white',
  },
  randomButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#0a3d39',
  },
  activeFilter: {
    backgroundColor: '#1a7a6f',
  },
  filterText: {
    color: '#a7c4c0',
    fontWeight: '600',
  },
  activeFilterText: {
    color: 'white',
  },
  studyButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  studyButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1a7a6f',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  flashcardButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2e8b57',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  studyButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#032420',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2a1a1a',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#ff6b6b',
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  wordCard: {
    backgroundColor: '#0a3d39',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  wordCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  wordTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordCardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  phoneticText: {
    fontSize: 14,
    color: '#a7c4c0',
    marginBottom: 8,
  },
  quickDefinition: {
    fontSize: 14,
    color: '#d1e0e0',
    lineHeight: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    opacity: 0.6,
    tintColor: '#a7c4c0',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#a7c4c0',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7f9c99',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  wordDetailContainer: {
    flex: 1,
    backgroundColor: '#0a3d39',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    padding: 20,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  wordHeaderTitleSection: {
    flex: 1,
  },
  detailWordText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  detailPhoneticText: {
    fontSize: 16,
    color: '#a7c4c0',
    marginTop: 4,
  },
  favoriteButton: {
    padding: 8,
  },
  originContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#06403a',
    borderRadius: 8,
  },
  originLabel: {
    fontWeight: '600',
    color: '#d1e0e0',
    marginRight: 8,
  },
  originText: {
    flex: 1,
    color: 'white',
    lineHeight: 20,
  },
  meaningsList: {
    paddingBottom: 40,
  },
  meaningContainer: {
    marginBottom: 24,
  },
  partOfSpeech: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a7a6f',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  definitionContainer: {
    marginBottom: 12,
  },
  definitionText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#a7c4c0',
    fontStyle: 'italic',
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  synonymsText: {
    fontSize: 14,
    color: '#2ecc71',
    marginLeft: 16,
    marginTop: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#1a7a6f',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  studyContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#032420',
  },
  studyProgress: {
    alignItems: 'center',
    marginBottom: 16,
  },
  studyProgressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a7c4c0',
  },
  flashcardContainer: {
    backgroundColor: '#0a3d39',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  flashcardWord: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  flashcardPhonetic: {
    fontSize: 18,
    color: '#a7c4c0',
    textAlign: 'center',
    marginBottom: 16,
  },
  revealButton: {
    backgroundColor: '#06403a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  revealButtonText: {
    color: '#1a7a6f',
    fontWeight: '600',
  },
  definitionReveal: {
    marginTop: 16,
    alignItems: 'center',
  },
  flashcardDefinition: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 26,
  },
  flashcardPartOfSpeech: {
    fontStyle: 'italic',
    color: '#1a7a6f',
    fontWeight: '600',
  },
  flashcardExample: {
    fontSize: 16,
    color: '#a7c4c0',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  studyControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  studyControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0a3d39',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  prevButton: {
    paddingLeft: 16,
  },
  nextButton: {
    paddingRight: 16,
  },
  studyControlText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a7a6f',
    marginHorizontal: 8,
  },
  disabledText: {
    color: '#3d5a5a',
  },
  exitStudyButton: {
    padding: 16,
    backgroundColor: '#0a3d39',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  exitStudyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
  flashcard: {
    backgroundColor: '#0a3d39',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  flashcardContent: {
    alignItems: 'center',
  },
  flipPrompt: {
    color: '#7f9c99',
    fontSize: 14,
    fontStyle: 'italic',
    position: 'absolute',
    bottom: 16,
  },
  flashcardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  difficultyButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0a3d39',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    color: 'white',
  },
  loadMoreButton: {
    padding: 16,
    backgroundColor: '#0a3d39',
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a7a6f',
  },
  aiGeneratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  aiGeneratedText: {
    color: '#FFD700',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  aiGeneratedBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  aiGeneratedTextSmall: {
    color: '#FFD700',
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '600',
  },
  miniAiBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 10,
    padding: 4,
    marginLeft: 8,
  },
});
import { useUser } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ScrollContext } from './ScrollContext';
const API_BASE_URL = 'https://ai-english-tutor-9ixt.onrender.com/api'; // Replace with your actual API base URL

export default function VocabularyScreen() {
  const { user } = useUser(); // Get authenticated user from Clerk
  const [searchTerm, setSearchTerm] = useState('');
  const [vocabularyWords, setVocabularyWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [randomWords, setRandomWords] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'favorites', 'recent'
  const [history, setHistory] = useState([]);
  const [studyMode, setStudyMode] = useState(false);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
  const [revealDefinition, setRevealDefinition] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [lastOpened, setLastOpened] = useState(null);
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const { handleScroll, tabBarHeight } = useContext(ScrollContext);
  const flatListRef = useRef(null);

  // New state variables for pagination and streak info
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, total: 0, pages: 0 });
  const [nextMilestone, setNextMilestone] = useState(5);
  const [streakActive, setStreakActive] = useState(false);
  const [streakStats, setStreakStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    totalSessions: 0
  });

  // Combined scroll handler for both content scrolling and navbar animation
  const combinedScrollHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleScroll(event); // This handles the navbar animation
    // Add any additional scroll handling logic here if needed
  };

  const netInfo = useNetInfo();

  // Load data on component mount
  useEffect(() => {
    loadDataFromStorage();
    fetchRandomWords();
    if (user) {
      fetchStreak();
      fetchVocabulary();
      fetchSearchHistory();
      fetchStreakStats();
    }
  }, [filter, user]);

  // Save data when it changes
  useEffect(() => {
    saveDataToStorage();
  }, [vocabularyWords, favorites, history, dailyStreak, lastOpened]);

  const loadDataFromStorage = async () => {
    try {
      const vocabData = await AsyncStorage.getItem('vocabularyData');
      if (vocabData) {
        const parsedData = JSON.parse(vocabData);
        setVocabularyWords(parsedData.words || []);
        setFavorites(parsedData.favorites || []);
        setHistory(parsedData.history || []);
        setDailyStreak(parsedData.dailyStreak || 0);
        setLastOpened(parsedData.lastOpened || null);
      }
    } catch (err) {
      console.error('Failed to load data from storage', err);
    }
  };

  const saveDataToStorage = async () => {
    try {
      const data = {
        words: vocabularyWords,
        favorites: favorites,
        history: history,
        dailyStreak: dailyStreak,
        lastOpened: lastOpened,
      };
      await AsyncStorage.setItem('vocabularyData', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save data to storage', err);
    }
  };

  const fetchVocabulary = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const response = await fetch(
        `${API_BASE_URL}/words?filter=${filter}&email=${encodeURIComponent(email)}&page=${pagination.page}&pageSize=${pagination.pageSize}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch vocabulary');
      }

      const { words, pagination: paginationData } = await response.json();
      setVocabularyWords(words);
      setPagination(paginationData);

      // Extract favorites
      const favs = words.filter((word) => word.isFavorite).map((word) => word.word);
      setFavorites(favs);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchHistory = async () => {
    if (!user) return;

    try {
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const response = await fetch(
        `${API_BASE_URL}/search-history?email=${encodeURIComponent(email)}&limit=20`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch search history');
      }

      const data = await response.json();
      setHistory(data.map((item) => item.term));
    } catch (err) {
      console.error('Failed to fetch search history', err);
      setError(err.message);
    }
  };

  const fetchStreak = async () => {
    if (!user) return;

    try {
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const response = await fetch(`${API_BASE_URL}/streak?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch streak');
      }

      const data = await response.json();
      setDailyStreak(data.streak);
      setNextMilestone(data.nextMilestone);
      setStreakActive(data.streakActive);
    } catch (err) {
      console.error('Failed to fetch streak', err);
      setError(err.message);
    }
  };

  const fetchStreakStats = async () => {
    if (!user) return;

    try {
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const response = await fetch(`${API_BASE_URL}/streak-stats?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch streak stats');
      }

      const data = await response.json();
      setStreakStats(data);
    } catch (err) {
      console.error('Failed to fetch streak stats', err);
    }
  };

  const fetchRandomWords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/random?limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch random words');
      const words = await response.json();
      setRandomWords(words);
    } catch (err) {
      setError('Failed to fetch random words');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWordDetails = async (word) => {
    if (!netInfo.isConnected) {
      setError('No internet connection. Cannot fetch word details.');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      if (user) {
        const email = user?.emailAddresses?.[0]?.emailAddress;
        response = await fetch(
          `${API_BASE_URL}/search/${encodeURIComponent(word.toLowerCase())}?email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        // Fallback to public API if not authenticated
        response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase().trim())}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Word not found');
      }

      const data = await response.json();
      const wordData = user ? data : data[0]; // Our API returns the word directly, public API returns array

      // Add timestamp for sorting by recent
      wordData.timestamp = Date.now();

      // Update search history locally
      if (user) {
        updateHistory(word.toLowerCase().trim());
      }

      return wordData;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Explicit request for AI-generated definition
  const requestAIDefinition = async (word) => {
    if (!user) {
      setError('Please sign in to use AI-generated definitions');
      return null;
    }

    if (!netInfo.isConnected) {
      setError('No internet connection. Cannot generate definition.');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const email = user?.emailAddresses?.[0]?.emailAddress;
      const response = await fetch(
        `${API_BASE_URL}/generate/${encodeURIComponent(word.toLowerCase())}?email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate definition');
      }

      const wordData = await response.json();
      wordData.timestamp = Date.now();

      // Update search history locally
      updateHistory(word.toLowerCase().trim());

      return wordData;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateHistory = (word) => {
    // Keep only unique entries and limit to 20 most recent
    const updatedHistory = [word, ...history.filter((w) => w !== word)].slice(0, 20);
    setHistory(updatedHistory);
  };

  const saveWordToVocabulary = async (wordDetails) => {
    if (!user) {
      // If not authenticated, just save locally
      if (!vocabularyWords.some((w) => w.word === wordDetails.word)) {
        setVocabularyWords((prev) => [wordDetails, ...prev]);
      }
      return;
    }

    try {
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const response = await fetch(`${API_BASE_URL}/words`, {
        method: 'POST',
        headers: {
          "ngrok-skip-browser-warning": "true",
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          word: wordDetails.word,
          phonetic: wordDetails.phonetic,
          origin: wordDetails.origin,
          meanings: wordDetails.meanings,
          isAIGenerated: wordDetails.isAIGenerated || false, // Pass AI generated flag
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save word');
      }

      const savedWord = await response.json();
      return savedWord;
    } catch (err) {
      console.error('Failed to save word', err);
      return null;
    }
  };

  // Handle search error with AI generation fallback
  const handleSearchError = () => {
    if (searchTerm.trim()) {
      Alert.alert(
        'Word Not Found',
        `"${searchTerm}" wasn't found in our dictionary. Would you like to generate a definition using AI?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Generate with AI',
            onPress: async () => {
              const wordDetails = await requestAIDefinition(searchTerm);
              if (wordDetails) {
                setSelectedWord(wordDetails);
                if (!vocabularyWords.some((w) => w.word === wordDetails.word)) {
                  const savedWord = await saveWordToVocabulary(wordDetails);
                  if (savedWord) {
                    setVocabularyWords((prev) => [savedWord, ...prev]);
                  } else {
                    setVocabularyWords((prev) => [wordDetails, ...prev]);
                  }
                }
              }
            }
          }
        ]
      );
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    const wordDetails = await fetchWordDetails(searchTerm);
    if (wordDetails) {
      setSelectedWord(wordDetails);

      // Save to vocabulary if not already present
      if (!vocabularyWords.some((w) => w.word === wordDetails.word)) {
        const savedWord = await saveWordToVocabulary(wordDetails);
        if (savedWord) {
          setVocabularyWords((prev) => [savedWord, ...prev]);
        } else {
          setVocabularyWords((prev) => [wordDetails, ...prev]);
        }
      } else {
        // Update existing word's timestamp to bring it to top of recent list
        setVocabularyWords((prev) =>
          prev.map((w) =>
            w.word === wordDetails.word ? { ...w, timestamp: Date.now() } : w
          )
        );
      }
    } else {
      // Handle search error (now shows AI generation option)
      handleSearchError();
    }
  };

  const handleRandomWord = async () => {
    if (randomWords.length === 0) {
      setError('No random words available');
      return;
    }

    const randomIndex = Math.floor(Math.random() * randomWords.length);
    const randomWord = randomWords[randomIndex];

    // Ensure randomWord is a string
    if (typeof randomWord !== 'string' || !randomWord) {
      setError('Invalid random word');
      return;
    }

    setSearchTerm(randomWord);
    const wordDetails = await fetchWordDetails(randomWord);

    if (wordDetails) {
      setSelectedWord(wordDetails);
      // Add to vocabulary if not already present
      if (!vocabularyWords.some((w) => w.word === wordDetails.word)) {
        const savedWord = await saveWordToVocabulary(wordDetails);
        if (savedWord) {
          setVocabularyWords((prev) => [savedWord, ...prev]);
        } else {
          setVocabularyWords((prev) => [wordDetails, ...prev]);
        }
      }
    } else {
      // If random word not found, offer AI generation
      Alert.alert(
        'Random Word Not Found',
        `"${randomWord}" wasn't found in our dictionary. Would you like to generate a definition using AI?`,
        [
          {
            text: 'Try Another',
            onPress: handleRandomWord
          },
          {
            text: 'Generate with AI',
            onPress: async () => {
              const aiWordDetails = await requestAIDefinition(randomWord);
              if (aiWordDetails) {
                setSelectedWord(aiWordDetails);
                if (!vocabularyWords.some((w) => w.word === aiWordDetails.word)) {
                  const savedWord = await saveWordToVocabulary(aiWordDetails);
                  if (savedWord) {
                    setVocabularyWords((prev) => [savedWord, ...prev]);
                  } else {
                    setVocabularyWords((prev) => [aiWordDetails, ...prev]);
                  }
                }
              }
            }
          }
        ]
      );
    }
  };


  const toggleFavorite = async (word) => {
    if (!user) {
      // Local only
      if (favorites.includes(word)) {
        setFavorites((prev) => prev.filter((w) => w !== word));
      } else {
        setFavorites((prev) => [...prev, word]);
      }
      return;
    }

    try {
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const wordEntry = vocabularyWords.find((w) => w.word === word);
      if (!wordEntry) return;

      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          wordId: wordEntry.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle favorite');
      }

      const { isFavorite, wordId } = await response.json();

      // Update local state
      if (isFavorite) {
        setFavorites((prev) => [...prev, word]);
      } else {
        setFavorites((prev) => prev.filter((w) => w !== word));
      }

      // Update word in vocabulary list
      setVocabularyWords(prev =>
        prev.map(w =>
          w.id === wordId ? { ...w, isFavorite } : w
        )
      );
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const deleteWord = async (word) => {
    Alert.alert(
      'Remove Word',
      `Remove "${word}" from your vocabulary list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (user) {
              const email = user?.emailAddresses?.[0]?.emailAddress;
              const wordEntry = vocabularyWords.find((w) => w.word === word);
              if (!wordEntry) return;

              try {
                const response = await fetch(`${API_BASE_URL}/words/${wordEntry.id}`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email }),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Failed to delete word');
                }
              } catch (err) {
                console.error('Failed to delete word', err);
                return;
              }
            }

            // Update local state
            setVocabularyWords((prev) => prev.filter((w) => w.word !== word));
            setFavorites((prev) => prev.filter((w) => w !== word));
            if (selectedWord && selectedWord.word === word) {
              setSelectedWord(null);
            }
          },
        },
      ]
    );
  };

  const getFilteredWords = () => {
    switch (filter) {
      case 'favorites':
        return vocabularyWords.filter((word) => favorites.includes(word.word));
      case 'recent':
        return [...vocabularyWords].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      default:
        return vocabularyWords;
    }
  };

  const filteredWords = getFilteredWords();

  const startStudyMode = async () => {
    if (vocabularyWords.length === 0) {
      Alert.alert('No Words', 'Add some words to your vocabulary first!');
      return;
    }

    if (user) {
      try {
        const email = user?.emailAddresses?.[0]?.emailAddress;
        const response = await fetch(`${API_BASE_URL}/study-sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            mode: 'study',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to start study session');
        }

        const { session, streak } = await response.json();
        setCurrentSessionId(session.id);

        // Update streak info if returned from the API
        if (streak) {
          setDailyStreak(streak.count);
        }
      } catch (err) {
        console.error('Failed to start study session', err);
      }
    }

    setStudyMode(true);
    setFlashcardMode(false);
    setCurrentStudyIndex(0);
    setRevealDefinition(false);
    setSelectedWord(null);
  };

  const startFlashcardMode = async () => {
    if (vocabularyWords.length === 0) {
      Alert.alert('No Words', 'Add some words to your vocabulary first!');
      return;
    }

    if (user) {
      try {
        const email = user?.emailAddresses?.[0]?.emailAddress;
        const response = await fetch(`${API_BASE_URL}/study-sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            mode: 'flashcard',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to start flashcard session');
        }

        const { session, streak } = await response.json();
        setCurrentSessionId(session.id);

        // Update streak info if returned from the API
        if (streak) {
          setDailyStreak(streak.count);
        }
      } catch (err) {
        console.error('Failed to start flashcard session', err);
      }
    }

    setFlashcardMode(true);
    setStudyMode(false);
    setCurrentStudyIndex(0);
    setRevealDefinition(false);
    setSelectedWord(null);
  };

  const endStudySession = async () => {
    if (user && currentSessionId) {
      try {
        const email = user?.emailAddresses?.[0]?.emailAddress;
        const response = await fetch(`${API_BASE_URL}/study-sessions/${currentSessionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to end study session');
        }

        // Fetch updated streak data
        fetchStreak();
        fetchStreakStats();
      } catch (err) {
        console.error('Failed to end study session', err);
      }
    }

    setStudyMode(false);
    setFlashcardMode(false);
    setCurrentSessionId(null);
  };

  const recordStudyAttempt = async (wordId, difficultyRating, isCorrect) => {
    if (!user || !currentSessionId) return;

    try {
      const email = user?.emailAddresses?.[0]?.emailAddress;
      const response = await fetch(`${API_BASE_URL}/study-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          sessionId: currentSessionId,
          wordId,
          difficultyRating,
          isCorrect,
          timeSpent: Math.floor(Math.random() * 10) + 5, // Random time between 5-15 seconds
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record study attempt');
      }
    } catch (err) {
      console.error('Failed to record study attempt', err);
    }
  };

  const nextStudyCard = () => {
    if (currentStudyIndex < filteredWords.length - 1) {
      setCurrentStudyIndex((prev) => prev + 1);
      setRevealDefinition(false);
    } else {
      Alert.alert(
        'Study Complete!',
        "You've reviewed all the words in this set!",
        [
          {
            text: 'Start Over',
            onPress: () => {
              setCurrentStudyIndex(0);
              setRevealDefinition(false);
            },
          },
          {
            text: 'Exit Study Mode',
            onPress: endStudySession,
          },
        ]
      );
    }
  };

  const prevStudyCard = () => {
    if (currentStudyIndex > 0) {
      setCurrentStudyIndex((prev) => prev - 1);
      setRevealDefinition(false);
    }
  };

  const handleDifficultyRating = (difficulty) => {
    if (filteredWords.length === 0) return;

    const currentWord = filteredWords[currentStudyIndex];
    if (user && currentWord.id) {
      recordStudyAttempt(currentWord.id, difficulty, true);
    }

    nextStudyCard();
  };

  const renderMeaning = (meaning) => (
    <View key={meaning.partOfSpeech || 'unknown'} style={styles.meaningContainer}>
      <Text style={styles.partOfSpeech}>{meaning.partOfSpeech || 'unknown'}</Text>
      {(meaning.definitions || []).slice(0, 3).map((def, idx) => (
        <View key={idx} style={styles.definitionContainer}>
          <Text style={styles.definitionText}>• {def.definition || 'No definition available'}</Text>
          {def.example && <Text style={styles.exampleText}>Example: "{def.example}"</Text>}
          {def.synonyms && Array.isArray(def.synonyms) && def.synonyms.length > 0 && (
            <Text style={styles.synonymsText}>
              Synonyms: {def.synonyms.slice(0, 5).join(', ')}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderVocabularyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.wordCard}
      onPress={() => {
        setSelectedWord(item);
        setStudyMode(false);
        setFlashcardMode(false);
      }}
    >
      <View style={styles.wordCardHeader}>
        <View style={styles.wordTitleSection}>
          <Text style={styles.wordText}>{item.word}</Text>
          {item.isAIGenerated && (
            <View style={styles.miniAiBadge}>
              <Icon name="auto-awesome" size={12} color="#FFD700" />
            </View>
          )}
        </View>
        <View style={styles.wordCardActions}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.word);
            }}
            style={styles.actionButton}
          >
            <Icon
              name={favorites.includes(item.word) ? 'star' : 'star-border'}
              size={24}
              color={favorites.includes(item.word) ? '#FFD700' : '#BDC3C7'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              deleteWord(item.word);
            }}
            style={styles.actionButton}
          >
            <Icon name='delete-outline' size={24} color='#FF6B6B' />
          </TouchableOpacity>
        </View>
      </View>
      {item.phonetic && <Text style={styles.phoneticText}>{item.phonetic}</Text>}
      {item.meanings && item.meanings.length > 0 && (
        <Text style={styles.quickDefinition}>
          {item.meanings[0].partOfSpeech}:{' '}
          {item.meanings[0].definitions[0].definition.length > 80
            ? item.meanings[0].definitions[0].definition.substring(0, 80) + '...'
            : item.meanings[0].definitions[0].definition}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderStudyMode = () => {
    if (filteredWords.length === 0) return null;

    const currentWord = filteredWords[currentStudyIndex];

    return (
      <View style={styles.studyContainer}>
        <View style={styles.studyProgress}>
          <Text style={styles.studyProgressText}>
            {currentStudyIndex + 1} / {filteredWords.length}
          </Text>
        </View>

        <View style={styles.flashcardContainer}>
          <Text style={styles.flashcardWord}>{currentWord.word}</Text>
          {currentWord.phonetic && (
            <Text style={styles.flashcardPhonetic}>{currentWord.phonetic}</Text>
          )}
          {currentWord.isAIGenerated && (
            <View style={styles.aiGeneratedBadgeSmall}>
              <Icon name="auto-awesome" size={12} color="#FFD700" />
              <Text style={styles.aiGeneratedTextSmall}>AI-Generated</Text>
            </View>
          )}

          {revealDefinition ? (
            <View style={styles.definitionReveal}>
              {currentWord.meanings && currentWord.meanings.length > 0 && (
                <Text style={styles.flashcardDefinition}>
                  <Text style={styles.flashcardPartOfSpeech}>
                    {currentWord.meanings[0].partOfSpeech}:{' '}
                  </Text>
                  {currentWord.meanings[0].definitions[0].definition}
                </Text>
              )}

              {currentWord.meanings && currentWord.meanings[0].definitions[0].example && (
                <Text style={styles.flashcardExample}>
                  "{currentWord.meanings[0].definitions[0].example}"
                </Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.revealButton}
              onPress={() => setRevealDefinition(true)}
            >
              <Text style={styles.revealButtonText}>Tap to reveal definition</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.studyControls}>
          <TouchableOpacity
            style={[styles.studyControlButton, styles.prevButton]}
            onPress={prevStudyCard}
            disabled={currentStudyIndex === 0}
          >
            <Icon
              name='arrow-back'
              size={24}
              color={currentStudyIndex === 0 ? '#BDC3C7' : '#4A90E2'}
            />
            <Text
              style={[
                styles.studyControlText,
                currentStudyIndex === 0 ? styles.disabledText : null,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.studyControlButton, styles.nextButton]}
            onPress={nextStudyCard}
          >
            <Text style={styles.studyControlText}>Next</Text>
            <Icon name='arrow-forward' size={24} color='#4A90E2' />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.exitStudyButton} onPress={endStudySession}>
          <Text style={styles.exitStudyText}>Exit Study Mode</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFlashcardMode = () => {
    if (filteredWords.length === 0) return null;

    const currentWord = filteredWords[currentStudyIndex];

    return (
      <View style={styles.studyContainer}>
        <View style={styles.studyProgress}>
          <Text style={styles.studyProgressText}>
            {currentStudyIndex + 1} / {filteredWords.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.flashcard}
          onPress={() => setRevealDefinition(!revealDefinition)}
        >
          {!revealDefinition ? (
            <>
              <Text style={styles.flashcardWord}>{currentWord.word}</Text>
              {currentWord.phonetic && (
                <Text style={styles.flashcardPhonetic}>{currentWord.phonetic}</Text>
              )}
              {currentWord.isAIGenerated && (
                <View style={styles.aiGeneratedBadgeSmall}>
                  <Icon name="auto-awesome" size={12} color="#FFD700" />
                  <Text style={styles.aiGeneratedTextSmall}>AI-Generated</Text>
                </View>
              )}
              <Text style={styles.flipPrompt}>Tap to flip</Text>
            </>
          ) : (
            <>
              {currentWord.meanings && currentWord.meanings.length > 0 && (
                <View style={styles.flashcardContent}>
                  <Text style={styles.flashcardPartOfSpeech}>
                    {currentWord.meanings[0].partOfSpeech}
                  </Text>
                  <Text style={styles.flashcardDefinition}>
                    {currentWord.meanings[0].definitions[0].definition}
                  </Text>

                  {currentWord.meanings[0].definitions[0].example && (
                    <Text style={styles.flashcardExample}>
                      "{currentWord.meanings[0].definitions[0].example}"
                    </Text>
                  )}
                </View>
              )}
              <Text style={styles.flipPrompt}>Tap to flip</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.flashcardButtons}>
          <TouchableOpacity
            style={styles.difficultyButton}
            onPress={() => handleDifficultyRating('hard')}
          >
            <Icon name='error-outline' size={24} color='#FF6B6B' />
            <Text style={styles.difficultyText}>Hard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.difficultyButton}
            onPress={() => handleDifficultyRating('medium')}
          >
            <Icon name='offline-bolt' size={24} color='#FFA500' />
            <Text style={styles.difficultyText}>Medium</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.difficultyButton}
            onPress={() => handleDifficultyRating('easy')}
          >
            <Icon name='check-circle-outline' size={24} color='#4CAF50' />
            <Text style={styles.difficultyText}>Easy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.exitStudyButton} onPress={endStudySession}>
          <Text style={styles.exitStudyText}>Exit Flashcard Mode</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Added function to handle pagination
  const loadMoreWords = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
      fetchVocabulary();
    }
  };

  const renderStreakBadge = () => {
    return (
      <View style={styles.streakInfoContainer}>
        {dailyStreak > 0 ? (
          <>
            <Icon
              name='local-fire-department'
              size={16}
              color={streakActive ? '#FFD700' : '#BDC3C7'}
            />
            <Text style={[
              styles.streakText,
              !streakActive && styles.inactiveStreakText
            ]}>
              {dailyStreak} day{dailyStreak !== 1 ? 's' : ''}
              {streakActive ? '' : ' (inactive)'}
            </Text>
            {nextMilestone && (
              <Text style={styles.nextMilestoneText}>
                {nextMilestone - dailyStreak} day{nextMilestone - dailyStreak !== 1 ? 's' : ''} to {nextMilestone}!
              </Text>
            )}
          </>
        ) : (
          <>
            <Icon name='local-fire-department' size={16} color='#BDC3C7' />
            <Text style={styles.streakText}>Start your streak today!</Text>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png' }}
          style={styles.logo}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Vocabulary Builder</Text>
          {renderStreakBadge()}
        </View>
      </View>

      {!studyMode && !flashcardMode && (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name='search' size={24} color='#666' style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder='Search for a word...'
                placeholderTextColor='#999'
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={handleSearch}
                returnKeyType='search'
              />
              <TouchableOpacity
                style={styles.randomButton}
                onPress={handleRandomWord}
                disabled={loading}
              >

<MaterialIcons name="refresh" size={24} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' ? styles.activeFilter : null]}
              onPress={() => setFilter('all')}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === 'all' ? styles.activeFilterText : null,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'favorites' ? styles.activeFilter : null,
              ]}
              onPress={() => setFilter('favorites')}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === 'favorites' ? styles.activeFilterText : null,
                ]}
              >
                Favorites
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'recent' ? styles.activeFilter : null,
              ]}
              onPress={() => setFilter('recent')}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === 'recent' ? styles.activeFilterText : null,
                ]}
              >
                Recent
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.studyButtonsContainer}>
            <TouchableOpacity style={styles.studyButton} onPress={startStudyMode}>
              <Icon name='book' size={20} color='white' />
              <Text style={styles.studyButtonText}>Study Mode</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.flashcardButton} onPress={startFlashcardMode}>
              <Icon name='flip' size={20} color='white' />
              <Text style={styles.studyButtonText}>Flashcards</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#4A90E2' />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Icon name='error-outline' size={24} color='#FF6B6B' />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {studyMode && renderStudyMode()}

      {flashcardMode && renderFlashcardMode()}

      {!studyMode && !flashcardMode && selectedWord ? (
        <View style={styles.wordDetailContainer}>
          <View style={styles.wordHeader}>
            <View style={styles.wordHeaderTitleSection}>
              <Text style={styles.detailWordText}>{selectedWord.word}</Text>
              {selectedWord.phonetic && (
                <Text style={styles.detailPhoneticText}>{selectedWord.phonetic}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(selectedWord.word)}
              style={styles.favoriteButton}
            >
              <Icon
                name={favorites.includes(selectedWord.word) ? 'star' : 'star-border'}
                size={28}
                color={favorites.includes(selectedWord.word) ? '#FFD700' : '#BDC3C7'}
              />
            </TouchableOpacity>
          </View>

          {selectedWord.isAIGenerated && (
            <View style={styles.aiGeneratedBadge}>
              <Icon name="auto-awesome" size={16} color="#FFD700" />
              <Text style={styles.aiGeneratedText}>AI-Generated Definition</Text>
            </View>
          )}

          {selectedWord.origin && (
            <View style={styles.originContainer}>
              <Text style={styles.originLabel}>Origin:</Text>
              <Text style={styles.originText}>{selectedWord.origin}</Text>
            </View>
          )}

          <FlatList
            data={selectedWord.meanings}
            renderItem={({ item }) => renderMeaning(item)}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={[styles.meaningsList, { paddingBottom: tabBarHeight + 20 }]}
            ListHeaderComponent={() => (
              <TouchableOpacity style={styles.backButton} onPress={() => setSelectedWord(null)}>
                <Icon name='arrow-back' size={20} color='#4A90E2' />
                <Text style={styles.backButtonText}>Back to list</Text>
              </TouchableOpacity>
            )}
            onScroll={combinedScrollHandler}
            scrollEventThrottle={16}
          />
        </View>
      ) : !studyMode && !flashcardMode ? (
        <FlatList
          ref={flatListRef}
          data={filteredWords}
          renderItem={renderVocabularyItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMoreWords}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            pagination.page < pagination.pages ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMoreWords}
              >
                <Text style={styles.loadMoreText}>Load more words</Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076478.png' }}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyStateText}>
                {filter === 'all'
                  ? 'No words searched yet'
                  : filter === 'favorites'
                    ? 'No favorite words yet'
                    : 'No recent words yet'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {filter === 'all'
                  ? 'Search for a word or try a random one'
                  : filter === 'favorites'
                    ? 'Mark words as favorite to see them here'
                    : 'Search for words to see them here'}
              </Text>
            </View>
          }
        />
      ) : null}
    </SafeAreaView>
  );
}
