export interface NutritionData {
  isFoodLabel: boolean;
  productName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  healthSummary: string;
  pros: string[];
  cons: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}