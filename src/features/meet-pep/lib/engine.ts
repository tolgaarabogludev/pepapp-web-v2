import type {
    MeetPepAnswerValue,
    MeetPepAnswers,
    MeetPepCondition,
    MeetPepFlow,
    MeetPepRuntimeState,
    MeetPepStep,
  } from "./schema";
  
  export function getStepById(flow: MeetPepFlow, stepId: string): MeetPepStep | undefined {
    return flow.steps.find((step) => step.id === stepId);
  }
  
  export function createInitialState(flow: MeetPepFlow): MeetPepRuntimeState {
    return {
      flowId: flow.id,
      version: flow.version,
      currentStepId: flow.startStepId,
      answers: {},
      history: [flow.startStepId],
      completed: false,
    };
  }
  
  export function setAnswer(
    state: MeetPepRuntimeState,
    answerKey: string,
    value: MeetPepAnswerValue
  ): MeetPepRuntimeState {
    return {
      ...state,
      answers: {
        ...state.answers,
        [answerKey]: value,
      },
    };
  }
  
  function evaluateCondition(
    condition: MeetPepCondition,
    answers: MeetPepAnswers
  ): boolean {
    const value = answers[condition.answerKey];
  
    switch (condition.operator) {
      case "equals":
        return value === condition.value;
  
      case "notEquals":
        return value !== condition.value;
  
      case "includes":
        return Array.isArray(value) && value.includes(condition.value ?? "");
  
      case "exists":
        return value !== undefined && value !== null && value !== "";
  
      default:
        return false;
    }
  }
  
  export function resolveNextStepId(
    flow: MeetPepFlow,
    step: MeetPepStep,
    answers: MeetPepAnswers
  ): string | null {
    if (step.conditions?.length) {
      const matched = step.conditions.find((condition) =>
        evaluateCondition(condition, answers)
      );
  
      if (matched) return matched.nextStepId;
    }
  
    if (step.nextStepId) return step.nextStepId;
  
    return null;
  }
  
  export function goToNextStep(
    flow: MeetPepFlow,
    state: MeetPepRuntimeState
  ): MeetPepRuntimeState {
    const currentStep = getStepById(flow, state.currentStepId);
  
    if (!currentStep) {
      return {
        ...state,
        completed: true,
      };
    }
  
    const nextStepId = resolveNextStepId(flow, currentStep, state.answers);
  
    if (!nextStepId) {
      return {
        ...state,
        completed: true,
      };
    }
  
    return {
      ...state,
      currentStepId: nextStepId,
      history: [...state.history, nextStepId],
    };
  }