import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@shared/theme/colors';
import { useToast } from '@shared/hooks';
import { Toast } from '@shared/components';
import { authApi } from '@shared/services/api/authApi';
import { useAuthStore } from '@/store/authStore';
import {
  validatePhone,
  validateOTP,
  validatePassword,
  validateFullName,
  validateEmail,
  normalizePhone,
} from '@shared/utils/validation';
import {
  validateRoleForRoute,
  type UserRole,
} from '@shared/utils/roleValidation';

import { AUTH_GRADIENT } from './RoleSelectionScreen';

type AuthMode = 'select' | 'quick-otp' | 'full-register' | 'password-login';
type AuthStep = 'phone' | 'otp' | 'register' | 'password';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Custom spring animation preset for smooth screen transitions.
 * This mimics the native navigation push/pop feel within the single screen.
 */
const TRANSITION_ANIM = LayoutAnimation.create(
  280,
  LayoutAnimation.Types.easeInEaseOut,
  LayoutAnimation.Properties.opacity
);

/**
 * CitizenLoginScreen handles multiple authentication flows within a single screen:
 * - Select mode (choose login method)
 * - Quick OTP login (phone -> OTP verify)
 * - Password login (phone + password)
 * - Full registration (phone + name + email + password -> OTP verify)
 *
 * Uses LayoutAnimation to create a smooth transition when switching between modes,
 * matching the native-stack navigation feel users get when entering this screen.
 */
