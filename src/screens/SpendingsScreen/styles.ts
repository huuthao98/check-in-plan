import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 2 columns grid

export const styles = StyleSheet.create({
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
