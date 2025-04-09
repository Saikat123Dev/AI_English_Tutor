// // app/learning-goals.tsx
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import React, { useState } from 'react';
// import { Animated, Easing, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// interface GoalOption {
//   id: string;
//   title: string;
//   icon: string;
// }

// const LearningGoalsScreen = () => {
//   const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
//   const scaleValue = new Animated.Value(1);
//   const fadeAnim = useState(new Animated.Value(0))[0];

//   React.useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 500,
//       easing: Easing.ease,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const goalOptions: GoalOption[] = [
//     { id: 'travel', title: 'Prepare to travel', icon: '✈️' },
//     { id: 'education', title: 'Support my education', icon: '🎓' },
//     { id: 'career', title: 'Boost my career', icon: '💼' },
//     { id: 'connect', title: 'Connect with people', icon: '👥' },
//     { id: 'move', title: 'Move to another country', icon: '🌎' },
//   ];

//   const handleContinue = () => {
//     if (selectedGoals.length === 0) return;

//     Animated.sequence([
//       Animated.timing(scaleValue, {
//         toValue: 0.95,
//         duration: 100,
//         easing: Easing.ease,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scaleValue, {
//         toValue: 1,
//         duration: 200,
//         easing: Easing.ease,
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       router.push('/next-screen'); // Update with your actual route
//     });
//   };

//   const handleBack = () => {
//     router.back();
//   };

//   const handleToggleGoal = (id: string) => {
//     setSelectedGoals(prev =>
//       prev.includes(id)
//         ? prev.filter(goalId => goalId !== id)
//         : [...prev, id]
//     );
//   };

//   return (
//     <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color="#333" />
//           </TouchableOpacity>
//           <View style={styles.progressBar}>
//             <View style={[styles.progressFill, { width: '45%' }]} />
//           </View>
//         </View>

//         <ScrollView
//           style={styles.scrollContainer}
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.illustrationContainer}>
//             <Text style={styles.illustration}>🎯</Text>
//           </View>

//           <Text style={styles.title}>Why do you want to learn English?</Text>
//           <Text style={styles.subtitle}>
//             Lessons will be created to fit your goal
//           </Text>

//           <View style={styles.optionsContainer}>
//             {goalOptions.map((goal) => (
//               <TouchableOpacity
//                 key={goal.id}
//                 style={[
//                   styles.goalCard,
//                   selectedGoals.includes(goal.id) && styles.goalCardSelected,
//                 ]}
//                 onPress={() => handleToggleGoal(goal.id)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.goalIcon}>{goal.icon}</Text>
//                 <Text style={styles.goalTitle}>{goal.title}</Text>
//                 {selectedGoals.includes(goal.id) && (
//                   <View style={styles.checkmarkContainer}>
//                     <Ionicons name="checkmark-circle" size={24} color="#4E67EB" />
//                   </View>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>
//         </ScrollView>

//         <View style={styles.footer}>
//           <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleValue }] }]}>
//             <TouchableOpacity
//               style={[
//                 styles.continueButton,
//                 selectedGoals.length === 0 && styles.continueButtonDisabled
//               ]}
//               onPress={handleContinue}
//               disabled={selectedGoals.length === 0}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.continueButtonText}>Continue</Text>
//               <Ionicons name="arrow-forward" size={20} color="white" style={styles.continueIcon} />
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       </SafeAreaView>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9F9F9',
//   },
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingTop: 16,
//     paddingBottom: 8,
//   },
//   backButton: {
//     marginRight: 16,
//     padding: 4,
//   },
//   progressBar: {
//     flex: 1,
//     height: 4,
//     backgroundColor: '#E0E0E0',
//     borderRadius: 2,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: '#4E67EB',
//     borderRadius: 2,
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 24,
//     paddingBottom: 100, // Extra space for footer
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 24,
//     paddingBottom: 24,
//     backgroundColor: '#F9F9F9',
//   },
//   buttonContainer: {
//     width: '100%',
//   },
//   illustrationContainer: {
//     alignItems: 'center',
//     marginVertical: 24,
//   },
//   illustration: {
//     fontSize: 80,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 8,
//     fontFamily: 'Inter_700Bold',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 32,
//     lineHeight: 24,
//     fontFamily: 'Inter_400Regular',
//   },
//   optionsContainer: {
//     width: '100%',
//     marginBottom: 24,
//   },
//   goalCard: {
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//     alignItems: 'center',
//   },
//   goalCardSelected: {
//     backgroundColor: '#FAFAFA',
//     shadowColor: '#4E67EB',
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 4,
//     borderColor: '#4E67EB',
//     borderWidth: 1,
//   },
//   goalIcon: {
//     fontSize: 28,
//     marginRight: 16,
//   },
//   goalTitle: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     fontFamily: 'Inter_600SemiBold',
//   },
//   checkmarkContainer: {
//     marginLeft: 8,
//   },
//   continueButton: {
//     width: '100%',
//     backgroundColor: '#4E67EB',
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     shadowColor: '#4E67EB',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   continueButtonDisabled: {
//     backgroundColor: '#BDBDBD',
//     shadowColor: '#999',
//   },
//   continueButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//     fontFamily: 'Inter_600SemiBold',
//   },
//   continueIcon: {
//     marginLeft: 8,
//   },
// });

// export default LearningGoalsScreen;
