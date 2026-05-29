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
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyles } from './styles';
import { useTheme, useStyles } from '@/shared/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/store';
import { authStart, authSuccess, authFailure, clearError } from '@/store/authSlice';

import { authAPI, setAuthToken } from '@/services/api';
import { TabSelector } from '@/shared/components/TabSelector';
import { TextField, TextFieldPassword } from '@/shared/components/TextField';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('email');

  // Email form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');

  // Phone form states
  const [phone, setPhone] = useState('');
  const [phoneFullName, setPhoneFullName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);

  // Clear errors when switching tabs
  useEffect(() => {
    dispatch(clearError());
  }, [registerMethod, dispatch]);

  const validateEmail = (val: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(val);
  };

  const handleEmailRegister = async () => {
    if (!fullName || !email || !password) {
      dispatch(authFailure('Vui lòng điền đầy đủ các trường bắt buộc (Họ tên, Email, Mật khẩu).'));
      return;
    }
    if (fullName.trim().length < 2) {
      dispatch(authFailure('Họ và tên phải có ít nhất 2 ký tự.'));
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

    const parsedAge = age ? parseInt(age, 10) : undefined;
    if (age && (isNaN(parsedAge!) || parsedAge! <= 0)) {
      dispatch(authFailure('Tuổi phải là số nguyên dương hợp lệ.'));
      return;
    }

    try {
      dispatch(authStart());
      const data = await authAPI.registerEmail({
        fullName,
        email,
        password,
        age: parsedAge,
      });
      setAuthToken(data.access_token);
      dispatch(authSuccess({ token: data.access_token, user: data.user }));
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã được sử dụng.';
      dispatch(authFailure(errMsg));
    }
  };

  const handleSendOtp = () => {
    if (!phone) {
      dispatch(authFailure('Vui lòng nhập số điện thoại.'));
      return;
    }
    if (!phoneFullName) {
      dispatch(authFailure('Vui lòng nhập họ và tên của bạn.'));
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

  const handlePhoneRegister = async () => {
    if (!phone || !otpCode || !phoneFullName) {
      dispatch(authFailure('Vui lòng điền đầy đủ các thông tin đăng ký.'));
      return;
    }

    try {
      dispatch(authStart());
      const data = await authAPI.loginPhone(phone, phoneFullName);
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
            <Text style={styles.logoText}>Tạo Tài Khoản</Text>
            <Text style={styles.subtext}>Đăng ký trải nghiệm Check In Plan ngay</Text>
          </Animated.View>

          {/* Tab Switcher */}
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <TabSelector<'email' | 'phone'>
              activeTab={registerMethod}
              setActiveTab={setRegisterMethod}
              options={[
                { value: 'email', label: 'Đăng ký Email' },
                { value: 'phone', label: 'Đăng ký SĐT' },
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

            {registerMethod === 'email' ? (
              // Email Register Form
              <View key="email-register-form">
                <TextField
                  label="Họ và tên *"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChangeText={(fullNameValue) => setFullName(fullNameValue)}
                />
                <TextField
                  label="Địa chỉ Email *"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
                <TextFieldPassword
                  label="Mật khẩu *"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChangeText={setPassword}
                />
                <TextField
                  label="Tuổi (Tùy chọn)"
                  placeholder="Nhập tuổi của bạn"
                  keyboardType="number-pad"
                  value={age}
                  onChangeText={setAge}
                />

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleEmailRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Đăng Ký Tài Khoản</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              // Phone Register Form
              <View key="phone-register-form">
                <TextField
                  label="Họ và tên *"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={phoneFullName}
                  onChangeText={setPhoneFullName}
                  editable={!otpSent}
                />

                <TextField
                  label="Số điện thoại *"
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
                  <TextField
                    label="Mã xác thực OTP *"
                    placeholder="Nhập 6 chữ số"
                    keyboardType="number-pad"
                    value={otpCode}
                    onChangeText={setOtpCode}
                    maxLength={6}
                  />
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
                    onPress={handlePhoneRegister}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Xác Nhận & Đăng Ký</Text>
                    )}
                  </TouchableOpacity>
                )}

                {otpSent && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setOtpSent(false)}
                  >
                    <Text style={styles.secondaryButtonText}>Thay đổi thông tin</Text>
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
            <Text style={styles.footerText}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLinkText}> Đăng nhập ngay</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
