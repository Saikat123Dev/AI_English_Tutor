import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PronunciationScreen({ navigation }) {
  const [selectedWord, setSelectedWord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const pronunciationExamples = [
    { id: '1', word: 'Hello', phonetic: '/həˈloʊ/', audio: 'hello.mp3', difficulty: 'Easy' },
    { id: '2', word: 'World', phonetic: '/wɜːrld/', audio: 'world.mp3', difficulty: 'Easy' },
    { id: '3', word: 'Language', phonetic: '/ˈlæŋɡwɪdʒ/', audio: 'language.mp3', difficulty: 'Medium' },
    { id: '4', word: 'Practice', phonetic: '/ˈpræktɪs/', audio: 'practice.mp3', difficulty: 'Medium' },
    { id: '5', word: 'Pronunciation', phonetic: '/prəˌnʌnsiˈeɪʃn/', audio: 'pronunciation.mp3', difficulty: 'Hard' },
  ];
  
  const handlePlayAudio = () => {
    setIsPlaying(true);
    // Simulate audio playing
    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
  };
  
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
        onPress={() => setSelectedWord(item)}
      >
        <LinearGradient
          colors={isSelected ? ['#0ea5e9', '#3b82f6'] : ['#ffffff', '#f5f5f7']}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.wordText, isSelected && styles.selectedWordText]}>{item.word}</Text>
          <Text style={[styles.phoneticText, isSelected && styles.selectedPhoneticText]}>{item.phonetic}</Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Standard Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        
        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>Pronunciation Coach</Text>
        </View>
        
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="settings-outline" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Pronunciation Coach</Text>
          <Text style={styles.subtitle}>Master your speaking skills with guided practice</Text>
        </View>
        
        <View style={styles.wordsContainer}>
          <Text style={styles.sectionTitle}>Select a Word</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wordsList}
          >
            {pronunciationExamples.map(renderWordItem)}
          </ScrollView>
        </View>
        
        {selectedWord ? (
          <View style={styles.detailCard}>
            <Text style={styles.detailWord}>{selectedWord.word}</Text>
            <Text style={styles.detailPhonetic}>{selectedWord.phonetic}</Text>
            
            <View style={styles.audioControls}>
              <TouchableOpacity 
                style={[styles.playButton, isPlaying && styles.playingButton]}
                onPress={handlePlayAudio}
                activeOpacity={0.8}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="white" />
              </TouchableOpacity>
              <View style={styles.audioInfo}>
                <Text style={styles.playText}>{isPlaying ? "Playing..." : "Play Audio"}</Text>
                {isPlaying && (
                  <View style={styles.progressBar}>
                    <View style={styles.progressIndicator} />
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.instructionCard}>
              <View style={styles.instructionHeader}>
                <Ionicons name="information-circle-outline" size={22} color="#0ea5e9" />
                <Text style={styles.instructionTitle}>How to pronounce:</Text>
              </View>
              <View style={styles.instructionSteps}>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                  <Text style={styles.instructionText}>Listen to the audio carefully</Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                  <Text style={styles.instructionText}>Note the stress in phonetic spelling</Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                  <Text style={styles.instructionText}>Practice saying the word slowly</Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
                  <Text style={styles.instructionText}>Record and compare your pronunciation</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.recordButton} activeOpacity={0.8}>
              <Ionicons name="mic" size={22} color="white" />
              <Text style={styles.recordButtonText}>Record Yourself</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="mic-outline" size={60} color="#0ea5e9" />
            </View>
            <Text style={styles.placeholderText}>Select a word to practice pronunciation</Text>
            <Text style={styles.placeholderSubtext}>We'll guide you through perfect pronunciation</Text>
          </View>
        )}

        {/* Quick Action Button (replaces center button from footer) */}
        <TouchableOpacity style={styles.floatingButton} activeOpacity={0.8}>
          <Ionicons name="mic" size={28} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  // New Navbar Styles
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 15,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Extra padding for floating button
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 5,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  wordsContainer: {
    marginVertical: 16,
  },
  wordsList: {
    paddingHorizontal: 15,
    paddingBottom: 8,
  },
  wordCard: {
    marginHorizontal: 5,
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 130,
    height: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gradientCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedWordCard: {
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  selectedWordText: {
    color: 'white',
  },
  phoneticText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectedPhoneticText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  detailCard: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  detailWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  detailPhonetic: {
    fontSize: 24,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    marginHorizontal: 10,
  },
  playButton: {
    backgroundColor: '#0ea5e9',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playingButton: {
    backgroundColor: '#0284c7',
  },
  audioInfo: {
    flex: 1,
  },
  playText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  progressIndicator: {
    width: '50%',
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
  },
  instructionCard: {
    backgroundColor: '#f0f9ff',
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#334155',
  },
  instructionSteps: {
    gap: 12,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    backgroundColor: '#0ea5e9',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#334155',
    flex: 1,
  },
  recordButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  placeholderCard: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 20,
    padding: 24,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  placeholderIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  // New Floating Action Button (replacing center button from footer)
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#0ea5e9',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});