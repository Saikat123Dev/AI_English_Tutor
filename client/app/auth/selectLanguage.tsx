import { useUser } from '@clerk/clerk-expo';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  emoji: string;
}

const { width } = Dimensions.get('window');
const ANIMATION_DURATION = 400;
const API_URL = 'https://3b5b-2409-40e1-3102-6a82-5350-710c-4d20-c0f9.ngrok-free.app/api/auth/create';

const MotherTongueScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiSuccess, setApiSuccess] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const { user } = useUser();

  const languageOptions: LanguageOption[] = [
    { id: 'english', name: 'English', nativeName: 'English', emoji: '🇬🇧' },
    { id: 'spanish', name: 'Spanish', nativeName: 'Español', emoji: '🇪🇸' },
    { id: 'french', name: 'French', nativeName: 'Français', emoji: '🇫🇷' },
    { id: 'german', name: 'German', nativeName: 'Deutsch', emoji: '🇩🇪' },
    { id: 'chinese', name: 'Chinese', nativeName: '中文', emoji: '🇨🇳' },
    { id: 'japanese', name: 'Japanese', nativeName: '日本語', emoji: '🇯🇵' },
    { id: 'korean', name: 'Korean', nativeName: '한국어', emoji: '🇰🇷' },
    { id: 'arabic', name: 'Arabic', nativeName: 'العربية', emoji: '🇸🇦' },
    { id: 'hindi', name: 'Hindi', nativeName: 'हिन्दी', emoji: '🇮🇳' },
    { id: 'portuguese', name: 'Portuguese', nativeName: 'Português', emoji: '🇵🇹' },
  ];

  const filteredLanguages = searchQuery
    ? languageOptions.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : languageOptions;

  // Prevent going back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // Return true to prevent going back
    });

    return () => backHandler.remove();
  }, []);

  // Initial animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, []);

  // Save language selection to API
  const saveLanguageSelection = async () => {

    if (!selectedLanguage || !user?.primaryEmailAddress?.emailAddress) return false;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          "ngrok-skip-browser-warning": "true",
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.primaryEmailAddress.emailAddress,
          motherToung: selectedLanguage
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      console.log('API response:', data);
      return true;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  };

  const handleContinue = async () => {
    if (!selectedLanguage) return;

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 120,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start();

    try {
      setIsLoading(true);
      const success = await saveLanguageSelection();

      if (success) {
        setApiSuccess(true);
      } else {
        Alert.alert("Error", "Failed to save your selection. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save your selection. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateNext = () => {
    router.push('/auth/selectYourLanguage');
  };

  const handleSelectLanguage = (id: string) => {
    setSelectedLanguage(id);
  };

  const renderLanguageCard = ({ item }: { item: LanguageOption }) => {
    const isSelected = selectedLanguage === item.id;
    const scaleValue = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.98,
        useNativeDriver: true,
        friction: 8,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => handleSelectLanguage(item.id)}
      >
        <Animated.View style={[
          styles.languageCard,
          isSelected && styles.selectedCard,
          { transform: [{ scale: scaleValue }] }
        ]}>
          <View style={[
            styles.emojiContainer,
            isSelected && styles.selectedEmojiContainer
          ]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={[
              styles.languageName,
              isSelected && styles.selectedLanguageName
            ]}>{item.name}</Text>
            <Text style={[
              styles.nativeName,
              isSelected && styles.selectedNativeName
            ]}>{item.nativeName}</Text>
          </View>

          {isSelected ? (
            <View style={styles.checkmark}>
              <MaterialCommunityIcons name="check" size={16} color="#FFF" />
            </View>
          ) : (
            <View style={styles.radioOuter}>
              <View style={styles.radioInner} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {/* Back button removed to prevent navigation */}
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>Choose Your Language</Text>
          </View>
        </View>

        <LinearGradient
          colors={['rgba(249, 250, 254, 0.8)', 'rgba(255, 255, 255, 1)']}
          style={styles.content}
        >
          <View style={styles.illustration}>
            <LinearGradient
              colors={['#EEF2FF', '#E0E7FF']}
              style={styles.illustrationBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="translate" size={38} color="#6366F1" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>What is your mother tongue?</Text>
          <Text style={styles.subtitle}>
            We'll use this to personalize your learning experience
          </Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search languages..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredLanguages}
            renderItem={renderLanguageCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="magnify-close" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No languages found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            }
          />
        </LinearGradient>

        <View style={styles.footer}>
          {apiSuccess ? (
            <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleNavigateNext}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#4F46E5', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Next</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !selectedLanguage && styles.disabledButton,
                ]}
                onPress={handleContinue}
                disabled={!selectedLanguage || isLoading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={selectedLanguage ? ['#4F46E5', '#6366F1'] : ['#E5E7EB', '#F3F4F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={[
                    styles.buttonText,
                    !selectedLanguage && styles.disabledButtonText
                  ]}>
                    {isLoading ? 'Saving...' : 'Save Language'}
                  </Text>
                  {!isLoading && selectedLanguage && (
                    <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFD',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  illustration: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  illustrationBackground: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    paddingHorizontal: 20,
    letterSpacing: 0.1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 110,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  selectedCard: {
    borderColor: '#E0E7FF',
    backgroundColor: '#F5F7FF',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  selectedEmojiContainer: {
    backgroundColor: '#EEF2FF',
    borderColor: '#E0E7FF',
  },
  emoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  selectedLanguageName: {
    color: '#4F46E5',
  },
  nativeName: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },
  selectedNativeName: {
    color: '#6366F1',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    fontFamily: 'Inter_500Medium',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 24,
    backgroundColor: 'rgba(252, 252, 253, 0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.03)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
    letterSpacing: 0.1,
  },
  disabledButtonText: {
    color: '#9CA3AF',
    marginRight: 0,
  },
});

export default MotherTongueScreen;
