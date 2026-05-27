export interface User {
  id: string;
  email?: string;
  phone?: string;
  fullName: string;
  role: string;
  plan?: string;
  targetScore?: number;
  age?: number;
  avatar?: string;
}

export interface Plan {
  id: string;
  title: string;
  budget: number;
  spent: number;
  intervalHours: number;
  createdAt: string;
  isActive: boolean;
}

export interface CheckIn {
  id: string;
  planId: string;
  photoUri: string | null;
  amountSpent: number;
  notes: string;
  timestamp: string;
  status: 'completed' | 'skipped' | 'pending';
  visibility: 'public' | 'private' | 'friends';
}
