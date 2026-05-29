import { StyleSheet, Dimensions } from 'react-native';
import { ThemeColors } from '@/shared/theme/colors';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 2 columns grid

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  filterChipTextActive: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  gridContainer: {
    padding: 16,
  },
  gridItem: {
    width: COLUMN_WIDTH,
    margin: 8,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDark,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.background === '#0c0f14' ? 0.2 : 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDetails: {
    padding: 10,
  },
  itemPlanName: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  itemNote: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
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
    color: colors.primary,
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
    borderColor: colors.borderDark,
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
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalAmount: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  notesContainer: {
    marginTop: 12,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 12,
  },
  notesLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  modalNotes: {
    color: colors.text,
    fontSize: 14,
    marginTop: 4,
  },
});
