// // ProgressSection.js
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import React, { useEffect, useState } from 'react';
// import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// // Import your colors
// const COLORS = {
//   primary: '#09b3a6',       // Deeper, richer green
//   primaryDark: '#033330',   // Very dark green, almost black
//   primaryLight: '#9fd0cb',  // Soft, light green with more saturation
//   accent: '#047857',        // Forest green accent
//   accentLight: '#34d399',   // Mint green for highlights
//   background: '#0f292f',    // Dark teal-green background
//   backgroundDark: '#0a1f24', // Even darker background for contrast
//   card: '#103b3f',          // Dark card background with green tint
//   cardDark: '#072e30',      // Darker card variant
//   text: '#e6fff5',          // Light green-white text for dark backgrounds
//   textSecondary: '#a8e6d5', // Lighter green for secondary text
//   textTertiary: '#68c0ac',  // Medium light green for tertiary text
//   border: '#164e52',        // Darker green border for dark theme
//   borderDark: '#246b67',    // Medium green border with more contrast
//   error: '#f87171',         // Brighter red for visibility on dark backgrounds
//   success: '#10b981',       // Brighter green success for visibility
//   warning: '#fbbf24',       // Brighter amber warning for visibility
//   info: '#38bdf8',          // Brighter blue for info on dark backgrounds
//   white: '#ffffff',         // Unchanged
//   black: '#000000',         // Unchanged
//   grayLight: '#1a3e44',     // Dark gray with green tint
//   gray: '#112e33',          // Darker gray with green tint
//   grayDark: '#0d2226',      // Very dark gray with green tint
//   star: '#FFD700',          // Gold color for achievement stars
// };

// // Reusable SkillProgressCard component with star achievement
// function SkillProgressCard({ title, progress, total, icon, starCount = 0 }) {
//   const percentage = Math.min(100, Math.round((progress / total) * 100));
//   const isCompleted = percentage >= 100;

//   return (
//     <View style={[styles.skillCard, { backgroundColor: COLORS.card }]}>
//       <View style={styles.skillHeaderRow}>
//         <View style={[styles.skillIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
//           {icon}
//         </View>
//         <Text style={[styles.skillTitle, { color: COLORS.text }]}>{title}</Text>

//         {/* Display star count with star icons */}
//         {starCount > 0 && (
//           <View style={styles.starContainer}>
//             <Text style={styles.starCountText}>{starCount}</Text>
//             <MaterialCommunityIcons name="star" size={22} color={COLORS.star} style={styles.starIcon} />
//           </View>
//         )}

//         {/* Show achievement star for current cycle if completed */}
//         {isCompleted && (
//           <MaterialCommunityIcons name="star" size={24} color={COLORS.star} style={styles.currentStarIcon} />
//         )}
//       </View>

//       <View style={styles.skillProgressContainer}>
//         <View style={[styles.skillProgressBar, { backgroundColor: COLORS.grayLight }]}>
//           <View
//             style={[
//               styles.skillProgressFill,
//               {
//                 width: `${percentage}%`,
//                 backgroundColor: COLORS.primary
//               }
//             ]}
//           />
//         </View>
//         <Text style={[styles.skillProgressText, { color: COLORS.textSecondary }]}>
//           {progress} / {total} ({percentage}%)
//         </Text>
//       </View>
//     </View>
//   );
// }

// // Progress Section Component with 7-day cycle and star tracking
// function ProgressSection({ userStats, onTimerToggle, showTimer, userEmail }) {
//   const [timeRemaining, setTimeRemaining] = useState({
//     days: 0,
//     hours: 0,
//     minutes: 0,
//     seconds: 0,
//   });
//   const [lastResetTime, setLastResetTime] = useState(new Date().toISOString());
//   const [starCounts, setStarCounts] = useState({
//     pronunciation: 0,
//     vocabulary: 0,
//     learning: 0,
//     total: 0
//   });
//   const [progressStats, setProgressStats] = useState({
//     vocabularyCount: 0,
//     studySessionCount: 0,
//     learningProgressPercentage: 0
//   });
//   const [isLoading, setIsLoading] = useState(true);

//   // Fetch star data and timer info from API
//   const fetchStarData = async () => {
//     try {
//       const response = await fetch(`https://d289-2409-40e1-30d2-c7a5-8d4e-d1ae-5ad1-a3fb.ngrok-free.app/api/status?email=${encodeURIComponent(userEmail)}`);

//       if (!response.ok) {
//         throw new Error('Failed to fetch star data');
//       }

//       const data = await response.json();
//       console.log('Fetched star data:', data);

//       // Update state with fetched data
//       setStarCounts(data.stars);
//       setLastResetTime(data.timer.lastResetTime);
//       setTimeRemaining(data.timer.timeRemaining);

//       // Update progress stats if available
//       if (data.progress) {
//         setProgressStats(data.progress);
//       }

