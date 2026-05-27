import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CheckIn } from '../shared/types';


interface CheckInsState {
  CheckIns: CheckIn[];
}

const initialState: CheckInsState = {
  CheckIns: [],
};

const CheckInsSlice = createSlice({
  name: 'CheckIns',
  initialState,
  reducers: {
    addCheckIn: (state, action: PayloadAction<Omit<CheckIn, 'timestamp'>>) => {
      const newCheckIn: CheckIn = {
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
      state.CheckIns.unshift(newCheckIn); // Show newest first
    },
    addPendingCheckIn: (state, action: PayloadAction<{ id: string; planId: string }>) => {
      const newCheckIn: CheckIn = {
        id: action.payload.id,
        planId: action.payload.planId,
        photoUri: null,
        amountSpent: 0,
        notes: 'Chưa check-in',
        timestamp: new Date().toISOString(),
        status: 'pending',
        visibility: 'private',
      };
      state.CheckIns.unshift(newCheckIn);
    },
    skipCheckIn: (state, action: PayloadAction<{ id: string; planId: string }>) => {
      const newCheckIn: CheckIn = {
        id: action.payload.id,
        planId: action.payload.planId,
        photoUri: null,
        amountSpent: 0,
        notes: 'Đã bỏ qua check-in',
        timestamp: new Date().toISOString(),
        status: 'skipped',
        visibility: 'private',
      };
      state.CheckIns.unshift(newCheckIn);
    },
    completePendingCheckIn: (
      state,
      action: PayloadAction<{
        id: string;
        photoUri: string;
        amountSpent: number;
        notes: string;
        visibility: 'public' | 'private' | 'friends';
      }>
    ) => {
      const { id, photoUri, amountSpent, notes, visibility } = action.payload;
      const CheckIn = state.CheckIns.find(c => c.id === id);
      if (CheckIn) {
        CheckIn.photoUri = photoUri;
        CheckIn.amountSpent = amountSpent;
        CheckIn.notes = notes;
        CheckIn.visibility = visibility;
        CheckIn.status = 'completed';
        CheckIn.timestamp = new Date().toISOString(); // Update timestamp to now
      }
    },
    deleteCheckIn: (state, action: PayloadAction<string>) => {
      state.CheckIns = state.CheckIns.filter(c => c.id !== action.payload);
    },
    hydrateCheckIns: (state, action: PayloadAction<CheckIn[]>) => {
      state.CheckIns = action.payload;
    },
  },
});

export const {
  addCheckIn,
  skipCheckIn,
  deleteCheckIn,
  hydrateCheckIns,
  addPendingCheckIn,
  completePendingCheckIn,
} = CheckInsSlice.actions;

export default CheckInsSlice.reducer;
