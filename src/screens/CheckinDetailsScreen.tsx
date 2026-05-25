import {
  Text,
  View,
  Image,
  Alert,
  Platform,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../shared/layout/Header';
import { RootState } from '../store';
import { updatePlanSpent } from '../store/plansSlice';
import { addCheckIn, completePendingCheckIn } from '../store/checkinsSlice';

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
                  // Ideally navigate to Plans tab, we can handle it
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f14',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e222b',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  polaroidContainer: {
    alignSelf: 'center',
    width: '75%',
    aspectRatio: 1,
    backgroundColor: '#1b1f28',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2d323f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'cover',
  },
  noPhotoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    color: '#666',
    marginTop: 8,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 10,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b1f28',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2d323f',
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    height: 56,
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  currencyText: {
    color: '#ff9f43',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notesInput: {
    backgroundColor: '#1b1f28',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2d323f',
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  planSelector: {
    flexDirection: 'row',
  },
  planChip: {
    backgroundColor: '#1b1f28',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2d323f',
  },
  planChipActive: {
    backgroundColor: '#ff9f43',
    borderColor: '#ff9f43',
  },
  planChipText: {
    color: '#aaa',
    fontWeight: '600',
  },
  planChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  lockedPlan: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b1f28',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2d323f',
    padding: 16,
  },
  lockedPlanText: {
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',
  },
  noPlansWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 159, 67, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 159, 67, 0.3)',
    padding: 16,
  },
  noPlansWarningText: {
    color: '#ff9f43',
    marginLeft: 8,
    fontWeight: '600',
  },
  visibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visibilityChip: {
    flex: 1,
    backgroundColor: '#1b1f28',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2d323f',
    flexDirection: 'row',
  },
  visibilityActive: {
    backgroundColor: '#ff9f43',
    borderColor: '#ff9f43',
  },
  visibilityText: {
    fontSize: 10,
    color: '#888',
    marginLeft: 6,
    fontWeight: '600',
  },
  visibilityTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#ff9f43',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
    shadowColor: '#ff9f43',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
