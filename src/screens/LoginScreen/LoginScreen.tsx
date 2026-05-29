import {
  View,
  Text,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

import { createStyles } from './styles';
import { useTheme, useStyles } from '@/shared/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/store';
import { authAPI, setAuthToken } from '@/services/api';
import { TextField, TextFieldPassword } from '@/shared/components/TextField';
import { TabSelector } from '@/shared/components/TabSelector';
import { authStart, authSuccess, authFailure, clearError } from '@/store/authSlice';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  // Email form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone form states
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);

  // Clear errors when switching tabs
  useEffect(() => {
    dispatch(clearError());
  }, [loginMethod, dispatch]);

  const validateEmail = (val: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(val);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      dispatch(authFailure('Vui lòng điền đầy đủ email và mật khẩu.'));
      return;
    }
    if (!validateEmail(email)) {
      dispatch(authFailure('Email không hợp lệ.'));
      return;
    }
    if (password.length < 6) {
      dispatch(authFailure('Mật khẩu phải có ít nhất 6 ký tự.'));
      return;
    }

    try {
      dispatch(authStart());
      const data = await authAPI.loginEmail({ email, password });
      setAuthToken(data.access_token);
      dispatch(authSuccess({ token: data.access_token, user: data.user }));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
      dispatch(authFailure(errMsg));
    }
  };

  const handleSendOtp = () => {
    if (!phone) {
      dispatch(authFailure('Vui lòng nhập số điện thoại.'));
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (cleanPhone.length < 9) {
      dispatch(authFailure('Số điện thoại không hợp lệ.'));
      return;
    }

    setIsLoadingOtp(true);
    dispatch(clearError());

    // Simulate SMS sending
    setTimeout(() => {
      setIsLoadingOtp(false);
      setOtpSent(true);
      Alert.alert(
        'Mã OTP (Mock)',
        'Mã OTP giả lập đã được gửi! Bạn có thể nhập bất kỳ mã nào (ví dụ: 123456) để tiếp tục.',
        [{ text: 'Đồng ý' }],
      );
    }, 1200);
  };

  const handlePhoneLogin = async () => {
    if (!phone || !otpCode) {
      dispatch(authFailure('Vui lòng điền đầy đủ số điện thoại và mã OTP.'));
      return;
    }

    try {
      dispatch(authStart());
      const data = await authAPI.loginPhone(phone, fullName || undefined);
      setAuthToken(data.access_token);
      dispatch(authSuccess({ token: data.access_token, user: data.user }));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Xác thực OTP thất bại.';
      dispatch(authFailure(errMsg));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / Header */}
          <Animated.View
            entering={FadeInUp.delay(100).duration(500)}
            style={styles.headerContainer}
          >
            <Text style={styles.logoText}>Check My Plan</Text>
            <Text style={styles.subtext}>Quản lý chi tiêu & Kế hoạch cao cấp</Text>
          </Animated.View>

          {/* Tab Switcher */}
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <TabSelector<'email' | 'phone'>
              activeTab={loginMethod}
              setActiveTab={setLoginMethod}
              options={[
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Số điện thoại' },
              ]}
            />
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            layout={Layout.springify()}
            style={styles.card}
          >
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {loginMethod === 'email' ? (
              // Email Form
              <View key="email-form">
                <TextField
                  label="Địa chỉ Email"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
                <TextFieldPassword
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleEmailLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Đăng Nhập</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              // Phone Form
              <View key="phone-form">
                <TextField
                  label="Số điện thoại"
                  placeholder="Ví dụ: 0912345678"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    if (otpSent) setOtpSent(false); // Reset OTP if phone changes
                  }}
                  editable={!otpSent}
                />

                {otpSent && (
                  <>
                    <TextField
                      label="Mã xác thực OTP"
                      placeholder="Nhập 6 chữ số"
                      keyboardType="number-pad"
                      value={otpCode}
                      onChangeText={setOtpCode}
                      maxLength={6}
                    />

                    <TextField
                      label="Họ và tên (Tùy chọn)"
                      placeholder="Tên của bạn nếu đăng ký mới"
                      value={fullName}
                      onChangeText={setFullName}
                    />
                  </>
                )}

                {!otpSent ? (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSendOtp}
                    disabled={isLoadingOtp}
                  >
                    {isLoadingOtp ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Gửi Mã OTP</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handlePhoneLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Xác Nhận & Đăng Nhập</Text>
                    )}
                  </TouchableOpacity>
                )}

                {otpSent && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setOtpSent(false)}
                  >
                    <Text style={styles.secondaryButtonText}>Thay đổi Số điện thoại</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Animated.View>

          {/* Footer Link */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            style={styles.footerContainer}
          >
            <Text style={styles.footerText}>Chưa có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLinkText}> Đăng ký ngay</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
