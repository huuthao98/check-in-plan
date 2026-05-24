import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addPlan, deletePlan, Plan } from '../store/plansSlice';
import { schedulePlanReminder, cancelPlanReminder } from '../services/notificationService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    dispatch(addPlan({
      id: planId,
      title: title.trim(),
      budget: budgetNum,
      intervalHours: hours,
    }));

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
      ]
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
    const intervalObj = intervalOptions.find(opt => Math.abs(parseFloat(opt.value) - item.intervalHours) < 0.01);
    const intervalLabel = intervalObj ? intervalObj.label : `${item.intervalHours} Giờ`;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>Nhắc nhở: {intervalLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDeletePlan(item.id, item.title)}>
            <Ionicons name="trash-outline" size={22} color="#ff4444" />
          </TouchableOpacity>
        </View>

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
          <View style={[styles.progressBar, { width: `${Math.min(percent, 100)}%`, backgroundColor: barColor }]} />
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.remainingText, { color: remaining < 0 ? '#ff4444' : '#aaa' }]}>
            {remaining < 0 ? `Vượt hạn mức: ${formatVND(Math.abs(remaining))}` : `Còn lại: ${formatVND(remaining)}`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kế Hoạch</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {plans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#333" />
          <Text style={styles.emptyText}>Chưa có kế hoạch chi tiêu nào.</Text>
          <Text style={styles.emptySubText}>Tạo kế hoạch để bắt đầu check-in chi tiêu theo giờ!</Text>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo Kế Hoạch Mới</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f14', // sleek dark theme background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e222b',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff9f43', // premium accent color
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1b1f28',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2d323f',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardSub: {
    fontSize: 12,
    color: '#ff9f43',
    marginTop: 4,
    fontWeight: '600',
  },
  spendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spendingText: {
    fontSize: 13,
    color: '#aaa',
  },
  spentAmount: {
    color: '#ff4d4d',
    fontWeight: '700',
  },
  budgetAmount: {
    color: '#fff',
    fontWeight: '700',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#2d323f',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  createFirstBtn: {
    marginTop: 30,
    backgroundColor: '#ff9f43',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 25,
  },
  createFirstBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#1b1f28',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2d323f',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3a4051',
  },
  intervalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  intervalChip: {
    width: '48%',
    backgroundColor: '#2d323f',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3a4051',
  },
  intervalChipActive: {
    backgroundColor: '#ff9f43',
    borderColor: '#ff9f43',
  },
  intervalChipText: {
    color: '#aaa',
    fontWeight: '600',
    fontSize: 14,
  },
  intervalChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#ff9f43',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#ff9f43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
