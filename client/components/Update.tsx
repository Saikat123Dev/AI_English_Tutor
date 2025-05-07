import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const UpdateChecker = ({ theme }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateInProgress, setUpdateInProgress] = useState(false);

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

  const downloadUpdate = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setUpdateInProgress(true);

      // Download the update
      await Updates.fetchUpdateAsync();

      // Show success for a moment before reloading
      setTimeout(() => {
        Updates.reloadAsync();
      }, 1000);
    } catch (e) {
      setError(e);
      setUpdateInProgress(false);
      console.error('Error downloading update:', e);
    }
  };

  useEffect(() => {
    // Check for updates when the component mounts
    checkForUpdates();
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <LinearGradient
              colors={['#041b1a', '#06403a']}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="rocket-launch" size={36} color="#FFF" />
              <Text style={styles.modalTitle}>Update Available</Text>
            </LinearGradient>

            <Text style={[styles.modalDescription, { color: theme.text }]}>
              A new version of SELL is available. Update now to get the latest features and improvements!
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={updateInProgress}
              >
                <Text style={styles.buttonText}>Later</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.updateButton]}
                onPress={downloadUpdate}
                disabled={updateInProgress}
              >
                <LinearGradient
                  colors={['#07403b', '#1f8079']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {updateInProgress ? (
                    <Text style={styles.buttonText}>Updating...</Text>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="download" size={18} color="#FFF" style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>Update Now</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  updateButton: {
    overflow: 'hidden',
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