export const CitizenLoginScreen = () => {
  const navigation = useNavigation();
  const [authMode, setAuthMode] = useState<AuthMode>('select');
  const [authStep, setAuthStep] = useState<AuthStep>('phone');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [countdown, setCountdown] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const { setTokens } = useAuthStore();
  const { toast, showSuccess, showError } = useToast();

  /**
   * Triggers a smooth layout transition before updating authMode/authStep.
   * Called before every state change that swaps visible UI sections.
   */
  const animateTransition = useCallback(() => {
    LayoutAnimation.configureNext(TRANSITION_ANIM);
  }, []);

  const handleBack = useCallback(() => {
    if (authStep === 'otp') {
      animateTransition();
      setAuthStep(authMode === 'full-register' ? 'register' : 'phone');
      return true;
    }
    if (authMode !== 'select') {
      animateTransition();
      setAuthMode('select');
      setAuthStep('phone');
      setError('');
      return true;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }
    return false;
  }, [authStep, authMode, navigation, animateTransition]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack
    );
    return () => backHandler.remove();
  }, [handleBack]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authStep === 'otp' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, countdown]);

  // ---- Auth Handlers ----

  const handleRequestOtp = async () => {
    const validation = validatePhone(phone);
    if (!validation.isValid) {
      setError(validation.error!);
      showError(validation.error!);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const normalizedPhone = normalizePhone(phone);
      const response = await authApi.requestOTP(normalizedPhone);

      if (response.otp) {
        setDevOtp(response.otp);
      }

      animateTransition();
      setAuthStep('otp');
      setCountdown(300);

      showSuccess(
        `Verification code sent to ${phone}${response.otp ? ` (Dev OTP: ${response.otp})` : ''}`
      );
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to send OTP';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const validation = validateOTP(otp);
    if (!validation.isValid) {
      setError(validation.error!);
      showError(validation.error!);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const normalizedPhone = normalizePhone(phone);

      let response;
      if (authMode === 'quick-otp') {
        response = await authApi.verifyOTP(normalizedPhone, otp);
      } else if (authMode === 'full-register') {
        response = await authApi.verifyPhone(normalizedPhone, otp);
      }

      if (response) {
        const roleValidation = validateRoleForRoute(
          response.role as UserRole,
          'citizen'
        );

        if (!roleValidation.isValid) {
          setError(roleValidation.error!);
          showError(roleValidation.error!);
          return;
        }

        await setTokens(response);
        showSuccess('Login successful! Welcome to CivicLens');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Invalid or expired OTP';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    const phoneValidation = validatePhone(phone);
    const nameValidation = validateFullName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!phoneValidation.isValid) {
      setError(phoneValidation.error!);
      showError(phoneValidation.error!);
      return;
    }
    if (!nameValidation.isValid) {
      setError(nameValidation.error!);
      showError(nameValidation.error!);
      return;
    }
    if (!emailValidation.isValid) {
      setError(emailValidation.error!);
      showError(emailValidation.error!);
      return;
    }
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error!);
      showError(passwordValidation.error!);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      showError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const normalizedPhone = normalizePhone(phone);
      const response = await authApi.signup({
        phone: normalizedPhone,
        full_name: name.trim(),
        email: email.trim() || undefined,
        password,
      });

      if (response.otp) {
        setDevOtp(response.otp);
      }

      animateTransition();
      setAuthStep('otp');
      setCountdown(300);

      showSuccess(
        `Verification code sent${response.otp ? ` (Dev OTP: ${response.otp})` : ''}`
      );
    } catch (err: any) {
      const errorMsg = err.message || 'Signup failed';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    const phoneValidation = validatePhone(phone);
    const passwordValidation = validatePassword(password);

    if (!phoneValidation.isValid) {
      setError(phoneValidation.error!);
      showError(phoneValidation.error!);
      return;
    }
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error!);
      showError(passwordValidation.error!);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const normalizedPhone = normalizePhone(phone);
      const response = await authApi.login(normalizedPhone, password, 'citizen');

      const roleValidation = validateRoleForRoute(
        response.role as UserRole,
        'citizen'
      );

      if (!roleValidation.isValid) {
        setError(roleValidation.error!);
        showError(roleValidation.error!);
        return;
      }

      await setTokens(response);
      showSuccess('Login successful! Welcome back');
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Shared UI Elements ----

  /**
   * Consistent back button across all flow stages.
   */
  const renderBackButton = (onPress: () => void) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.backButton}
      activeOpacity={0.7}
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <Ionicons name="arrow-back" size={20} color={colors.text} />
    </TouchableOpacity>
  );

  /**
   * Compact gradient hero for form screens.
   * Shows contextual icon + title/subtitle based on current authMode/authStep.
   */
  const renderCompactHero = () => {
    let title = '';
    let subtitle = '';
    let iconName: keyof typeof Ionicons.glyphMap = 'flash';

    if (authMode === 'quick-otp') {
      iconName = 'flash';
      title = 'Quick OTP Login';
      if (authStep === 'phone') subtitle = 'Enter your mobile number to continue';
      else if (authStep === 'otp') subtitle = 'Enter the verification code sent to your phone';
    } else if (authMode === 'password-login') {
      iconName = 'lock-closed';
      title = 'Password Login';
      subtitle = 'Sign in with your mobile number and password';
    } else if (authMode === 'full-register') {
      iconName = 'person-add';
      title = 'Create Account';
      if (authStep === 'register') subtitle = 'Fill in your details to get started';
      else if (authStep === 'otp') subtitle = 'Verify your phone number to complete registration';
    }

    return (
      <LinearGradient
        colors={AUTH_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.compactHeroCard}
      >
        <View style={styles.compactHeroContent}>
          <View style={styles.compactLogoBadge}>
            <Ionicons name={iconName} size={20} color={colors.white} />
          </View>
          <View style={styles.compactHeroTextBlock}>
            <Text style={styles.compactHeroTitle}>{title}</Text>
            <Text style={styles.compactHeroSubtitle}>{subtitle}</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  // ---- SELECT SCREEN ----

  if (authMode === 'select') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollViewFull}
          contentContainerStyle={styles.selectScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {renderBackButton(() => navigation.goBack())}

          <LinearGradient
            colors={AUTH_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>CL</Text>
              </View>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroTitle}>Welcome to CivicLens</Text>
                <Text style={styles.heroSubtitle}>
                  Choose how you'd like to continue
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.infoBanner}>
            <Text style={styles.infoTitle}>Why citizens prefer CivicLens</Text>
            <View style={styles.infoRow}>
              {INFO_POINTS.map(point => (
                <View key={point.title} style={styles.infoPoint}>
                  <Ionicons
                    name={point.icon as any}
                    size={14}
                    color="#0D47A1"
                  />
                  <Text style={styles.infoPointText}>{point.title}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.optionList}>
            {OPTION_CARDS.map(option => (
              <TouchableOpacity
                key={option.mode}
                style={styles.optionCard}
                onPress={() => {
                  animateTransition();
                  setAuthMode(option.mode as AuthMode);
                  setAuthStep(option.step as AuthStep);
                  setError('');
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.optionIconCircle,
                    { backgroundColor: option.iconBg },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={option.iconColor}
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <Toast {...toast} onHide={() => { }} />
      </SafeAreaView>
    );
  }

  // ---- FORM SCREENS (OTP, Password, Register) ----

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollViewFull}
          contentContainerStyle={styles.formScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {renderBackButton(handleBack)}
          {renderCompactHero()}

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Quick OTP - Phone Input */}
            {authMode === 'quick-otp' && authStep === 'phone' && (
              <>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="call-outline"
                      size={15}
                      color="#0D47A1"
                    />
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
                      setError('');
                    }}
                    editable={!isLoading}
                  />
                </View>

                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleRequestOtp}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Ionicons
                        name="send-outline"
                        size={17}
                        color={colors.white}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Send OTP</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* OTP Verification */}
            {authStep === 'otp' && (
              <>
                <Text style={styles.label}>Enter OTP</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={15}
                      color="#0D47A1"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="6-digit OTP"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={text => {
                      setOtp(text.replace(/\D/g, ''));
                      setError('');
                    }}
                    editable={!isLoading}
                  />
                </View>

                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                {devOtp && __DEV__ && (
                  <View style={styles.devOtpContainer}>
                    <Text style={styles.devOtpText}>Dev OTP: {devOtp}</Text>
                  </View>
                )}

                <View style={styles.timerRow}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={
                      countdown > 0 ? colors.textSecondary : colors.error
                    }
                  />
                  <Text
                    style={[
                      styles.timerText,
                      countdown === 0 && styles.timerExpired,
                    ]}
                  >
                    {countdown > 0
                      ? `Resend in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                      : 'OTP expired'}
                  </Text>
                </View>

                {countdown === 0 && (
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={() => {
                      setCountdown(300);
                      handleRequestOtp();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={16}
                      color="#0D47A1"
                    />
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={17}
                        color={colors.white}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Verify OTP</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Password Login */}
            {authMode === 'password-login' && (
              <>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="call-outline"
                      size={15}
                      color="#0D47A1"
                    />
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
                      setError('');
                    }}
                    editable={!isLoading}
                  />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={15}
                      color="#0D47A1"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      setError('');
                    }}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={
                        showPassword ? 'eye-off-outline' : 'eye-outline'
                      }
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handlePasswordLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Ionicons
                        name="log-in-outline"
                        size={17}
                        color={colors.white}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Login</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Full Registration */}
            {authMode === 'full-register' && authStep === 'register' && (
              <>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="call-outline"
                      size={15}
                      color="#0D47A1"
                    />
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
                      setError('');
                    }}
                    editable={!isLoading}
                  />
                </View>

                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="person-outline"
                      size={15}
                      color="#0D47A1"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textTertiary}
                    value={name}
                    onChangeText={text => {
                      setName(text);
                      setError('');
                    }}
                    editable={!isLoading}
                  />
                </View>

                <Text style={styles.label}>Email (Optional)</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="mail-outline"
                      size={15}
                      color="#0D47A1"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={text => {
                      setEmail(text);
                      setError('');
                    }}
                    editable={!isLoading}
                  />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={15}
                      color="#0D47A1"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Min 8 chars, 1 uppercase, 1 digit"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      setError('');
                    }}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={
                        showPassword ? 'eye-off-outline' : 'eye-outline'
                      }
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={15}
                      color="#0D47A1"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={text => {
                      setConfirmPassword(text);
                      setError('');
                    }}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword
                          ? 'eye-off-outline'
                          : 'eye-outline'
                      }
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSignup}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Ionicons
                        name="person-add-outline"
                        size={17}
                        color={colors.white}
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Create Account</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast {...toast} onHide={() => { }} />
    </SafeAreaView>
  );
};

// ---- Static Data ----

const INFO_POINTS = [
  { title: 'Offline-first reporting', icon: 'cloud-download-outline' },
  { title: 'Secure OTP in seconds', icon: 'shield-checkmark-outline' },
  { title: 'Track resolutions live', icon: 'pulse-outline' },
];

const OPTION_CARDS = [
  {
    mode: 'quick-otp',
    step: 'phone',
    icon: 'flash',
    iconBg: 'rgba(13,71,161,0.08)',
    iconColor: '#0D47A1',
    title: 'Quick Login with OTP',
    description: 'Instant access with phone verification',
  },
  {
    mode: 'password-login',
    step: 'password',
    icon: 'lock-closed',
    iconBg: 'rgba(13,71,161,0.06)',
    iconColor: '#0D47A1',
    title: 'Login with Password',
    description: 'Sign in to your existing account',
  },
  {
    mode: 'full-register',
    step: 'register',
    icon: 'person-add',
    iconBg: 'rgba(5,150,105,0.08)',
    iconColor: colors.secondaryDark,
    title: 'Create New Account',
    description: 'Unlock all features with full profile',
  },
];

// ---- Styles ----

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollViewFull: {
    flex: 1,
  },
  selectScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  formScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  keyboardView: {
    flex: 1,
  },

  // Back Button
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

  // Select Screen Hero
  heroCard: {
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#0D47A1',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logoBadgeText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },

  // Compact Hero (form screens)
  compactHeroCard: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: '#0D47A1',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  compactHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactLogoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactHeroTextBlock: {
    flex: 1,
  },
  compactHeroTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  compactHeroSubtitle: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // Info Banner
  infoBanner: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  infoPointText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Option Cards (select screen)
  optionList: {
    gap: 10,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  optionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },

  // Form Card
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

  // Action Button
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
  buttonIcon: {
    marginRight: 8,
  },

  // OTP specific
  devOtpContainer: {
    backgroundColor: 'rgba(255,193,7,0.12)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.30)',
  },
  devOtpText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  timerText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timerExpired: {
    color: colors.error,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#0D47A1',
    fontWeight: '600',
  },
});
