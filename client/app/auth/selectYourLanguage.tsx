// app/language-level.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Easing, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LevelOption {
  id: string;
  level: string;
  code: string;
  description: string;
  icon: string;
  color: string;
}

const LanguageLevelScreen = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const scaleValue = new Animated.Value(1);

  const levelOptions: LevelOption[] = [
    {
      id: 'beginner',
      level: 'Beginner',
      code: 'A1',
      description: 'I can say hello, my name, and talk about what I do.',
      icon: '🌱',
      color: '#4CAF50',
    },
    {
      id: 'lower-intermediate',
      level: 'Lower Intermediate',
      code: 'A2',
      description: 'I can talk about my past and my plans comfortably.',
      icon: '🏊',
      color: '#2196F3',
    },
    {
      id: 'intermediate',
      level: 'Intermediate',
      code: 'B1',
      description: 'I can talk freely about everyday topics and my profession.',
      icon: '🚆',
      color: '#FF9800',
    },
    {
      id: 'upper-intermediate',
      level: 'Upper Intermediate',
      code: 'B2',
      description: 'I can talk about a broad range of topics with confidence.',
      icon: '🚀',
      color: '#9C27B0',
    },
  ];

  const handleContinue = () => {
    if (!selectedLevel) return;

    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/auth/learningGoal');
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleSelectLevel = (id: string) => {
    setSelectedLevel(id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '15%' }]} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.illustrationContainer}>
            <Text style={styles.illustration}>📚</Text>
          </View>

          <Text style={styles.title}>What is your level of English?</Text>
          <Text style={styles.subtitle}>
            AI Tutor will personalize lessons based on your proficiency
          </Text>

          <View style={styles.optionsContainer}>
            {levelOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedLevel === option.id && styles.optionCardSelected,
                  { borderLeftColor: option.color }
                ]}
                onPress={() => handleSelectLevel(option.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
                  <Text style={styles.emoji}>{option.icon}</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <View style={styles.levelHeader}>
                    <Text style={styles.levelTitle}>{option.level}</Text>
                    <Text style={[styles.levelCode, { color: option.color }]}>
                      {option.code}
                    </Text>
                  </View>
                  <Text style={styles.levelDescription}>{option.description}</Text>
                </View>
                {selectedLevel === option.id && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color={option.color} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
  <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleValue }] }]}>
    <TouchableOpacity
      style={[
        styles.continueButton,
        !selectedLevel && styles.continueButtonDisabled
      ]}
      onPress={handleContinue}
      disabled={!selectedLevel}
      activeOpacity={0.8}
    >
      <Text style={styles.continueButtonText}>Continue</Text>
      <Ionicons name="arrow-forward" size={20} color="white" style={styles.continueIcon} />
    </TouchableOpacity>
  </Animated.View>
</View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4E67EB',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 80, // Added padding to prevent content from being hidden behind footer
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#F9F9F9',
  },
  buttonContainer: {
    width: '100%',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  illustration: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  optionCardSelected: {
    backgroundColor: '#FAFAFA',
    shadowColor: '#4E67EB',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 24,
  },
  optionTextContainer: {
    flex: 1,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  levelCode: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  levelDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#4E67EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#4E67EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#BDBDBD',
    shadowColor: '#999',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  continueIcon: {
    marginLeft: 8,
  },
});

export default LanguageLevelScreen;
