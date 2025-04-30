import { SignedIn, useClerk, useUser } from '@clerk/clerk-expo';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const SettingsScreen = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    motherToung: '',
    englishLevel: '',
    learningGoal: '',
    interests: '',
    focus: '',
    voice: '',
    occupation: '',
    studyTime: '',
    preferredTopics: '',
    challengeAreas: '',
    learningStyle: '',
    practiceFrequency: '',
    vocabularyLevel: '',
    grammarKnowledge: '',
    previousExperience: '',
    preferredContentType: '',
    spokenAccent: '',
  });

  const englishLevels = ['Beginner', 'Intermediate', 'Advanced', 'Fluent'];
  const learningGoals = ['Conversation', 'Business', 'Academic', 'Travel', 'Exam Preparation'];
  const voices = ['Male', 'Female', 'Neutral'];
  const studyTimes = ['Morning', 'Afternoon', 'Evening', 'Night', 'Weekends'];
  const learningStyles = ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'];
  const practiceFrequencies = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'];
  const vocabularyLevels = ['Basic', 'Intermediate', 'Advanced', 'Academic'];
  const grammarKnowledgeLevels = ['Basic', 'Intermediate', 'Advanced', 'Expert'];
  const accents = ['American', 'British', 'Australian', 'Canadian', 'Indian', 'Other'];

  useEffect(() => {
    if (user) {
      const metadata = user.unsafeMetadata || {};
      const formatArrayField = (field: string | string[]) => {
        if (Array.isArray(field)) return field.join(', ');
        return field || '';
      };

      setFormData({
        name: user.fullName || '',
        motherToung: metadata.motherToung || metadata.motherTongue || '',
        englishLevel: metadata.englishLevel || '',
        learningGoal: metadata.learningGoal || '',
        interests: metadata.interests || '',
        focus: metadata.focus || '',
        voice: metadata.voice || '',
        occupation: metadata.occupation || '',
        studyTime: metadata.studyTime || '',
        preferredTopics: formatArrayField(metadata.preferredTopics || ''),
        challengeAreas: formatArrayField(metadata.challengeAreas || ''),
        learningStyle: metadata.learningStyle || '',
        practiceFrequency: metadata.practiceFrequency || '',
        vocabularyLevel: metadata.vocabularyLevel || '',
        grammarKnowledge: metadata.grammarKnowledge || '',
        previousExperience: metadata.previousExperience || '',
        preferredContentType: formatArrayField(metadata.preferredContentType || ''),
        spokenAccent: metadata.spokenAccent || '',
      });
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    Haptics.selectionAsync();
    try {
      if (!user) throw new Error('User not found');
      const updateData = {
        motherToung: formData.motherToung,
        englishLevel: formData.englishLevel,
        learningGoal: formData.learningGoal,
        interests: formData.interests,
        focus: formData.focus,
        voice: formData.voice,
        occupation: formData.occupation,
        studyTime: formData.studyTime,
        preferredTopics: formData.preferredTopics.split(',').map(t => t.trim()),
        challengeAreas: formData.challengeAreas.split(',').map(t => t.trim()),
        learningStyle: formData.learningStyle,
        practiceFrequency: formData.practiceFrequency,
        vocabularyLevel: formData.vocabularyLevel,
        grammarKnowledge: formData.grammarKnowledge,
        previousExperience: formData.previousExperience,
        preferredContentType: formData.preferredContentType.split(',').map(t => t.trim()),
        spokenAccent: formData.spokenAccent,
      };
      await user.update({ unsafeMetadata: updateData });
      Alert.alert('Success', 'Your settings have been saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    signOut();
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#e0f7fa', '#b2ebf2']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796b" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </LinearGradient>
    );
  }

  const renderInputField = (label: string, field: string, placeholder: string, icon: string, multiline: boolean = false) => (
    <Animated.View entering={FadeInDown} style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <MaterialIcons name={icon} size={18} color="#00796b" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={formData[field]}
        onChangeText={(text) => handleInputChange(field, text)}
        placeholder={placeholder}
        placeholderTextColor="#90a4ae"
        multiline={multiline}
        accessibilityLabel={label}
      />
    </Animated.View>
  );

  const renderPickerField = (label: string, field: string, placeholder: string, options: string[], icon: string) => (
    <Animated.View entering={FadeInDown} style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <MaterialIcons name={icon} size={18} color="#00796b" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData[field]}
          onValueChange={(itemValue) => handleInputChange(field, itemValue)}
          style={styles.picker}
          dropdownIconColor="#00796b"
          accessibilityLabel={label}
        >
          <Picker.Item label={placeholder} value="" color="#90a4ae" />
          {options.map((option) => (
            <Picker.Item key={option} label={option} value={option.toLowerCase()} color="#424242" />
          ))}
        </Picker>
      </View>
    </Animated.View>
  );

  return (
    <SignedIn>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <LinearGradient colors={['#e0f7fa', '#b2ebf2']} style={styles.container}>
          <View style={styles.headerContainer}>
            <BlurView intensity={100} style={styles.header}>
              <MaterialIcons name="settings" size={28} color="#ffffff" />
              <Text style={styles.headerText}>Profile Settings</Text>
            </BlurView>
          </View>

          <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInUp} style={styles.profileHeader}>
              <BlurView intensity={50} style={styles.profileHeaderBlur}>
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <MaterialIcons name="person" size={40} color="#00796b" />
                  </View>
                )}
                <View style={styles.profileTextContainer}>
                  <Text style={styles.profileName}>{user?.fullName || 'User'}</Text>
                  <View style={styles.emailContainer}>
                    <MaterialIcons name="email" size={14} color="#90a4ae" />
                    <Text style={styles.profileEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
                  </View>
                </View>
              </BlurView>
            </Animated.View>

            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <FontAwesome5 name="user-alt" size={16} color="#00796b" />
                <Text style={styles.sectionTitle}>Basic Information</Text>
              </View>
              {renderInputField('Name', 'name', 'Enter your name', 'person')}
              {renderInputField('Mother Tongue', 'motherToung', 'Enter your native language', 'language')}
              {renderPickerField('English Level', 'englishLevel', 'Select your English level', englishLevels, 'school')}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <FontAwesome5 name="graduation-cap" size={16} color="#00796b" />
                <Text style={styles.sectionTitle}>Learning Preferences</Text>
              </View>
              {renderInputField('Learning Goal', 'learningGoal', 'Enter your learning goal', 'flag')}
              {renderInputField('Interests', 'interests', 'Enter your interests (comma separated)', 'favorite', true)}
              {renderInputField('Focus Area', 'focus', 'What do you want to focus on?', 'center-focus-strong')}
              {renderPickerField('Preferred Voice', 'voice', 'Select preferred voice', voices, 'record-voice-over')}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <FontAwesome5 name="book-reader" size={16} color="#00796b" />
                <Text style={styles.sectionTitle}>Study Details</Text>
              </View>
              {renderInputField('Occupation', 'occupation', 'Enter your occupation', 'work')}
              {renderInputField('Challenge Areas', 'challengeAreas', 'Enter areas you find challenging (comma separated)', 'trending-up', true)}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <FontAwesome5 name="brain" size={16} color="#00796b" />
                <Text style={styles.sectionTitle}>Learning Style</Text>
              </View>
              {renderPickerField('Vocabulary Level', 'vocabularyLevel', 'Select vocabulary level', vocabularyLevels, 'library-books')}
              {renderPickerField('Grammar Knowledge', 'grammarKnowledge', 'Select grammar knowledge level', grammarKnowledgeLevels, 'spellcheck')}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <FontAwesome5 name="info-circle" size={16} color="#00796b" />
                <Text style={styles.sectionTitle}>Additional Information</Text>
              </View>
              {renderInputField('Previous Experience', 'previousExperience', 'Describe your previous English learning experience', 'history', true)}
              {renderInputField('Preferred Content Type', 'preferredContentType', 'Enter content types you prefer (comma separated)', 'folder', true)}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#00796b', '#0288d1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <MaterialIcons name="save" size={20} color="#ffffff" />
                      <Text style={styles.buttonText}>Save Changes</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <MaterialIcons name="logout" size={20} color="#d32f2f" />
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SignedIn>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#00796b',
    fontWeight: '600',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'rgba(0, 121, 107, 0.8)',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  profileHeader: {
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileHeaderBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#00796b',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00796b',
  },
  profileTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00796b',
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileEmail: {
    fontSize: 14,
    color: '#90a4ae',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0f7fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00796b',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginLeft: 6,
  },
  input: {
    backgroundColor: '#f5f6f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#212121',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f5f6f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#212121',
  },
  buttonContainer: {
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  saveButton: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#00796b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d32f2f',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});

export default SettingsScreen;
