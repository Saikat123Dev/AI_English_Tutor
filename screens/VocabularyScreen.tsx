import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VocabularyScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample vocabulary words - you would likely fetch these from your API or database
  const [vocabularyWords, setVocabularyWords] = useState([
    { id: '1', word: 'Ubiquitous', definition: 'Present, appearing, or found everywhere.', example: 'Mobile phones are now ubiquitous in modern society.' },
    { id: '2', word: 'Ephemeral', definition: 'Lasting for a very short time.', example: 'The ephemeral nature of fashion trends makes it hard to keep up.' },
    { id: '3', word: 'Serendipity', definition: 'The occurrence of events by chance in a happy or beneficial way.', example: 'Finding that rare book was pure serendipity.' },
    { id: '4', word: 'Eloquent', definition: 'Fluent or persuasive in speaking or writing.', example: 'Her eloquent speech moved the entire audience.' },
    { id: '5', word: 'Resilience', definition: 'The capacity to recover quickly from difficulties.', example: 'The resilience of children often surprises adults.' },
  ]);

  const filteredWords = vocabularyWords.filter(item => 
    item.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderVocabularyItem = ({ item }) => (
    <TouchableOpacity style={styles.wordCard}>
      <Text style={styles.wordText}>{item.word}</Text>
      <Text style={styles.definitionText}>Definition: {item.definition}</Text>
      <Text style={styles.exampleText}>Example: {item.example}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vocabulary</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search words..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      
      {filteredWords.length > 0 ? (
        <FlatList
          data={filteredWords}
          renderItem={renderVocabularyItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No vocabulary words found</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add New Word</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#4A90E2',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  listContainer: {
    padding: 16,
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wordText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  definitionText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  exampleText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#777',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});