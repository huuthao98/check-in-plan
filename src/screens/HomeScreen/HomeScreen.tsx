import {
  Text,
  View,
  Image,
  Modal,
  Alert,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';

import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { RootState } from '@/store';
import { addPendingCheckIn, skipCheckIn } from '@/store/checkInsSlice';
import { CheckIn } from '@/shared/types';
import { logout } from '@/store/authSlice';
import { setAuthToken } from '@/services/api';
import Header from '@/shared/layout/Header';
import { styles } from './styles';

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
      {/* Top Bar with CheckIn Branding, Logout & Makeup Button */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.logoText}>CheckIn Plan</Text>
          <TouchableOpacity 
            style={{ marginLeft: 15, padding: 5 }} 
            onPress={() => {
              Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
                { text: 'Hủy', style: 'cancel' },
                { 
                  text: 'Đăng xuất', 
                  style: 'destructive', 
                  onPress: () => {
                    dispatch(logout());
                    setAuthToken(null);
                  } 
                }
              ]);
            }}
          >
            <Ionicons name="log-out-outline" size={22} color="#ff4d4d" />
          </TouchableOpacity>
        </View>

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

      {plans.length > 0 && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlSubBtn} onPress={pickImage}>
            <Ionicons name="images-outline" size={24} color="#fff" />
            <Text style={styles.controlSubText}>Thư viện</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
            <View style={styles.captureInner} />
          </TouchableOpacity>

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
