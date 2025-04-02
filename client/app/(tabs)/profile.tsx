import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/theme/ThemeProvider';

interface ProfileOptionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  showChevron?: boolean;
  isLast?: boolean;
}

function ProfileOption({ title, icon, onPress, showChevron = true, isLast = false }: ProfileOptionProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.option,
        {
          backgroundColor: colors.card,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <View style={[styles.optionIconContainer, { backgroundColor: colors.primary + '20' }]}>
          {icon}
        </View>
        <Text style={[styles.optionText, { color: colors.text }]}>{title}</Text>
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useAuth();
  const navigation = useNavigation();
  const { colors, isDark, toggleTheme } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: handleSignOut, style: 'destructive' }
      ]
    );
  };

  if (!isUserLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark || colors.primary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.avatarContainer, {
            borderColor: colors.background,
            backgroundColor: colors.background + '80'
          }]}>
            <Text style={[styles.avatarText, { color: colors.text }]}>
              {user?.firstName?.[0]?.toUpperCase() || user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.emailAddresses[0]?.emailAddress || 'User'}
          </Text>
          <Text style={[styles.email, { color: colors.text }]}>
            {user?.emailAddresses[0]?.emailAddress || ''}
          </Text>
        </LinearGradient>

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>

          <ProfileOption
            title="Edit Profile"
            icon={<Ionicons name="person-outline" size={20} color={colors.primary} />}
            onPress={() => navigation.navigate('EditProfile' as never)}
          />

          <ProfileOption
            title="Preferences"
            icon={<Ionicons name="settings-outline" size={20} color={colors.primary} />}
            onPress={() => navigation.navigate('Preferences' as never)}
          />

          <ProfileOption
            title={`Dark Mode: ${isDark ? 'On' : 'Off'}`}
            icon={<Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.primary} />}
            onPress={toggleTheme}
            showChevron={false}
            isLast={true}
          />
        </View>

        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Support</Text>

          <ProfileOption
            title="Help Center"
            icon={<Ionicons name="help-circle-outline" size={20} color={colors.primary} />}
            onPress={() => navigation.navigate('HelpCenter' as never)}
          />

          <ProfileOption
            title="Privacy Policy"
            icon={<Ionicons name="document-text-outline" size={20} color={colors.primary} />}
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          />

          <ProfileOption
            title="Terms of Service"
            icon={<Ionicons name="document-outline" size={20} color={colors.primary} />}
            onPress={() => navigation.navigate('TermsOfService' as never)}
            isLast={true}
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, {
            backgroundColor: colors.error + '20',
            borderColor: colors.error + '40'
          }]}
          onPress={confirmSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <View style={styles.signOutContent}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    opacity: 0.9,
  },
  sectionContainer: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    marginTop: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
    opacity: 0.6,
  }
});

export default ProfileScreen;
