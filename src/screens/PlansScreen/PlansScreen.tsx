import { useState } from 'react';
import {
  Text,
  View,
  Modal,
  Alert,
  Platform,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootState } from '@/store';
import { addPlan, deletePlan } from '@/store/plansSlice';
import { Plan } from '@/shared/types';
import { schedulePlanReminder, cancelPlanReminder } from '@/services/notificationService';
import Header from '@/shared/layout/Header';
import { styles } from './styles';

export default function PlansScreen() {
  const plans = useSelector((state: RootState) => state.plans.plans);
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [intervalHours, setIntervalHours] = useState('4'); // Default 4 hours

  // Predefined interval options
  const intervalOptions = [
    { label: '1 Phút (Test)', value: '0.0166' }, // ~1 min
    { label: '2 Giờ', value: '2' },
    { label: '4 Giờ', value: '4' },
    { label: '8 Giờ', value: '8' },
    { label: '12 Giờ', value: '12' },
    { label: 'Mỗi Ngày', value: '24' },
  ];

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleCreatePlan = async () => {
    if (!title.trim() || !budget.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const budgetNum = parseFloat(budget.replace(/[^0-9]/g, ''));
    if (isNaN(budgetNum) || budgetNum <= 0) {
      Alert.alert('Lỗi', 'Ngân sách phải là số dương hợp lệ!');
      return;
    }

    const hours = parseFloat(intervalHours);
    const planId = Math.random().toString(36).substring(2, 9);

    // 1. Dispatch to Redux Store
    dispatch(
      addPlan({
        id: planId,
        title: title.trim(),
        budget: budgetNum,
        intervalHours: hours,
      }),
    );

    // 2. Schedule notification reminder
    await schedulePlanReminder(planId, title.trim(), hours);

    Alert.alert('Thành công', `Đã tạo kế hoạch "${title}" và hẹn giờ nhắc nhở!`);

    // Reset state & close modal
    setTitle('');
    setBudget('');
    setIntervalHours('4');
    setModalVisible(false);
  };

  const handleDeletePlan = (planId: string, planTitle: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa kế hoạch "${planTitle}" không? Hành động này cũng sẽ hủy các hẹn giờ liên quan.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            dispatch(deletePlan(planId));
            await cancelPlanReminder(planId);
          },
        },
      ],
    );
  };

  const renderPlanCard = ({ item }: { item: Plan }) => {
    const percent = item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
    const remaining = item.budget - item.spent;

    // Dynamic progress bar color
    let barColor = '#4caf50'; // Green
    if (percent >= 90) {
      barColor = '#f44336'; // Red
    } else if (percent >= 70) {
      barColor = '#ff9800'; // Orange
    }

    // Find interval label
    const intervalObj = intervalOptions.find(
      (opt) => Math.abs(parseFloat(opt.value) - item.intervalHours) < 0.01,
    );
    const intervalLabel = intervalObj ? intervalObj.label : `${item.intervalHours} Giờ`;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>
              {item.id === 'general' ? 'Thư mục chụp hình chung' : `Nhắc nhở: ${intervalLabel}`}
            </Text>
          </View>
          {item.id !== 'general' && (
            <TouchableOpacity onPress={() => handleDeletePlan(item.id, item.title)}>
              <Ionicons name="trash-outline" size={22} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>

        {item.id !== 'general' ? (
          <>
            <View style={styles.spendingRow}>
              <Text style={styles.spendingText}>
                Đã tiêu: <Text style={styles.spentAmount}>{formatVND(item.spent)}</Text>
              </Text>
              <Text style={styles.spendingText}>
                Hạn mức: <Text style={styles.budgetAmount}>{formatVND(item.budget)}</Text>
              </Text>
            </View>

            {/* Custom Progress Bar */}
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.min(percent, 100)}%`, backgroundColor: barColor },
                ]}
              />
            </View>

            <View style={styles.cardFooter}>
              <Text style={[styles.remainingText, { color: remaining < 0 ? '#ff4444' : '#aaa' }]}>
                {remaining < 0
                  ? `Vượt hạn mức: ${formatVND(Math.abs(remaining))}`
                  : `Còn lại: ${formatVND(remaining)}`}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.spendingRow}>
            <Text style={styles.spendingText}>
              Đã tiêu: <Text style={styles.spentAmount}>{formatVND(item.spent)}</Text>
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Kế Hoạch" rightIcon="add" onRightPress={() => setModalVisible(true)} />

      {plans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#333" />
          <Text style={styles.emptyText}>Chưa có kế hoạch chi tiêu nào.</Text>
          <Text style={styles.emptySubText}>
            Tạo kế hoạch để bắt đầu check-in chi tiêu theo giờ!
          </Text>
          <TouchableOpacity style={styles.createFirstBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.createFirstBtnText}>Tạo Kế Hoạch Đầu Tiên</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          renderItem={renderPlanCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Plan Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Header
              title="Tạo Kế Hoạch Mới"
              type="modal"
              rightIcon="close"
              onRightPress={() => setModalVisible(false)}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Tên Kế Hoạch</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Ăn uống, Trà sữa, Mua sắm..."
                placeholderTextColor="#666"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Ngân Sách (VND)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: 1.000.000"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={budget}
                onChangeText={(text) => {
                  // Keep only digits and format
                  const digits = text.replace(/[^0-9]/g, '');
                  if (digits) {
                    setBudget(Number(digits).toLocaleString('vi-VN'));
                  } else {
                    setBudget('');
                  }
                }}
              />

              <Text style={styles.label}>Tần Suất Nhắc Nhở</Text>
              <View style={styles.intervalGrid}>
                {intervalOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.intervalChip,
                      intervalHours === opt.value && styles.intervalChipActive,
                    ]}
                    onPress={() => setIntervalHours(opt.value)}
                  >
                    <Text
                      style={[
                        styles.intervalChipText,
                        intervalHours === opt.value && styles.intervalChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreatePlan}>
                <Text style={styles.submitBtnText}>Bắt Đầu Hẹn Giờ & Tạo</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
