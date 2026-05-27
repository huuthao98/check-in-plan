import {
  Text,
  View,
  Image,
  Alert,
  Platform,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/shared/layout/Header';
import { RootState } from '@/store';
import { updatePlanSpent } from '@/store/plansSlice';
import { addCheckIn, completePendingCheckIn } from '@/store/checkInsSlice';
import { styles } from './styles';

export default function CheckInDetailsScreen({ route, navigation }: any) {
  const dispatch = useDispatch();
  const plans = useSelector((state: RootState) => state.plans.plans);
  const CheckIns = useSelector((state: RootState) => state.CheckIns.CheckIns);

  const { photo, pendingCheckInId } = route.params || {};

  // If this is a makeup check-in, find the pending CheckIn details
  const pendingCheckIn = pendingCheckInId ? CheckIns.find((c) => c.id === pendingCheckInId) : null;

  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'friends'>('public');

  // Pre-fill plan if it is a makeup CheckIn
  useEffect(() => {
    if (pendingCheckIn) {
      setSelectedPlanId(pendingCheckIn.planId);
    } else if (plans.length > 0) {
      setSelectedPlanId(plans[0].id); // default to first plan
    }
  }, [pendingCheckIn, plans]);

  const handleSave = () => {
    if (!selectedPlanId) {
      Alert.alert('Lỗi', 'Vui lòng tạo hoặc chọn một kế hoạch chi tiêu!');
      return;
    }

    const cleanAmount = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;

    const CheckInData = {
      id: pendingCheckInId || Math.random().toString(36).substring(2, 9),
      planId: selectedPlanId,
      photoUri: photo ? photo.uri : null,
      amountSpent: cleanAmount,
      notes: notes.trim() || 'Check-in chi tiêu',
      visibility,
    };

    if (pendingCheckInId) {
      // 1. Complete pending check-in (Chụp bù)
      dispatch(
        completePendingCheckIn({
          id: pendingCheckInId,
          photoUri: photo ? photo.uri : '',
          amountSpent: cleanAmount,
          notes: CheckInData.notes,
          visibility: CheckInData.visibility,
        }),
      );
      // 2. Update plan spending
      dispatch(updatePlanSpent({ planId: selectedPlanId, amount: cleanAmount }));
      Alert.alert('Thành công', 'Đã chụp bù check-in chi tiêu thành công!');
    } else {
      // 1. Add new completed check-in
      dispatch(
        addCheckIn({
          ...CheckInData,
          status: 'completed',
        }),
      );
      // 2. Update plan spending
      dispatch(updatePlanSpent({ planId: selectedPlanId, amount: cleanAmount }));
      Alert.alert('Thành công', 'Đã lưu check-in chi tiêu!');
    }

    // Navigate back to Home camera
    navigation.popToTop();
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Header
          title={pendingCheckInId ? 'Chụp Bù Chi Tiêu' : 'Chi Tiết Chi Tiêu'}
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo Preview - Polaroid / Locket Style */}
          <View style={styles.polaroidContainer}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.noPhotoPlaceholder}>
                <Ionicons name="image-outline" size={48} color="#444" />
                <Text style={styles.noPhotoText}>Không có ảnh</Text>
              </View>
            )}
          </View>

          {/* Amount input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Số Tiền Đã Chi Tiêu</Text>
            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => {
                  const digits = text.replace(/[^0-9]/g, '');
                  if (digits) {
                    setAmount(Number(digits).toLocaleString('vi-VN'));
                  } else {
                    setAmount('');
                  }
                }}
              />
              <Text style={styles.currencyText}>VND</Text>
            </View>
          </View>

          {/* Notes input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Ghi Chú Chi Tiêu</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Bạn đã chi cho việc gì? (Ví dụ: Ăn trưa, trà đào...)"
              placeholderTextColor="#666"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>

          {/* Plan Selector */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Chọn Kế Hoạch Áp Dụng</Text>
            {pendingCheckInId ? (
              // If makeup, plan is locked
              <View style={styles.lockedPlan}>
                <Ionicons name="lock-closed" size={16} color="#666" />
                <Text style={styles.lockedPlanText}>
                  {selectedPlan ? selectedPlan.title : 'Kế hoạch đã chọn'} (Bắt buộc khi chụp bù)
                </Text>
              </View>
            ) : plans.length === 0 ? (
              <TouchableOpacity
                style={styles.noPlansWarning}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Ionicons name="warning-outline" size={20} color="#ff9f43" />
                <Text style={styles.noPlansWarningText}>
                  Bạn chưa có kế hoạch nào. Nhấn để tạo trước.
                </Text>
              </TouchableOpacity>
            ) : (
              // Horizontal plan chips selector
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.planSelector}
              >
                {plans.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.planChip, selectedPlanId === p.id && styles.planChipActive]}
                    onPress={() => setSelectedPlanId(p.id)}
                  >
                    <Text
                      style={[
                        styles.planChipText,
                        selectedPlanId === p.id && styles.planChipTextActive,
                      ]}
                    >
                      {p.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Visibility settings */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Quyền Riêng Tư (Chế Độ Hiển Thị)</Text>
            <View style={styles.visibilityContainer}>
              <TouchableOpacity
                style={[styles.visibilityChip, visibility === 'public' && styles.visibilityActive]}
                onPress={() => setVisibility('public')}
              >
                <Ionicons
                  name="people"
                  size={18}
                  color={visibility === 'public' ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.visibilityText,
                    visibility === 'public' && styles.visibilityTextActive,
                  ]}
                >
                  Bạn bè (Public)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.visibilityChip, visibility === 'friends' && styles.visibilityActive]}
                onPress={() => setVisibility('friends')}
              >
                <Ionicons
                  name="star"
                  size={18}
                  color={visibility === 'friends' ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.visibilityText,
                    visibility === 'friends' && styles.visibilityTextActive,
                  ]}
                >
                  Bạn thân (Close Friends)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.visibilityChip, visibility === 'private' && styles.visibilityActive]}
                onPress={() => setVisibility('private')}
              >
                <Ionicons
                  name="lock-closed"
                  size={18}
                  color={visibility === 'private' ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.visibilityText,
                    visibility === 'private' && styles.visibilityTextActive,
                  ]}
                >
                  Chỉ mình tôi
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Lưu & Chi Tiêu 📸</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
