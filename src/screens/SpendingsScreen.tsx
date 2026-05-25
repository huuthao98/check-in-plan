import { useState } from 'react';
import {
  Text,
  View,
  Image,
  Modal,
  FlatList,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { CheckIn } from '../store/checkinsSlice';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../shared/layout/Header';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 2 columns grid
export default function SpendingsScreen() {
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
              <Ionicons name="cash-outline" size={32} color="#444" />
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
      <Header title="Chi Tiêu (Locket Feed)" />

      {/* Plans Filter Selector */}
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
          <Ionicons name="images-outline" size={80} color="#333" />
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
                      color="#ff9f43"
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
                    <Ionicons name="image-outline" size={64} color="#333" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f14',
  },
  header: {
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
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e222b',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: '#1b1f28',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2d323f',
  },
  filterChipActive: {
    backgroundColor: '#ff9f43',
    borderColor: '#ff9f43',
  },
  filterChipText: {
    color: '#aaa',
    fontWeight: '600',
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  gridContainer: {
    padding: 16,
  },
  gridItem: {
    width: COLUMN_WIDTH,
    margin: 8,
    backgroundColor: '#1b1f28',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d323f',
    overflow: 'hidden',
  },
  polaroidFrame: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#000',
  },
  itemPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemPhotoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  itemOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemAmount: {
    color: '#ff9f43',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDetails: {
    padding: 10,
  },
  itemPlanName: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  itemNote: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1b1f28',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2d323f',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 159, 67, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalMetaText: {
    color: '#ff9f43',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalPolaroid: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d323f',
    marginBottom: 16,
  },
  modalPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalPhotoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoTimestampBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  photoTimestampText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  modalDetails: {
    paddingHorizontal: 4,
  },
  modalPlanTitle: {
    color: '#ff9f43',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  notesContainer: {
    marginTop: 12,
    backgroundColor: '#2d323f',
    borderRadius: 12,
    padding: 12,
  },
  notesLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  modalNotes: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
});
