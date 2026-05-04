export type MeetPepLocale = "tr" | "en";

export type LocalizedText = Record<MeetPepLocale, string>;

export type MeetPepStepType =
  | "singleChoice"
  | "multiChoice"
  | "text"
  | "number"
  | "date"
  | "message"
  | "end";

export type MeetPepOption = {
  id: string;
  label: LocalizedText;
  value: string;
  nextStepId?: string;
};

export type MeetPepConditionOperator =
  | "equals"
  | "notEquals"
  | "includes"
  | "exists";

export type MeetPepCondition = {
  answerKey: string;
  operator: MeetPepConditionOperator;
  value?: string;
  nextStepId: string;
};

export type MeetPepStep = {
  id: string;
  type: MeetPepStepType;
  answerKey?: string;
  title: LocalizedText;
  description?: LocalizedText;
  placeholder?: LocalizedText;
  options?: MeetPepOption[];
  required?: boolean;
  nextStepId?: string;
  conditions?: MeetPepCondition[];
  storeLinks?: {
    appStore?: string;
    googlePlay?: string;
  };
};

export type MeetPepFlow = {
  id: string;
  version: string;
  name: string;
  startStepId: string;
  locales: MeetPepLocale[];
  steps: MeetPepStep[];
};

export type MeetPepAnswerValue = string | string[] | number | boolean | null;

export type MeetPepAnswers = Record<string, MeetPepAnswerValue>;

export type MeetPepRuntimeState = {
  flowId: string;
  version: string;
  currentStepId: string;
  answers: MeetPepAnswers;
  history: string[];
  completed: boolean;
};