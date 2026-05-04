

"use client";

import { useMemo, useRef, useState } from "react";

import { MeetPepRuntime } from "@/features/meet-pep/runtime/MeetPepRuntime";
import { Button } from "@/components/ui/button";
import { getMeetPepFlow } from "@/features/meet-pep/lib/getFlow";
import type {
  MeetPepFlow,
  MeetPepLocale,
  MeetPepOption,
  MeetPepStep,
  MeetPepStepType,
} from "@/features/meet-pep/lib/schema";

export function MeetPepBuilder() {
  const initialFlow = useMemo(() => getMeetPepFlow(), []);
  const [flow, setFlow] = useState<MeetPepFlow>(initialFlow);
  const [selectedStepId, setSelectedStepId] = useState(flow.steps[0]?.id ?? "");
  const [locale, setLocale] = useState<MeetPepLocale>("tr");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedStep = flow.steps.find((step) => step.id === selectedStepId);

  const stepTypes: MeetPepStepType[] = [
    "message",
    "singleChoice",
    "multiChoice",
    "text",
    "number",
    "date",
    "end",
  ];

  const updateStep = (field: "title" | "description", value: string) => {
    if (!selectedStep) return;

    setFlow((current) => ({
      ...current,
      steps: current.steps.map((step) =>
        step.id === selectedStep.id
          ? {
              ...step,
              [field]: {
                ...step[field],
                [locale]: value,
              },
            }
          : step
      ),
    }));
  };

  const updateStoreLink = (field: "appStore" | "googlePlay", value: string) => {
    if (!selectedStep) return;

    setFlow((current) => ({
      ...current,
      steps: current.steps.map((step) =>
        step.id === selectedStep.id
          ? {
              ...step,
              storeLinks: {
                ...step.storeLinks,
                [field]: value,
              },
            }
          : step
      ),
    }));
  };

  const updateStepType = (type: MeetPepStepType) => {
    if (!selectedStep) return;

    setFlow((current) => ({
      ...current,
      steps: current.steps.map((step) => {
        if (step.id !== selectedStep.id) return step;

        const shouldHaveOptions = type === "singleChoice" || type === "multiChoice";
        const shouldHaveAnswerKey =
          type === "singleChoice" ||
          type === "multiChoice" ||
          type === "text" ||
          type === "number" ||
          type === "date";

        return {
          ...step,
          type,
          answerKey: shouldHaveAnswerKey ? step.answerKey ?? `${step.id}Answer` : undefined,
          options: shouldHaveOptions
            ? step.options?.length
              ? step.options
              : [
                  {
                    id: `option-${Date.now()}`,
                    label: {
                      tr: "Yeni seçenek",
                      en: "New option",
                    },
                    value: "option_1",
                  },
                ]
            : undefined,
        };
      }),
    }));
  };

  const addStep = () => {
    const nextIndex = flow.steps.length + 1;
    const newStepId = `step-${Date.now()}`;
    const newStep: MeetPepStep = {
      id: newStepId,
      type: "singleChoice",
      answerKey: `step${nextIndex}Answer`,
      title: {
        tr: `Yeni soru ${nextIndex}`,
        en: `New question ${nextIndex}`,
      },
      description: {
        tr: "Bu sorunun açıklamasını yaz.",
        en: "Write the description for this question.",
      },
      required: true,
      options: [
        {
          id: `option-${Date.now()}`,
          label: {
            tr: "Yeni seçenek",
            en: "New option",
          },
          value: "option_1",
        },
      ],
      nextStepId: flow.steps[flow.steps.length - 1]?.id,
    };

    setFlow((current) => ({
      ...current,
      steps: [...current.steps, newStep],
    }));
    setSelectedStepId(newStepId);
  };

  const removeStep = (stepId: string) => {
    if (flow.steps.length <= 1) return;

    setFlow((current) => {
      const nextSteps = current.steps.filter((step) => step.id !== stepId);
      const fallbackStepId = nextSteps[0]?.id ?? "";

      return {
        ...current,
        startStepId:
          current.startStepId === stepId ? fallbackStepId : current.startStepId,
        steps: nextSteps.map((step) => ({
          ...step,
          nextStepId: step.nextStepId === stepId ? undefined : step.nextStepId,
        })),
      };
    });

    if (selectedStepId === stepId) {
      const fallback = flow.steps.find((step) => step.id !== stepId)?.id ?? "";
      setSelectedStepId(fallback);
    }
  };

  const duplicateStep = (stepId: string) => {
    const sourceStep = flow.steps.find((step) => step.id === stepId);
    if (!sourceStep) return;

    const nextIndex = flow.steps.length + 1;
    const duplicatedStepId = `step-${Date.now()}`;
    const duplicatedStep: MeetPepStep = {
      ...sourceStep,
      id: duplicatedStepId,
      answerKey: sourceStep.answerKey ? `${sourceStep.answerKey}Copy${nextIndex}` : undefined,
      title: {
        tr: `${sourceStep.title.tr} kopya`,
        en: `${sourceStep.title.en} copy`,
      },
      options: sourceStep.options?.map((option, optionIndex) => ({
        ...option,
        id: `option-${Date.now()}-${optionIndex}`,
      })),
    };

    setFlow((current) => {
      const sourceIndex = current.steps.findIndex((step) => step.id === stepId);
      const nextSteps = [...current.steps];
      nextSteps.splice(sourceIndex + 1, 0, duplicatedStep);

      return {
        ...current,
        steps: nextSteps,
      };
    });
    setSelectedStepId(duplicatedStepId);
  };

  const moveStep = (stepId: string, direction: "up" | "down") => {
    setFlow((current) => {
      const currentIndex = current.steps.findIndex((step) => step.id === stepId);
      if (currentIndex === -1) return current;

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= current.steps.length) return current;

      const nextSteps = [...current.steps];
      const [movedStep] = nextSteps.splice(currentIndex, 1);
      nextSteps.splice(targetIndex, 0, movedStep);

      return {
        ...current,
        steps: nextSteps,
      };
    });
  };

  const updateOption = (
    optionId: string,
    field: "label" | "value",
    value: string
  ) => {
    if (!selectedStep) return;

    setFlow((current) => ({
      ...current,
      steps: current.steps.map((step) => {
        if (step.id !== selectedStep.id) return step;

        return {
          ...step,
          options: step.options?.map((option) =>
            option.id === optionId
              ? field === "label"
                ? {
                    ...option,
                    label: {
                      ...option.label,
                      [locale]: value,
                    },
                  }
                : {
                    ...option,
                    value,
                  }
              : option
          ),
        };
      }),
    }));
  };

  const addOption = () => {
    if (!selectedStep) return;

    const nextIndex = (selectedStep.options?.length ?? 0) + 1;
    const newOption: MeetPepOption = {
      id: `option-${Date.now()}`,
      label: {
        tr: `Yeni seçenek ${nextIndex}`,
        en: `New option ${nextIndex}`,
      },
      value: `option_${nextIndex}`,
    };

    setFlow((current) => ({
      ...current,
      steps: current.steps.map((step) =>
        step.id === selectedStep.id
          ? {
              ...step,
              options: [...(step.options ?? []), newOption],
            }
          : step
      ),
    }));
  };

  const removeOption = (optionId: string) => {
    if (!selectedStep) return;

    setFlow((current) => ({
      ...current,
      steps: current.steps.map((step) =>
        step.id === selectedStep.id
          ? {
              ...step,
              options: step.options?.filter((option) => option.id !== optionId),
            }
          : step
      ),
    }));
  };

  const exportFlow = () => {
    const blob = new Blob([JSON.stringify(flow, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${flow.id}-${flow.version}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as MeetPepFlow;

      if (!parsed.steps?.length) return;

      setFlow(parsed);
      setSelectedStepId(parsed.steps[0]?.id ?? "");
    } catch (error) {
      console.error("Invalid flow JSON", error);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 bg-background p-6 xl:grid-cols-[280px_minmax(420px,1fr)_480px]">
      <aside className="rounded-3xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Steps
          </h2>
          <Button size="sm" variant="outline" onClick={addStep}>
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {flow.steps.map((step, index) => (
            <div
              key={step.id}
              className={`rounded-2xl border transition-colors ${
                selectedStepId === step.id
                  ? "border-accent bg-accent/10"
                  : "border-border/50 bg-background hover:border-accent/40"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedStepId(step.id)}
                className="w-full px-3 py-3 text-left"
              >
                <p className="text-xs font-medium text-muted-foreground">#{index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{step.title[locale]}</p>
                <p className="mt-1 text-xs text-muted-foreground">{step.type}</p>
              </button>
              <div className="flex flex-wrap gap-3 border-t border-border/40 px-3 py-2">
                <button
                  type="button"
                  onClick={() => moveStep(step.id, "up")}
                  disabled={index === 0}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(step.id, "down")}
                  disabled={index === flow.steps.length - 1}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => duplicateStep(step.id)}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(step.id)}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Step Editor
          </h2>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={locale === "tr" ? "default" : "outline"}
              onClick={() => setLocale("tr")}
            >
              TR
            </Button>
            <Button
              size="sm"
              variant={locale === "en" ? "default" : "outline"}
              onClick={() => setLocale("en")}
            >
              EN
            </Button>
          </div>
        </div>

        {selectedStep ? (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Step Type</label>
              <select
                value={selectedStep.type}
                onChange={(event) => updateStepType(event.target.value as MeetPepStepType)}
                className="w-full rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
              >
                {stepTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Title</label>
              <input
                value={selectedStep.title[locale]}
                onChange={(event) => updateStep("title", event.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Description</label>
              <textarea
                value={selectedStep.description?.[locale] ?? ""}
                onChange={(event) => updateStep("description", event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
              />
            </div>

            <div className="rounded-2xl border border-border/60 bg-background p-4 text-xs text-muted-foreground">
              Step ID: {selectedStep.id}
            </div>

            {selectedStep.id === "complete" && (
              <div className="space-y-4 rounded-3xl border border-border/60 bg-background p-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Store Links</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add the download URLs shown on the final Meet Pep screen.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      App Store URL
                    </label>
                    <input
                      value={selectedStep.storeLinks?.appStore ?? ""}
                      onChange={(event) => updateStoreLink("appStore", event.target.value)}
                      placeholder="https://apps.apple.com/..."
                      className="w-full rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      Google Play URL
                    </label>
                    <input
                      value={selectedStep.storeLinks?.googlePlay ?? ""}
                      onChange={(event) => updateStoreLink("googlePlay", event.target.value)}
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      className="w-full rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedStep.type === "singleChoice" || selectedStep.type === "multiChoice") && (
              <div className="space-y-4 rounded-3xl border border-border/60 bg-background p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Options</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Edit answer choices for the selected locale.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={addOption}>
                    Add option
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedStep.options?.map((option, index) => (
                    <div
                      key={option.id}
                      className="rounded-2xl border border-border/60 bg-card/60 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Option {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeOption(option.id)}
                          className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-medium text-muted-foreground">
                            Label ({locale.toUpperCase()})
                          </label>
                          <input
                            value={option.label[locale]}
                            onChange={(event) => updateOption(option.id, "label", event.target.value)}
                            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium text-muted-foreground">
                            Value
                          </label>
                          <input
                            value={option.value}
                            onChange={(event) => updateOption(option.id, "value", event.target.value)}
                            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>

      <section className="space-y-6">
        <div className="rounded-3xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Preview
            </p>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={triggerImport}>
                Import
              </Button>
              <Button size="sm" onClick={exportFlow}>
                Save JSON
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
          <MeetPepRuntime locale={locale} />
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            JSON Export
          </p>
          <pre className="max-h-[320px] overflow-auto rounded-2xl bg-background p-4 text-xs text-muted-foreground">
            {JSON.stringify(flow, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}