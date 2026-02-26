import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '@shared/services/api/authApi';
import { useAuthStore } from '@/store/authStore';
import {
  validateRoleForRoute,
  getRoleName,
  type UserRole,
} from '@shared/utils/roleValidation';
import { validatePhone, normalizePhone } from '@shared/utils/validation';
import { colors } from '@shared/theme/colors';
import { useToast } from '@shared/hooks';
import { Toast } from '@shared/components';
import { AUTH_GRADIENT } from './RoleSelectionScreen';

export const OfficerLoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { setTokens } = useAuthStore();
  const { toast, showSuccess, showError } = useToast();

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [navigation]);

  const validatePasswordInternal = (pwd: string): { valid: boolean; error?: string } => {
    if (!pwd || pwd.trim().length === 0) {
      return { valid: false, error: 'Password is required' };
    }

    if (pwd.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }

    return { valid: true };
  };

  // Real-time validation
  useEffect(() => {
    if (phone.length > 0) {
      const validation = validatePhone(phone);
      setPhoneError(validation.isValid ? null : validation.error || null);
    } else {
      setPhoneError(null);
    }
  }, [phone]);

  useEffect(() => {
    if (password.length > 0) {
      const validation = validatePasswordInternal(password);
      setPasswordError(validation.valid ? null : validation.error || null);
    } else {
      setPasswordError(null);
    }
  }, [password]);

  const handleLogin = async () => {
    setPhoneError(null);
    setPasswordError(null);

    const phoneValidation = validatePhone(phone);
    const passwordValidation = validatePasswordInternal(password);

    if (!phoneValidation.isValid || !passwordValidation.valid) {
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error || null);
        showError(phoneValidation.error || 'Invalid phone number');
      }
      if (!passwordValidation.valid) {
        setPasswordError(passwordValidation.error || null);
        showError(passwordValidation.error || 'Invalid password');
      }
      return;
    }

    const normalizedPhone = normalizePhone(phone);

    try {
      setIsLoading(true);

      const response = await authApi.login(normalizedPhone, password, 'officer');

      // Validate role BEFORE setting tokens to prevent navigation glitch
      const roleValidation = validateRoleForRoute(response.role as UserRole, 'officer');

      if (!roleValidation.isValid) {
        setPasswordError(roleValidation.error!);
        showError(roleValidation.error!);
        return;
      }

      // Role is valid - set tokens and navigate
      await setTokens(response);
      showSuccess(`Welcome ${getRoleName(response.role as UserRole)}!`);
    } catch (error: any) {
      let errorMessage = 'Invalid credentials. Please verify your phone number and password and try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      if (error.message?.includes('Invalid phone number or password')) {
        setPasswordError(errorMessage);
      }

      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollViewFull}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Hero Card */}
          <LinearGradient
            colors={AUTH_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.logoBadge}>
                <Ionicons name="shield-checkmark" size={22} color={colors.white} />
              </View>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroTitle}>Officer Portal</Text>
                <Text style={styles.heroSubtitle}>Sign in to manage tasks and resolve issues</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="call-outline" size={15} color="#0D47A1" />
              </View>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit number"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={text => {
                  setPhone(text.replace(/\D/g, ''));
                }}
                editable={!isLoading}
              />
            </View>
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed-outline" size={15} color="#0D47A1" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
                disabled={isLoading}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color={colors.white} />}
                </View>
                <Text style={styles.checkboxText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  showError('Please contact your administrator to reset your password');
                }}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (isLoading || !!phoneError || !!passwordError || !phone || !password) &&
                styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading || !!phoneError || !!passwordError || !phone || !password}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={17} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Sign In</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <View style={styles.securityIcon}>
              <Ionicons name="lock-closed" size={16} color="#0D47A1" />
            </View>
            <View style={styles.securityTextContainer}>
              <Text style={styles.securityTitle}>Secure Portal</Text>
              <Text style={styles.securityText}>
                Restricted to authorized government personnel only. All access attempts are logged and monitored.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast {...toast} onHide={() => { }} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollViewFull: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // ---- Back Button (matches CitizenLoginScreen) ----
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // ---- Hero ----
  heroCard: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // ---- Form Card ----
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: colors.backgroundTertiary,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(13,71,161,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0D47A1',
    borderColor: '#0D47A1',
  },
  checkboxText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#0D47A1',
    fontWeight: '600',
  },

  // ---- Action Button ----
  button: {
    backgroundColor: '#0D47A1',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    shadowColor: '#0D47A1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.7,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ---- Security Notice ----
  securityNotice: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  securityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(13,71,161,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 3,
  },
  securityText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
