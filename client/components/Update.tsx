import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const UpdateChecker = ({ theme }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressAnimation = new Animated.Value(0);

  // Use the useUpdates hook from expo-updates
  const {
    isUpdateAvailable,
    isChecking,
    isDownloading,
    checkError
  } = Updates.useUpdates();

  const checkForUpdates = async () => {
    if (checking) return;

    try {
      setChecking(true);
      setError(null);

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdateAvailable(true);
        setModalVisible(true);
      }
    } catch (e) {
      setError(e);
      console.error('Error checking for updates:', e);
    } finally {
      setChecking(false);
    }
  };

  const simulateProgress = () => {
    // Reset progress
    setProgress(0);
    progressAnimation.setValue(0);

    // Animate to 95% over 2.5 seconds (simulating download)
    Animated.timing(progressAnimation, {
      toValue: 95,
      duration: 2500,
      useNativeDriver: false,
    }).start();

    // Update the progress state as the animation progresses
    progressAnimation.addListener(({ value }) => {
      setProgress(Math.floor(value));
    });
  };

  const downloadUpdate = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setUpdateInProgress(true);

      // Start progress animation
      simulateProgress();

      // Download the update
      await Updates.fetchUpdateAsync();

      // When complete, show 100%
      Animated.timing(progressAnimation, {
        toValue: 100,
        duration: 500,
        useNativeDriver: false,
      }).start();

      setProgress(100);

      // Show success for a moment before reloading
      setTimeout(() => {
        Updates.reloadAsync();
      }, 1000);
    } catch (e) {
      setError(e);
      setUpdateInProgress(false);
      setProgress(0);
      progressAnimation.setValue(0);
      console.error('Error downloading update:', e);
    }
  };

  const handleLater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
  };

  useEffect(() => {
    // Check for updates when the component mounts
    checkForUpdates();

    // Cleanup for animation listener
    return () => {
      progressAnimation.removeAllListeners();
    };
  }, []);

  // Update the UI state when the useUpdates hook detects changes
  useEffect(() => {
    if (isUpdateAvailable) {
      setUpdateAvailable(true);
      setModalVisible(true);
    }

    if (checkError) {
      setError(checkError);
    }

    if (isChecking) {
      setChecking(true);
    } else {
      setChecking(false);
    }

    if (isDownloading) {
      setUpdateInProgress(true);
    }
  }, [isUpdateAvailable, isChecking, isDownloading, checkError]);

  if (!updateAvailable && !error) {
    return null;
  }

  return (
    <>
      {updateAvailable && (
        <Pressable
          style={styles.updateBanner}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={['#07403b', '#1f8079']}
            style={styles.updateGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="update" size={20} color="#FFF" />
            <Text style={styles.updateText}>New update available!</Text>
          </LinearGradient>
        </Pressable>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => !updateInProgress && handleLater()}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme?.background || '#FFFFFF' }]}>
            <LinearGradient
              colors={['#041b1a', '#06403a']}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {updateInProgress ? (
                <MaterialCommunityIcons name="rocket-launch-outline" size={36} color="#FFF" />
              ) : (
                <MaterialCommunityIcons name="rocket-launch" size={36} color="#FFF" />
              )}
              <Text style={styles.modalTitle}>
                {updateInProgress ? 'Updating SELL...' : 'Update Available'}
              </Text>
            </LinearGradient>

            <Text style={[styles.modalDescription, { color: theme?.text || '#000000' }]}>
              {updateInProgress
                ? 'Please wait while we install the latest version. This will only take a moment.'
                : 'A new version of SELL is available. Update now to get the latest features and improvements!'}
            </Text>

            {updateInProgress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnimation.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%']
                        })
                      }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              {!updateInProgress && (
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleLater}
                >
                  <Text style={[styles.buttonText, { color: theme?.text || '#FFFFFF' }]}>Later</Text>
                </Pressable>
              )}

              {!updateInProgress ? (
                <Pressable
                  style={[styles.modalButton, styles.updateButton]}
                  onPress={downloadUpdate}
                >
                  <LinearGradient
                    colors={['#07403b', '#1f8079']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons name="download" size={18} color="#FFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Update Now</Text>
                  </LinearGradient>
                </Pressable>
              ) : progress === 100 ? (
                <View style={[styles.modalButton, styles.updateButton]}>
                  <LinearGradient
                    colors={['#07403b', '#1f8079']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons name="check" size={18} color="#FFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Restarting...</Text>
                  </LinearGradient>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  updateBanner: {
    margin: 14,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  updateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'center',
  },
  updateText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalHeader: {
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 10,
  },
  modalDescription: {
    fontSize: 16,
    padding: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1f8079',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f8079',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  updateButton: {
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default UpdateChecker;