//       // Cache data for offline use
//       await AsyncStorage.setItem('@language_app_stars_data', JSON.stringify({
//         stars: data.stars,
//         progress: data.progress || {},
//         lastResetTime: data.timer.lastResetTime,
//         updatedAt: new Date().toISOString()
//       }));

//       setIsLoading(false);
//     } catch (error) {
//       console.error('Error fetching star data:', error);

//       // Try to load from cache if network request fails
//       try {
//         const cachedData = await AsyncStorage.getItem('@language_app_stars_data');
//         if (cachedData) {
//           const parsedData = JSON.parse(cachedData);
//           setStarCounts(parsedData.stars);
//           setLastResetTime(parsedData.lastResetTime);
//           if (parsedData.progress) {
//             setProgressStats(parsedData.progress);
//           }
//         }
//       } catch (cacheError) {
//         console.error('Error loading cached star data:', cacheError);
//       }

//       setIsLoading(false);
//     }
//   };

//   // Check if timer needs to be reset on app start
//   const checkTimerReset = async () => {
//     try {
//       const response = await fetch('https://d289-2409-40e1-30d2-c7a5-8d4e-d1ae-5ad1-a3fb.ngrok-free.app/api/status/check-reset', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email: userEmail })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to check timer reset');
//       }

//       const data = await response.json();
//       console.log('Timer reset check response:', data);

//       // If a reset occurred, show notification and update local data
//       if (data.wasReset) {
//         // Update state with new data
//         setStarCounts(data.stars);
//         setLastResetTime(data.timer.lastResetTime);
//         setTimeRemaining(data.timer.timeRemaining);

//         // Update progress stats if available
//         if (data.progress) {
//           setProgressStats(data.progress);
//         }

//         // Show notification about stars earned
//         const totalNewStars = data.newStars.total;
//         if (totalNewStars > 0) {
//           Alert.alert(
//             'Weekly Progress Reset',
//             `You've earned ${totalNewStars} new star${totalNewStars > 1 ? 's' : ''}! Your progress has been reset for a new week.`,
//             [{ text: 'Great!', style: 'default' }]
//           );
//         } else {
//           Alert.alert(
//             'Weekly Progress Reset',
//             'Your weekly progress has been reset for a new cycle.',
//             [{ text: 'OK', style: 'default' }]
//           );
//         }

//         // Cache the updated data
//         await AsyncStorage.setItem('@language_app_stars_data', JSON.stringify({
//           stars: data.stars,
//           progress: data.progress || {},
//           lastResetTime: data.timer.lastResetTime,
//           updatedAt: new Date().toISOString()
//         }));
//       } else {
//         // Just update the timer if no reset occurred
//         setTimeRemaining(data.timer.timeRemaining);

//         // Update progress stats if available
//         if (data.progress) {
//           setProgressStats(data.progress);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking timer reset:', error);
//       // Continue with local timer if API call fails
//     }
//   };

//   // Fetch stars on component mount
//   useEffect(() => {
//     fetchStarData();
//     // Also check if timer needs to be reset
//     checkTimerReset();
//   }, [userEmail]);

//   // Calculate time remaining until next reset
//   useEffect(() => {
//     const calculateTimeRemaining = () => {
//       // Get the current date and time
//       const now = new Date();

//       // Find when the next reset should happen (7 days from the last reset)
//       const lastReset = new Date(lastResetTime || now);
//       const nextResetTime = new Date(lastReset);
//       nextResetTime.setDate(nextResetTime.getDate() + 7);

//       // Calculate the difference
//       const diffTime = nextResetTime - now;

//       // If time is up, trigger reset check
//       if (diffTime <= 0) {
//         checkTimerReset();
//         return;
//       }

//       // Calculate days, hours, minutes, seconds
//       const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//       const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
//       const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

//       setTimeRemaining({ days, hours, minutes, seconds });
//     };

//     // Calculate immediately
//     calculateTimeRemaining();

//     // Then update every second
//     const interval = setInterval(calculateTimeRemaining, 1000);

//     // Clean up
//     return () => clearInterval(interval);
//   }, [lastResetTime]);

//   // Calculate the corrected learning progress from progress stats
//   // This ensures consistent progress counting like vocabulary
//   const getLearningProgress = () => {
//     // Use the server-provided learning progress percentage if available
//     if (progressStats && typeof progressStats.learningProgressPercentage === 'number') {
//       return progressStats.learningProgressPercentage;
//     }

//     // If not available, use a fallback calculation based on study sessions
//     if (progressStats && typeof progressStats.studySessionCount === 'number') {
//       // 10 study sessions = 100%
//       const studySessionGoal = 10;
//       return Math.min(100, Math.round((progressStats.studySessionCount / studySessionGoal) * 100));
//     }

