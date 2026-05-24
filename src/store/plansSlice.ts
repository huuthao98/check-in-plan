import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Plan {
  id: string;
  title: string;
  budget: number;
  spent: number;
  intervalHours: number;
  createdAt: string;
  isActive: boolean;
}

interface PlansState {
  plans: Plan[];
}

const initialState: PlansState = {
  plans: [],
};

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    addPlan: (state, action: PayloadAction<Omit<Plan, 'spent' | 'createdAt' | 'isActive'>>) => {
      const newPlan: Plan = {
        ...action.payload,
        spent: 0,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      state.plans.push(newPlan);
    },
    updatePlanSpent: (state, action: PayloadAction<{ planId: string; amount: number }>) => {
      const { planId, amount } = action.payload;
      const plan = state.plans.find(p => p.id === planId);
      if (plan) {
        plan.spent += amount;
      }
    },
    deletePlan: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter(p => p.id !== action.payload);
    },
    togglePlanActive: (state, action: PayloadAction<string>) => {
      const plan = state.plans.find(p => p.id === action.payload);
      if (plan) {
        plan.isActive = !plan.isActive;
      }
    },
    hydratePlans: (state, action: PayloadAction<Plan[]>) => {
      state.plans = action.payload;
    }
  },
});

export const { addPlan, updatePlanSpent, deletePlan, togglePlanActive, hydratePlans } = plansSlice.actions;
export default plansSlice.reducer;
