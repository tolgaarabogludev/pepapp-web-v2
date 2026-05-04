"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { analytics } from "@/lib/analytics";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createInitialState,
  getStepById,
  goToNextStep,
  setAnswer,
} from "../lib/engine";
import { getMeetPepFlow } from "../lib/getFlow";
import type { MeetPepAnswerValue, MeetPepLocale, MeetPepOption } from "../lib/schema";

type MeetPepRuntimeProps = {
  locale: MeetPepLocale;
};

export function MeetPepRuntime({ locale }: MeetPepRuntimeProps) {
  const flow = useMemo(() => getMeetPepFlow(), []);
  const [state, setState] = useState(() => createInitialState(flow));
  const [textValue, setTextValue] = useState("");
  const [multiValue, setMultiValue] = useState<string[]>([]);
  const currentStep = getStepById(flow, state.currentStepId);

  const completedTrackedRef = useRef(false);

  if (!currentStep) return null;

  useEffect(() => {
    analytics.meetPepStepViewed(currentStep.id);

    if (currentStep.type === "end" && !completedTrackedRef.current) {
      analytics.meetPepCompleted();
      completedTrackedRef.current = true;
    }
  }, [currentStep.id, currentStep.type]);

  const title = currentStep.title[locale];
  const description = currentStep.description?.[locale];

  const copy = {
    tr: {
      continue: "Devam et",
      skip: "Geç",
      finish: "Tamamla",
      completed: "Tanışma tamamlandı.",
    },
    en: {
      continue: "Continue",
      skip: "Skip",
      finish: "Finish",
      completed: "Flow complete.",
    },
  }[locale];

  const resetStepInput = () => {
    setTextValue("");
    setMultiValue([]);
  };

  const moveNext = (nextState = state) => {
    setState(goToNextStep(flow, nextState));
    resetStepInput();
  };

  const handleNext = () => {
    moveNext();
  };

  const handleSingleChoice = (option: MeetPepOption) => {
    if (!currentStep.answerKey) return;
    analytics.meetPepOptionSelected(currentStep.id, option.id);
    const withAnswer = setAnswer(state, currentStep.answerKey, option.value);
    moveNext(withAnswer);
  };

  const toggleMultiChoice = (option: MeetPepOption) => {
    analytics.meetPepOptionSelected(currentStep.id, option.id);
    setMultiValue((current) =>
      current.includes(option.value)
        ? current.filter((value) => value !== option.value)
        : [...current, option.value]
    );
  };

  const handleSubmitAnswer = (value: MeetPepAnswerValue) => {
    if (!currentStep.answerKey) {
      moveNext();
      return;
    }

    const withAnswer = setAnswer(state, currentStep.answerKey, value);
    moveNext(withAnswer);
  };

  return (
    <div className="rounded-[2rem] border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-sm sm:p-8">
      <div className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Meet Pep
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {currentStep.type === "message" && (
        <Button onClick={handleNext} className="w-full sm:w-auto">
          {copy.continue}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}

      {currentStep.type === "singleChoice" && currentStep.options && (
        <div className="space-y-3">
          {currentStep.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSingleChoice(option)}
              className="w-full rounded-2xl border border-border/60 bg-background px-4 py-4 text-left text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              {option.label[locale]}
            </button>
          ))}
        </div>
      )}

      {currentStep.type === "multiChoice" && currentStep.options && (
        <div className="space-y-5">
          <div className="space-y-3">
            {currentStep.options.map((option) => {
              const selected = multiValue.includes(option.value);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleMultiChoice(option)}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background px-4 py-4 text-left text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <span>{option.label[locale]}</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/70 bg-card text-accent">
                    {selected ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            onClick={() => handleSubmitAnswer(multiValue)}
            className="w-full sm:w-auto"
            disabled={currentStep.required && multiValue.length === 0}
          >
            {copy.continue}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {currentStep.type === "text" && (
        <div className="space-y-5">
          <input
            value={textValue}
            onChange={(event) => setTextValue(event.target.value)}
            placeholder={currentStep.placeholder?.[locale]}
            className="w-full rounded-2xl border border-border/60 bg-background px-4 py-4 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/30"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => handleSubmitAnswer(textValue.trim())}
              className="w-full sm:w-auto"
              disabled={currentStep.required && textValue.trim().length === 0}
            >
              {copy.continue}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {!currentStep.required && (
              <Button
                variant="ghost"
                onClick={() => handleSubmitAnswer(null)}
                className="w-full sm:w-auto text-muted-foreground"
              >
                {copy.skip}
              </Button>
            )}
          </div>
        </div>
      )}

{currentStep.type === "end" && (
  <div className="space-y-5">
    <div className="rounded-2xl border border-border/60 bg-background px-4 py-4 text-sm text-muted-foreground">
      {copy.completed}
    </div>

    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={currentStep.storeLinks?.appStore ?? "#"}
        target="_blank"
        rel="noreferrer"
        onClick={() => analytics.meetPepStoreClicked("appStore")}
        className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
      >
        App Store’dan indir
      </a>

      <a
        href={currentStep.storeLinks?.googlePlay ?? "#"}
        target="_blank"
        rel="noreferrer"
        onClick={() => analytics.meetPepStoreClicked("googlePlay")}
        className="flex h-14 flex-1 items-center justify-center rounded-2xl border border-border/70 bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent/5"
      >
        Google Play’den indir
      </a>
    </div>
  </div>
)}
    </div>
  );
}