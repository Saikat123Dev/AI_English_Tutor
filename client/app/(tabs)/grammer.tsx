import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GrammarScreen() {
  const [selectedCategory, setSelectedCategory] = useState('basics');

  const grammarCategories = [
    { id: 'basics', title: 'Basics' },
    { id: 'tenses', title: 'Tenses' },
    { id: 'articles', title: 'Articles' },
    { id: 'prepositions', title: 'Prepositions' },
    { id: 'conjunctions', title: 'Conjunctions' },
  ];

  const grammarLessons = {
    basics: [
      { id: '1', title: 'Nouns', level: 'Beginner' },
      { id: '2', title: 'Pronouns', level: 'Beginner' },
      { id: '3', title: 'Adjectives', level: 'Beginner' },
      { id: '4', title: 'Adverbs', level: 'Intermediate' },
    ],
    tenses: [
      { id: '1', title: 'Present Simple', level: 'Beginner' },
      { id: '2', title: 'Present Continuous', level: 'Beginner' },
      { id: '3', title: 'Past Simple', level: 'Intermediate' },
      { id: '4', title: 'Future Tenses', level: 'Advanced' },
    ],
    articles: [
      { id: '1', title: 'Definite Articles', level: 'Beginner' },
      { id: '2', title: 'Indefinite Articles', level: 'Beginner' },
      { id: '3', title: 'Zero Article', level: 'Intermediate' },
    ],
    prepositions: [
      { id: '1', title: 'Prepositions of Place', level: 'Beginner' },
      { id: '2', title: 'Prepositions of Time', level: 'Intermediate' },
      { id: '3', title: 'Prepositions of Movement', level: 'Intermediate' },
    ],
    conjunctions: [
      { id: '1', title: 'Coordinating Conjunctions', level: 'Intermediate' },
      { id: '2', title: 'Subordinating Conjunctions', level: 'Advanced' },
    ],
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategory
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.selectedCategoryText
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderLessonCard = ({ item }) => (
    <TouchableOpacity style={styles.lessonCard}>
      <View style={styles.lessonCardContent}>
        <Text style={styles.lessonTitle}>{item.title}</Text>
        <View style={styles.lessonMeta}>
          <View style={[
            styles.levelIndicator,
            item.level === 'Beginner' ? styles.beginnerLevel :
            item.level === 'Intermediate' ? styles.intermediateLevel :
            styles.advancedLevel
          ]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
          <Text style={styles.lessonLength}>15 min</Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '0%' }]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grammar</Text>
        <Text style={styles.subtitle}>Master the rules of language</Text>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={grammarCategories}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <ScrollView style={styles.lessonsContainer}>
        <Text style={styles.sectionTitle}>{
          grammarCategories.find(cat => cat.id === selectedCategory)?.title
        } Lessons</Text>

        <FlatList
          data={grammarLessons[selectedCategory]}
          renderItem={renderLessonCard}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>Recommended Practice</Text>
          <TouchableOpacity style={styles.practiceCard}>
            <Text style={styles.practiceTitle}>Daily Grammar Quiz</Text>
            <Text style={styles.practiceDescription}>5 questions • 3 min</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343A40',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 4,
  },
  categoriesContainer: {
    paddingVertical: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
  },
  selectedCategory: {
    backgroundColor: '#228BE6',
  },
  categoryText: {
    fontSize: 14,
    color: '#495057',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  lessonsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 12,
    marginTop: 8,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lessonCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    flex: 1,
  },
  lessonMeta: {
    alignItems: 'flex-end',
  },
  levelIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  beginnerLevel: {
    backgroundColor: '#D3F9D8',
  },
  intermediateLevel: {
    backgroundColor: '#FFE8CC',
  },
  advancedLevel: {
    backgroundColor: '#FFD8D8',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lessonLength: {
    fontSize: 12,
    color: '#6C757D',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#228BE6',
  },
  recommendedSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  practiceCard: {
    backgroundColor: '#E7F5FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#228BE6',
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  practiceDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
  },
});
