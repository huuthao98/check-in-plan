import { useState } from 'react';
import {
  Text,
  View,
  Image,
  Modal,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootState } from '@/store';
import Header from '@/shared/layout/Header';
import { CheckIn } from '@/shared/types';
import { createStyles } from './styles';
import { useTheme, useStyles } from '@/shared/theme/useTheme';

export default function SpendingsScreen() {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const CheckIns = useSelector((state: RootState) => state.CheckIns.CheckIns);
  const plans = useSelector((state: RootState) => state.plans.plans);

  const [selectedPlanId, setSelectedPlanId] = useState<string>('all');
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);

  // Filter completed CheckIns only
  const completedCheckIns = CheckIns.filter(
    (c) => c.status === 'completed' && (selectedPlanId === 'all' || c.planId === selectedPlanId),
  );

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    return plan ? plan.title : 'Kế hoạch khác';
  };

  const getFriendlyTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    });
  };

  const renderSpendingItem = ({ item }: { item: CheckIn }) => {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => setSelectedCheckIn(item)}
        activeOpacity={0.8}
      >
        <View style={styles.polaroidFrame}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={styles.itemPhoto} />
          ) : (
            <View style={styles.itemPhotoPlaceholder}>
              <Ionicons name="cash-outline" size={32} color={colors.textMuted} />
            </View>
          )}

          <View style={styles.itemOverlay}>
            <Text style={styles.itemAmount}>{formatVND(item.amountSpent)}</Text>
          </View>
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemPlanName} numberOfLines={1}>
            {getPlanName(item.planId)}
          </Text>
          <Text style={styles.itemNote} numberOfLines={1}>
            {item.notes}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Nhật ký" />

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterChip, selectedPlanId === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedPlanId('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedPlanId === 'all' && styles.filterChipTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          {plans.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.filterChip, selectedPlanId === p.id && styles.filterChipActive]}
              onPress={() => setSelectedPlanId(p.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedPlanId === p.id && styles.filterChipTextActive,
                ]}
              >
                {p.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Spendings Grid */}
      {completedCheckIns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={80} color={colors.textMuted} />
          <Text style={styles.emptyText}>Chưa có ảnh chi tiêu.</Text>
          <Text style={styles.emptySubText}>
            Hình ảnh check-in chi tiêu của bạn sẽ hiển thị ở đây theo dạng Locket feed.
          </Text>
        </View>
      ) : (
        <FlatList
          data={completedCheckIns}
          keyExtractor={(item) => item.id}
          renderItem={renderSpendingItem}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Full Details Modal - Glassmorphic details */}
      <Modal
        visible={selectedCheckIn !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedCheckIn(null)}
      >
        <View style={styles.modalOverlay}>
          {selectedCheckIn && (
            <View style={styles.modalCard}>
              <Header
                type="modal"
                leftElement={
                  <View style={styles.modalMeta}>
                    <Ionicons
                      name={
                        selectedCheckIn.visibility === 'public'
                          ? 'people'
                          : selectedCheckIn.visibility === 'friends'
                            ? 'star'
                            : 'lock-closed'
                      }
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.modalMetaText}>
                      {selectedCheckIn.visibility === 'public'
                        ? 'Bạn bè'
                        : selectedCheckIn.visibility === 'friends'
                          ? 'Bạn thân'
                          : 'Chỉ mình tôi'}
                    </Text>
                  </View>
                }
                rightIcon="close-circle"
                onRightPress={() => setSelectedCheckIn(null)}
              />

              <View style={styles.modalPolaroid}>
                {selectedCheckIn.photoUri ? (
                  <Image source={{ uri: selectedCheckIn.photoUri }} style={styles.modalPhoto} />
                ) : (
                  <View style={styles.modalPhotoPlaceholder}>
                    <Ionicons name="image-outline" size={64} color={colors.textMuted} />
                  </View>
                )}

                {/* Locket timestamp overlay */}
                <View style={styles.photoTimestampBadge}>
                  <Text style={styles.photoTimestampText}>
                    {getFriendlyTime(selectedCheckIn.timestamp)}
                  </Text>
                </View>
              </View>

              <View style={styles.modalDetails}>
                <Text style={styles.modalPlanTitle}>{getPlanName(selectedCheckIn.planId)}</Text>
                <Text style={styles.modalAmount}>{formatVND(selectedCheckIn.amountSpent)}</Text>

                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Ghi chú:</Text>
                  <Text style={styles.modalNotes}>{selectedCheckIn.notes}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
