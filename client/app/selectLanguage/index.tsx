import { useUser } from '@clerk/clerk-react';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const { width, height } = Dimensions.get('window');

const CompleteProfileScreen = () => {
  const { user } = useUser();
  const navigation = useNavigation();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Slightly smaller initial scale for bounce effect
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(220)).current; // Increased height for more elegance
  const formOpacity = useRef(new Animated.Value(0)).current;

  // Dropdown open states
  const [motherTongueOpen, setMotherTongueOpen] = useState(false);
  const [englishLevelOpen, setEnglishLevelOpen] = useState(false);
  const [learningGoalOpen, setLearningGoalOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);

   console.log(user?.emailAddresses[0]?.emailAddress)
  // Initial form state
  const [formData, setFormData] = useState({
    email: user?.emailAddresses[0]?.emailAddress || '',
    motherTongue: '',
    englishLevel: '',
    learningGoal: '',
    interests: '',
    focus: '',
  });

  // Dropdown options
  const [motherTongueOptions] = useState([
    { label: 'English', value: 'english' },
    { label: 'Spanish', value: 'spanish' },
    { label: 'French', value: 'french' },
    { label: 'German', value: 'german' },
    { label: 'Chinese', value: 'chinese' },
    { label: 'Japanese', value: 'japanese' },
    { label: 'Russian', value: 'russian' },
    { label: 'Arabic', value: 'arabic' },
    { label: 'Other', value: 'other' },
  ]);

  const [englishLevelOptions] = useState([
    { label: 'Beginner', value: 'beginner' },
    { label: 'Elementary', value: 'elementary' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Upper Intermediate', value: 'upper_intermediate' },
    { label: 'Advanced', value: 'advanced' },
    { label: 'Proficient', value: 'proficient' },
  ]);

  const [learningGoalOptions] = useState([
    { label: 'Daily Conversation', value: 'daily_conversation' },
    { label: 'Business English', value: 'business_english' },
    { label: 'Academic English', value: 'academic_english' },
    { label: 'Travel', value: 'travel' },
    { label: 'Exam Preparation', value: 'exam_preparation' },
    { label: 'Other', value: 'other' },
  ]);

  const [focusOptions] = useState([
    { label: 'Speaking', value: 'speaking' },
    { label: 'Listening', value: 'listening' },
    { label: 'Reading', value: 'reading' },
    { label: 'Writing', value: 'writing' },
    { label: 'Grammar', value: 'grammar' },
    { label: 'Vocabulary', value: 'vocabulary' },
  ]);


  const [loading, setLoading] = useState(false);
  const [interestsArray, setInterestsArray] = useState([]);
  const [interestInput, setInterestInput] = useState('');
  const [formStage, setFormStage] = useState('initial');
  const [progress, setProgress] = useState(0);
  const [headerHeightValue, setHeaderHeightValue] = useState(220);

  // Animation interpolations
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shimmer = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0%', '100%', '0%'],
  });

  // Animation functions
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const startSpinAnimation = () => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  };

  const startShimmerAnimation = () => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ).start();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    startPulseAnimation();
    startSpinAnimation();
    startShimmerAnimation();
  }, [fadeAnim, slideAnim, scaleAnim, formOpacity]);

  useEffect(() => {
    const filledFields = Object.values(formData).filter((val) => val !== '').length;
    const totalFields = Object.keys(formData).length;
    const newProgress = (filledFields / totalFields) * 100;

    setProgress(newProgress);
    Animated.timing(progressAnim, {
      toValue: newProgress / 100,
      duration: 600,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [formData]);

  const addInterest = () => {
    if (interestInput.trim() && !interestsArray.includes(interestInput.trim())) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newInterests = [...interestsArray, interestInput.trim()];
      setInterestsArray(newInterests);
      setFormData((prev) => ({
        ...prev,
        interests: newInterests.join(', '),
      }));
      setInterestInput('');
    }
  };

  const removeInterest = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newInterests = [...interestsArray];
    newInterests.splice(index, 1);
    setInterestsArray(newInterests);
    setFormData((prev) => ({
      ...prev,
      interests: newInterests.join(', '),
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDropdownToggle = (setter, isOpen) => {
    Haptics.selectionAsync();
    setter(isOpen);
    setHeaderHeightValue(isOpen ? 180 : 220);
  };

  const handleSubmit = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLoading(true);
      setFormStage('submitting');

      setTimeout(async () => {
        try {
          const response = await fetch('https://ai-english-tutor-9ixt.onrender.com/api/auth/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to update profile');
          }

          setFormStage('success');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          setTimeout(() => {
            router.push('/(tabs)');
          }, 1500);
        } catch (error) {
          console.error('Error completing profile:', error);
          setFormStage('error');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setTimeout(() => {
            setFormStage('initial');
            setLoading(false);
          }, 1500);
        }
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoading(false);
      setFormStage('error');
    }
  };

  const FloatingParticles = ({ count = 30 }) => {
    const particles = Array(count)
      .fill(0)
      .map((_, i) => {
        const size = Math.random() * 15 + 5; // Varied sizes for diversity
        const posX = Math.random() * width;
        const posY = Math.random() * height;
        const duration = Math.random() * 12000 + 6000;
        const delay = Math.random() * 6000;
        const opacity = Math.random() * 0.5 + 0.2;

        const translateX = new Animated.Value(0);
        const translateY = new Animated.Value(0);

        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: Math.random() * 150 - 75,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: Math.random() * 150 - 75,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ]),
        ).start();

        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: posX,
              top: posY,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: `rgba(147, 112, 219, ${opacity})`, // Richer purple shade
              transform: [{ translateX }, { translateY }],
            }}
          />
        );
      });

    return <>{particles}</>;
  };

  const formFields = [

    {
      id: 'motherTongue',
      type: 'dropdown',
      label: 'Mother Tongue',
      icon: 'language',
      value: formData.motherTongue,
      open: motherTongueOpen,
      setOpen: setMotherTongueOpen,
      items: motherTongueOptions,
      placeholder: 'Select your native language',
      zIndex: 5000,
      zIndexInverse: 1000,
    },
    {
      id: 'englishLevel',
      type: 'dropdown',
      label: 'English Proficiency',
      icon: 'chart-line',
      iconType: 'FontAwesome5',
      value: formData.englishLevel,
      open: englishLevelOpen,
      setOpen: setEnglishLevelOpen,
      items: englishLevelOptions,
      placeholder: 'Select your current level',
      zIndex: 4000,
      zIndexInverse: 2000,
    },
    {
      id: 'learningGoal',
      type: 'dropdown',
      label: 'Learning Objective',
      icon: 'trophy',
      iconType: 'Ionicons',
      value: formData.learningGoal,
      open: learningGoalOpen,
      setOpen: setLearningGoalOpen,
      items: learningGoalOptions,
      placeholder: 'What do you want to achieve?',
      zIndex: 3000,
      zIndexInverse: 3000,
    },
    {
      id: 'interests',
      type: 'interests',
      label: 'Personal Interests',
      icon: 'heart',
      iconType: 'Ionicons',
      value: formData.interests,
      interestInput,
      setInterestInput,
      interestsArray,
      addInterest,
      removeInterest,
    },
    {
      id: 'focus',
      type: 'dropdown',
      label: 'Focus Area',
      icon: 'center-focus-strong',
      value: formData.focus,
      open: focusOpen,
      setOpen: setFocusOpen,
      items: focusOptions,
      placeholder: 'Your main focus area',
      zIndex: 2000,
      zIndexInverse: 4000,
    },

  ];

  const renderFormField = ({ item }) => {
    const IconComponent = item.iconType
      ? item.iconType === 'FontAwesome5'
        ? FontAwesome5
        : item.iconType === 'Ionicons'
        ? Ionicons
        : item.iconType === 'MaterialCommunityIcons'
        ? MaterialCommunityIcons
        : MaterialIcons
      : MaterialIcons;

    if (item.type === 'input') {
      return (
        <View style={styles.formGroup}>
          <View style={styles.labelContainer}>
            <IconComponent name={item.icon} size={22} color="#8B5CF6" />
            <Text style={styles.label}>{item.label}</Text>
          </View>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={item.value}
            editable={item.editable}
          />
        </View>
      );
    }

    if (item.type === 'dropdown') {
      return (
        <View style={styles.formGroup}>
          <View style={styles.labelContainer}>
            <IconComponent name={item.icon} size={22} color="#8B5CF6" />
            <Text style={styles.label}>{item.label}</Text>
          </View>
          <DropDownPicker
            open={item.open}
            value={item.value}
            items={item.items}
            setOpen={() => handleDropdownToggle(item.setOpen, !item.open)}
            setValue={(callback) => {
              const value = callback(formData[item.id]);
              handleChange(item.id, value);
            }}
            placeholder={item.placeholder}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            zIndex={item.zIndex}
            zIndexInverse={item.zIndexInverse}
            onSelectItem={() => Haptics.selectionAsync()}
            textStyle={styles.dropdownText}
            dropDownDirection="AUTO"
          />
        </View>
      );
    }

    if (item.type === 'interests') {
      return (
        <View style={styles.formGroup}>
          <View style={styles.labelContainer}>
            <Ionicons name={item.icon} size={22} color="#8B5CF6" />
            <Text style={styles.label}>{item.label}</Text>
          </View>
          <View style={styles.interestsContainer}>
            <View style={styles.interestInputContainer}>
              <TextInput
                style={styles.interestInput}
                value={item.interestInput}
                onChangeText={item.setInterestInput}
                placeholder="Add your interests"
                onSubmitEditing={item.addInterest}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={item.addInterest}
                activeOpacity={0.7}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.interestTags}>
              {item.interestsArray.map((interest, index) => (
                <Animated.View
                  key={index}
                  style={styles.interestTag}
                  entering={Animated.spring({
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                  })}
                  exiting={Animated.timing({
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  })}>
                  <Text style={styles.interestTagText}>{interest}</Text>
                  <TouchableOpacity onPress={() => item.removeInterest(index)} activeOpacity={0.7}>
                    <Ionicons name="close-circle" size={18} color="#8B5CF6" />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar hidden={true} />
        <FloatingParticles count={20} />
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialIcons name="language" size={50} color="#8B5CF6" />
        </Animated.View>
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <LinearGradient
        colors={['#6B46C1', '#ED64A6']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <FloatingParticles count={30} />
      </LinearGradient>

      <Animated.View
        style={[
          styles.headerContainer,
          {
            height: headerHeightValue,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            style={styles.iconCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <MaterialIcons name="person" size={45} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Let’s personalize your learning journey with a few details!
        </Text>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: '#ED64A6',
              },
            ]}>
            <Animated.View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                width: shimmer,
              }}
            />
          </Animated.View>
          <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
        <FlatList
          data={formFields}
          renderItem={renderFormField}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled,
            formStage === 'success' && styles.successButton,
            formStage === 'error' && styles.errorButton,
          ]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}>
          <LinearGradient
            colors={
              formStage === 'success'
                ? ['#48BB78', '#38A169']
                : formStage === 'error'
                ? ['#F56565', '#E53E3E']
                : ['#8B5CF6', '#EC4899']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.linearGradient}>
            {formStage === 'submitting' ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <ActivityIndicator size="small" color="white" />
              </Animated.View>
            ) : formStage === 'success' ? (
              <>
                <Feather name="check-circle" size={22} color="white" style={styles.buttonIcon} />
                <Text style={styles.submitButtonText}>Profile Completed!</Text>
              </>
            ) : formStage === 'error' ? (
              <>
                <Feather name="alert-circle" size={22} color="white" style={styles.buttonIcon} />
                <Text style={styles.submitButtonText}>Try Again</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="check-circle" size={22} color="white" style={styles.buttonIcon} />
                <Text style={styles.submitButtonText}>Complete Profile</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#4A5568',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 15,
    zIndex: 1,
    backdropFilter: 'blur(10px)', // Glassmorphism effect (if supported)
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2D3748',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    marginBottom: 10,
    textShadowColor: 'rgba(139, 92, 246, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    maxWidth: '80%',
  },
  progressBarContainer: {
    width: '90%',
    height: 12,
    backgroundColor: 'rgba(226, 232, 240, 0.5)',
    borderRadius: 6,
    marginTop: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B5CF6',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    paddingTop: 40,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -15 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 10,
    backdropFilter: 'blur(5px)', // Glassmorphism effect
  },
  formContent: {
    paddingBottom: 30,
  },
  formGroup: {
    marginBottom: 30,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 10,
    fontFamily: 'Inter-SemiBold',
  },
  input: {
    borderWidth: 1.5,
    borderColor: 'rgba(203, 213, 225, 0.5)',
    borderRadius: 15,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledInput: {
    backgroundColor: 'rgba(249, 250, 251, 0.6)',
    color: '#718096',
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: 'rgba(203, 213, 225, 0.5)',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    minHeight: 55,
    fontFamily: 'Inter-Regular',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownContainer: {
    borderWidth: 1.5,
    borderColor: 'rgba(203, 213, 225, 0.5)',
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  dropdownText: {
    color: '#2D3748',
    fontFamily: 'Inter-Regular',
  },
  interestsContainer: {
    marginTop: 8,
  },
  interestInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(203, 213, 225, 0.5)',
    borderRadius: 15,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(179, 159, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  interestTagText: {
    color: '#8B5CF6',
    marginRight: 8,
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  submitButton: {
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 40,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    height: 60,
  },
  linearGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  successButton: {
    shadowColor: '#48BB78',
  },
  errorButton: {
    shadowColor: '#F56565',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  buttonIcon: {
    marginRight: 12,
  },
});

export default CompleteProfileScreen;
