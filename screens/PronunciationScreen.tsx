import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PronunciationScreen() {
  const [selectedWord, setSelectedWord] = useState(null);
  
  const pronunciationExamples = [
    { id: '1', word: 'Hello', phonetic: '/həˈloʊ/', audio: 'hello.mp3' },
    { id: '2', word: 'World', phonetic: '/wɜːrld/', audio: 'world.mp3' },
    { id: '3', word: 'Language', phonetic: '/ˈlæŋɡwɪdʒ/', audio: 'language.mp3' },
    { id: '4', word: 'Practice', phonetic: '/ˈpræktɪs/', audio: 'practice.mp3' },
    { id: '5', word: 'Pronunciation', phonetic: '/prəˌnʌnsiˈeɪʃn/', audio: 'pronunciation.mp3' },
  ];
  
  const renderWordItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.wordCard, selectedWord?.id === item.id && styles.selectedWordCard]} 
      onPress={() => setSelectedWord(item)}
    >
      <Text style={styles.wordText}>{item.word}</Text>
      <Text style={styles.phoneticText}>{item.phonetic}</Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pronunciation Practice</Text>
        <Text style={styles.subtitle}>Improve your pronunciation with these examples</Text>
      </View>
      
      <FlatList
        data={pronunciationExamples}
        renderItem={renderWordItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.wordsList}
        contentContainerStyle={styles.wordsListContent}
      />
      
      {selectedWord ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailWord}>{selectedWord.word}</Text>
          <Text style={styles.detailPhonetic}>{selectedWord.phonetic}</Text>
          
          <View style={styles.audioControls}>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.playText}>Play Audio</Text>
          </View>
          
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>How to pronounce:</Text>
            <Text style={styles.instructionText}>
              1. Listen to the audio carefully
              2. Pay attention to the stress marked in the phonetic spelling
              3. Practice saying the word slowly
              4. Record yourself and compare
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.placeholderCard}>
          <Ionicons name="mic-outline" size={60} color="#ccc" />
          <Text style={styles.placeholderText}>Select a word to practice pronunciation</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="mic" size={24} color="#555" />
          <Text style={styles.footerButtonText}>Record</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="list" size={24} color="#555" />
          <Text style={styles.footerButtonText}>Word List</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="settings-outline" size={24} color="#555" />
          <Text style={styles.footerButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  wordsList: {
    maxHeight: 100,
    marginVertical: 15,
  },
  wordsListContent: {
    paddingHorizontal: 15,
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedWordCard: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0ea5e9',
    borderWidth: 2,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  phoneticText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detailCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  detailPhonetic: {
    fontSize: 22,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  playButton: {
    backgroundColor: '#0ea5e9',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playText: {
    fontSize: 18,
    color: '#333',
  },
  instructionCard: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#555',
  },
  placeholderCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholderText: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
    paddingVertical: 12,
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    fontSize: 14,
    marginTop: 4,
    color: '#555',
  },
});