//     // If no progress stats are available, use the user stats from props
//     // But ensure it's capped and doesn't increase too rapidly
//     return Math.min(100, userStats.learningProgress || 0);
//   };

//   return (
//     <View style={styles.sectionContainer}>
//       <View style={styles.progressSectionHeader}>
//         <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>MY PROGRESS</Text>

//         <TouchableOpacity
//           style={styles.timerButton}
//           onPress={onTimerToggle}
//         >
//           <MaterialCommunityIcons
//             name="timer-outline"
//             size={22}
//             color={COLORS.primary}
//           />
//           <Text style={styles.timerButtonText}>
//             {showTimer ? "Hide Timer" : "Show Timer"}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {showTimer && (
//         <View style={styles.timerContainer}>
//           <Text style={styles.timerText}>
//             Next reset in: {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
//           </Text>
//         </View>
//       )}

//       <SkillProgressCard
//         title="Vocabulary Building"
//         progress={userStats.vocabulary} // Use the vocabulary count from userStats
//         total={100}
//         icon={<MaterialCommunityIcons name="book-open-variant" size={20} color={COLORS.primary} />}
//         starCount={starCounts.vocabulary}
//       />

//       <SkillProgressCard
//         title="Learning Progress"
//         progress={getLearningProgress()} // Use the controlled learning progress calculation
//         total={50}
//         icon={<MaterialCommunityIcons name="school" size={20} color={COLORS.primary} />}
//         starCount={starCounts.learning}
//       />

//       {/* Study Session Display (for monitoring) */}
//       {__DEV__ && progressStats.studySessionCount !== undefined && (
//         <View style={styles.debugInfoContainer}>
//           <Text style={styles.debugInfoText}>
//             Study Sessions: {progressStats.studySessionCount}
//             {progressStats.learningProgressPercentage !== undefined ?
//               ` (${progressStats.learningProgressPercentage}%)` : ''}
//           </Text>
//         </View>
//       )}

//       {/* Total Stars Display */}
//       {starCounts.total > 0 && (
//         <View style={styles.totalStarsContainer}>
//           <Text style={styles.totalStarsText}>Total Stars: {starCounts.total}</Text>
//           <MaterialCommunityIcons name="star" size={20} color={COLORS.star} />
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginBottom: 24,
//     marginHorizontal: 16,
//   },
//   sectionTitle: {
//     fontSize: 13,
//     fontWeight: '600',
//     marginBottom: 12,
//     marginLeft: 4,
//     textTransform: 'uppercase',
//     letterSpacing: 1,
//     color: COLORS.textSecondary,
//   },
//   progressSectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   timerButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.card,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 16,
//     shadowColor: COLORS.primaryDark,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   timerButtonText: {
//     fontSize: 12,
//     marginLeft: 4,
//     color: COLORS.primary,
//     fontWeight: '500',
//   },
//   timerContainer: {
//     backgroundColor: COLORS.card,
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 12,
//     alignItems: 'center',
//     borderLeftWidth: 3,
//     borderLeftColor: COLORS.primary,
//   },
//   timerText: {
//     fontSize: 14,
//     color: COLORS.text,
//     fontWeight: '500',
//   },
//   skillCard: {
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 8,
//     backgroundColor: COLORS.card,
//     shadowColor: COLORS.primaryDark,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   skillHeaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   skillIconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//     backgroundColor: COLORS.primary + '20',
//   },
//   skillTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.text,
//     flex: 1,
//   },
//   skillProgressContainer: {
//     marginTop: 8,
//   },
//   skillProgressBar: {
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.grayLight,
//     overflow: 'hidden',
//     marginBottom: 6,
//   },
//   skillProgressFill: {
//     height: '100%',
//     borderRadius: 4,
//   },
//   skillProgressText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.textSecondary,
//     textAlign: 'right',
//   },
//   starIcon: {
//     marginLeft: 2,
//   },
//   currentStarIcon: {
//     marginLeft: 8,
//   },
//   starContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 8,
//     backgroundColor: COLORS.primaryDark + '40',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   starCountText: {
//     color: COLORS.text,
//     fontWeight: '700',
//     fontSize: 14,
//   },
//   totalStarsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     marginTop: 12,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     backgroundColor: COLORS.primaryDark + '40',
//     borderRadius: 20,
//     alignSelf: 'flex-end',
//   },
//   totalStarsText: {
//     color: COLORS.text,
//     fontWeight: '700',
//     fontSize: 16,
//     marginRight: 6,
//   },
//   debugInfoContainer: {
//     padding: 8,
//     backgroundColor: COLORS.cardDark,
//     borderRadius: 8,
//     marginTop: 8,
//     marginBottom: 8,
//   },
//   debugInfoText: {
//     color: COLORS.textTertiary,
//     fontSize: 12,
//   }
// });

// export default ProgressSection;
