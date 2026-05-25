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
  plans: [
    {
      id: 'general',
      title: 'Chung',
      budget: 0,
      spent: 0,
      intervalHours: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ],
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
      const hasGeneral = state.plans.some(p => p.id === 'general');
      if (!hasGeneral) {
        state.plans.unshift({
          id: 'general',
          title: 'Chung',
          budget: 0,
          spent: 0,
          intervalHours: 0,
          createdAt: new Date().toISOString(),
          isActive: true,
        });
      }
    },
    togglePlanActive: (state, action: PayloadAction<string>) => {
      const plan = state.plans.find(p => p.id === action.payload);
      if (plan) {
        plan.isActive = !plan.isActive;
      }
    },
    hydratePlans: (state, action: PayloadAction<Plan[]>) => {
      const plans = action.payload || [];
      const hasGeneral = plans.some(p => p.id === 'general');
      if (!hasGeneral) {
        state.plans = [
          {
            id: 'general',
            title: 'Chung',
            budget: 0,
            spent: 0,
            intervalHours: 0,
            createdAt: new Date().toISOString(),
            isActive: true,
          },
          ...plans,
        ];
      } else {
        state.plans = plans;
      }
    }
  },
});

export const { addPlan, updatePlanSpent, deletePlan, togglePlanActive, hydratePlans } = plansSlice.actions;
export default plansSlice.reducer;
