import { useUser } from '@clerk/clerk-expo';
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
  const [error, setError] = useState(null);
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
      checkDailyStreak();
      fetchVocabulary();
      fetchSearchHistory();
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
        `${API_BASE_URL}/words?filter=${filter}&email=${encodeURIComponent(email)}`,
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

      const data = await response.json();
      setVocabularyWords(data);

      // Extract favorites
      const favs = data.filter((word) => word.isFavorite).map((word) => word.word);
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
        `${API_BASE_URL}/search-history?email=${encodeURIComponent(email)}`,
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

  const checkDailyStreak = async () => {
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

      const { streak } = await response.json();
      setDailyStreak(streak);
    } catch (err) {
      console.error('Failed to fetch streak', err);
      setError(err.message);
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
    }
  };

  const handleRandomWord = async () => {
    if (randomWords.length === 0) {
      setError('No random words available');
      return;
    }

    const randomIndex = Math.floor(Math.random() * randomWords.length);
    const randomWord = randomWords[randomIndex];
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

      const { isFavorite } = await response.json();

      // Update local state
      if (isFavorite) {
        setFavorites((prev) => [...prev, word]);
      } else {
        setFavorites((prev) => prev.filter((w) => w !== word));
      }
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

        const session = await response.json();
        setCurrentSessionId(session.id);
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

        const session = await response.json();
        setCurrentSessionId(session.id);
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
    <View key={meaning.partOfSpeech} style={styles.meaningContainer}>
      <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>
      {meaning.definitions.slice(0, 3).map((def, idx) => (
        <View key={idx} style={styles.definitionContainer}>
          <Text style={styles.definitionText}>• {def.definition}</Text>
          {def.example && <Text style={styles.exampleText}>Example: "{def.example}"</Text>}
          {def.synonyms && def.synonyms.length > 0 && (
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
        <Text style={styles.wordText}>{item.word}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png' }}
          style={styles.logo}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Vocabulary Builder</Text>
          <View style={styles.streakContainer}>
            <Icon name='local-fire-department' size={16} color='#FFD700' />
            <Text style={styles.streakText}>{dailyStreak} day streak</Text>
          </View>
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
                <Icon name='casino' size={24} color='#4A90E2' />
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
          data={filteredWords}
          renderItem={renderVocabularyItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
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

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4A90E2',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  streakText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
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
    backgroundColor: '#EEF2F7',
  },
  activeFilter: {
    backgroundColor: '#4A90E2',
  },
  filterText: {
    color: '#7F8C8D',
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
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  flashcardButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#5DA271',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFEEEE',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#FF6B6B',
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wordCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
    color: '#2C3E50',
  },
  phoneticText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  quickDefinition: {
    fontSize: 14,
    color: '#555',
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
    opacity: 0.8,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  wordDetailContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
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
    color: '#2C3E50',
  },
  detailPhoneticText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 4,
  },
  favoriteButton: {
    padding: 8,
  },
  originContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  originLabel: {
    fontWeight: '600',
    color: '#34495E',
    marginRight: 8,
  },
  originText: {
    flex: 1,
    color: '#2C3E50',
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
    color: '#4A90E2',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  definitionContainer: {
    marginBottom: 12,
  },
  definitionText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  synonymsText: {
    fontSize: 14,
    color: '#16A085',
    marginLeft: 16,
    marginTop: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#4A90E2',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  studyContainer: {
    flex: 1,
    padding: 16,
  },
  studyProgress: {
    alignItems: 'center',
    marginBottom: 16,
  },
  studyProgressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  flashcardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  flashcardWord: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  flashcardPhonetic: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 16,
  },
  revealButton: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  revealButtonText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  definitionReveal: {
    marginTop: 16,
    alignItems: 'center',
  },
  flashcardDefinition: {
    fontSize: 18,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 26,
  },
  flashcardPartOfSpeech: {
    fontStyle: 'italic',
    color: '#4A90E2',
    fontWeight: '600',
  },
  flashcardExample: {
    fontSize: 16,
    color: '#7F8C8D',
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    color: '#4A90E2',
    marginHorizontal: 8,
  },
  disabledText: {
    color: '#BDC3C7',
  },
  exitStudyButton: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  exitStudyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  flashcard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  flashcardContent: {
    alignItems: 'center',
  },
  flipPrompt: {
    color: '#95A5A6',
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
    backgroundColor: 'white',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});
