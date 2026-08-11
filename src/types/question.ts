export type QuestionType =
  | 'text'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'number'
  | 'scale'
  | 'date';

export interface FormQuestionOption {
  id: string;
  label: string;
  value: string;
  profileWeight?: string;
}

export interface FormQuestion {
  id: string;
  key: string; // Internal key/identifier
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  category: string; // e.g. "Identificação", "Perfil Profissional", "Financeiro"
  options?: FormQuestionOption[];
  placeholder?: string;
  minScale?: number;
  maxScale?: number;
  minScaleLabel?: string;
  maxScaleLabel?: string;
  order: number;
}

export interface FormSchema {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
  updatedAt: string;
}
