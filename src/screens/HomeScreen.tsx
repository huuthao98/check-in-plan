import {
  Text,
  View,
  Image,
  Modal,
  Alert,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { RootState } from '../store';
import { addPendingCheckIn, skipCheckIn, CheckIn } from '../store/checkinsSlice';
import Header from '../shared/layout/Header';

const { width } = Dimensions.get('window');
const SQUARE_SIZE = width - 40;

export default function HomeScreen({ navigation }: any) {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);

  const dispatch = useDispatch();
  const plans = useSelector((state: RootState) => state.plans.plans);
  const CheckIns = useSelector((state: RootState) => state.CheckIns.CheckIns);

  // Filter pending CheckIns that need makeup
  const pendingCheckIns = CheckIns.filter((c) => c.status === 'pending');

  // Currently selected plan for quick check-in (defaults to first plan if available)
  const [activePlanId, setActivePlanId] = useState<string>('');

  // Selected pending check-in for makeup mode
  const [makeupTarget, setMakeupTarget] = useState<CheckIn | null>(null);

  const [makeupModalVisible, setMakeupModalVisible] = useState(false);

  useEffect(() => {
    if (plans.length > 0 && !activePlanId) {
      setActivePlanId(plans[0].id);
    }
  }, [plans, activePlanId]);

  // Handle local notification tap response
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const { planId, type } = response.notification.request.content.data || {};
      if (type === 'CheckIn_REMINDER' && planId && typeof planId === 'string') {
        // If a notification was tapped, set active plan to that plan
        setActivePlanId(planId);
        setMakeupTarget(null); // Exit makeup mode if tapping direct reminder
        console.log(`Switched active plan to ${planId} from notification tap`);
      }
    });

    return () => subscription.remove();
  }, []);

  if (!permission) {
    return <View style={styles.darkContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={80} color="#ff9f43" style={{ marginBottom: 20 }} />
        <Text style={styles.permissionText}>
          Cần cấp quyền truy cập Camera để check-in chi tiêu
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Cấp Quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  async function takePhoto() {
    if (cameraRef.current) {
      try {
        const capturedPhoto = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });
        setPhoto(capturedPhoto);
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Lỗi', 'Không thể chụp ảnh, vui lòng thử lại.');
      }
    }
  }

  function discardPhoto() {
    setPhoto(null);
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thiết bị.');
    }
  };

  const startMakeup = (item: CheckIn) => {
    setMakeupTarget(item);
    setMakeupModalVisible(false);
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    return plan ? plan.title : 'Kế hoạch';
  };

  const renderMakeupItem = ({ item }: { item: CheckIn }) => {
    return (
      <TouchableOpacity style={styles.makeupItem} onPress={() => startMakeup(item)}>
        <View style={styles.makeupItemInfo}>
          <Ionicons name="time-outline" size={20} color="#ff9f43" />
          <View style={styles.makeupItemTextCol}>
            <Text style={styles.makeupItemTitle}>{getPlanName(item.planId)}</Text>
            <Text style={styles.makeupItemSub}>Định kỳ cần check-in</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.makeupStartBtn} onPress={() => startMakeup(item)}>
          <Text style={styles.makeupStartBtnText}>Chụp bù</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (photo) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Xem trước check-in" alignTitle="center" />
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.preview} />
          {makeupTarget && (
            <View style={styles.makeupBadgeOverlay}>
              <Text style={styles.makeupBadgeText}>
                Chụp Bù: {getPlanName(makeupTarget.planId)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={discardPhoto}>
            <Ionicons name="close" size={24} color="#fff" />
            <Text style={styles.actionText}>Chụp lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#ff9f43' }]}
            onPress={() => {
              const photoData = photo;
              setPhoto(null); // Clear preview before navigating
              navigation.navigate('CheckInDetails', {
                photo: photoData,
                pendingCheckInId: makeupTarget ? makeupTarget.id : undefined,
              });
              setMakeupTarget(null); // Exit makeup mode
            }}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
            <Text style={styles.actionText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const selectedPlan = plans.find((p) => p.id === activePlanId);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with CheckIn Branding & Makeup Button */}
      <View style={styles.topBar}>
        <Text style={styles.logoText}>CheckIn Plan</Text>

        {pendingCheckIns.length > 0 && (
          <TouchableOpacity
            style={styles.makeupBadgeBtn}
            onPress={() => setMakeupModalVisible(true)}
          >
            <Ionicons name="alert-circle" size={20} color="#fff" />
            <Text style={styles.makeupBadgeBtnText}>Chụp bù ({pendingCheckIns.length})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Makeup Mode Active Indicator */}
      {makeupTarget && (
        <View style={styles.makeupIndicator}>
          <Ionicons name="time" size={16} color="#000" />
          <Text style={styles.makeupIndicatorText}>
            Đang chụp bù cho:{' '}
            <Text style={{ fontWeight: 'bold' }}>{getPlanName(makeupTarget.planId)}</Text>
          </Text>
          <TouchableOpacity onPress={() => setMakeupTarget(null)} style={styles.makeupCancelBtn}>
            <Ionicons name="close-circle" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Plan Selector Banner (if no makeup active) */}
      {!makeupTarget && plans.length > 0 && (
        <View style={styles.planSelectorBanner}>
          <Text style={styles.selectorLabel}>Check-in cho:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.planSelectorScroll}
          >
            {plans.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.planSelectorChip,
                  activePlanId === p.id && styles.planSelectorChipActive,
                ]}
                onPress={() => setActivePlanId(p.id)}
              >
                <Text
                  style={[
                    styles.planSelectorChipText,
                    activePlanId === p.id && styles.planSelectorChipTextActive,
                  ]}
                >
                  {p.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* CheckIn Square Camera Viewport */}
      <View style={styles.cameraContainer}>
        {plans.length === 0 ? (
          <View style={styles.noPlansCameraOverlay}>
            <Ionicons name="create-outline" size={48} color="#666" />
            <Text style={styles.noPlansCameraText}>Chưa có kế hoạch chi tiêu</Text>
            <Text style={styles.noPlansCameraSub}>
              Hãy tạo kế hoạch để kích hoạt Camera CheckIn!
            </Text>
          </View>
        ) : (
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            {/* CheckIn Overlay - visual border */}
            <View style={styles.CheckInBorder} />
          </CameraView>
        )}
      </View>

      {/* Bottom Controls */}
      {plans.length > 0 && (
        <View style={styles.controlsContainer}>
          {/* Pick Image Button */}
          <TouchableOpacity style={styles.controlSubBtn} onPress={pickImage}>
            <Ionicons name="images-outline" size={24} color="#fff" />
            <Text style={styles.controlSubText}>Thư viện</Text>
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
            <View style={styles.captureInner} />
          </TouchableOpacity>

          {/* Camera Flip Button */}
          <TouchableOpacity style={styles.controlSubBtn} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-outline" size={26} color="#fff" />
            <Text style={styles.controlSubText}>Xoay</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Makeup List Modal */}
      <Modal
        visible={makeupModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMakeupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Header
              type="modal"
              title={`Danh sách Chụp Bù (${pendingCheckIns.length})`}
              rightIcon="close"
              onRightPress={() => setMakeupModalVisible(false)}
            />

            <FlatList
              data={pendingCheckIns}
              keyExtractor={(item) => item.id}
              renderItem={renderMakeupItem}
              contentContainerStyle={styles.makeupList}
              ListEmptyComponent={
                <Text style={styles.emptyMakeupText}>Không có check-in nào cần chụp bù!</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f14',
    justifyContent: 'space-between',
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#0c0f14',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#ff9f43',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    height: 60,
  },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  makeupBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  makeupBadgeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  makeupIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff9f43',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  makeupIndicatorText: {
    color: '#000',
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
  },
  makeupCancelBtn: {
    padding: 2,
  },
  planSelectorBanner: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  selectorLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  planSelectorScroll: {
    paddingBottom: 4,
  },
  planSelectorChip: {
    backgroundColor: '#1b1f28',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2d323f',
  },
  planSelectorChipActive: {
    backgroundColor: '#ff9f43',
    borderColor: '#ff9f43',
  },
  planSelectorChipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  planSelectorChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cameraContainer: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: 36,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#1b1f28',
    borderWidth: 1,
    borderColor: '#2d323f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    marginVertical: 15,
  },
  camera: {
    flex: 1,
  },
  CheckInBorder: {
    flex: 1,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 36,
  },
  noPlansCameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noPlansCameraText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  noPlansCameraSub: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  captureBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 5,
    borderColor: '#ff9f43',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  captureInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#fff',
  },
  controlSubBtn: {
    alignItems: 'center',
    width: 60,
  },
  controlSubText: {
    color: '#888',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  previewContainer: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: 36,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#000',
    position: 'relative',
    marginVertical: 40,
  },
  preview: {
    flex: 1,
    resizeMode: 'cover',
  },
  makeupBadgeOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#ff9f43',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  makeupBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e222b',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: '#2d323f',
    justifyContent: 'center',
    width: '45%',
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  // Modal layout
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1b1f28',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  makeupList: {
    paddingBottom: 20,
  },
  makeupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d323f',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  makeupItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  makeupItemTextCol: {
    marginLeft: 12,
  },
  makeupItemTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  makeupItemSub: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  makeupStartBtn: {
    backgroundColor: '#ff9f43',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  makeupStartBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyMakeupText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
