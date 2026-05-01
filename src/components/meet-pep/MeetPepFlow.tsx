"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Answers {
  name: string;
  age: string;
  timeAnswer: string;
  mood: string;
  energy: string;
  need: string;
  tone: string;
}

interface Message {
  id: string;
  from: "pep" | "user";
  text: string;
}

type InputMode =
  | { type: "text"; placeholder: string }
  | { type: "options"; options: string[] }
  | { type: "final" }
  | { type: "none" };

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _id = 0;
const uid = () => `m${++_id}`;

function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

function getMoodSentiment(text: string): "negative" | "positive" | "neutral" {
  const l = text.toLowerCase();
  const neg = [
    "yorgun", "tired", "sad", "üzgün", "anxious", "endişeli",
    "stresli", "stressed", "sıkıl", "bored", "kötü", "bad",
    "sinirli", "ağır", "yalnız", "lonely", "hasta", "zor",
  ];
  const pos = [
    "iyi", "good", "güzel", "mutlu", "happy", "harika",
    "great", "enerjik", "energetic", "mükemmel", "excellent",
    "süper", "neşeli", "pozitif",
  ];
  if (neg.some((k) => l.includes(k))) return "negative";
  if (pos.some((k) => l.includes(k))) return "positive";
  return "neutral";
}

// ─── Flow Definition ─────────────────────────────────────────────────────────

const timeQuestions: Record<string, string> = {
  morning: "Sabahları biraz yavaş başlamayı severim. Senin sabahların nasıl geçer?",
  afternoon: "Muhteşem bir gün di m? Senin günün nasıl geçiyor?",
  evening: "Akşamları biraz daha sakinleşiyorum. Sen günün bu saatlerinde nasıl hissedersin?",
  night: "Gece biraz daha sessiz konuşurum. Şu an nasıl hissediyorsun?",
};

const energyReplies: Record<string, string> = {
  "Yüksek": "Bu enerjiyi birlikte değerlendirelim.",
  "Dalgalı": "Dalgalar normaldir. Seninle birlikte yüzeceğiz.",
  "Düşük": "Anladım. Biraz daha hafif adımlarla gidelim.",
  "Emin değilim": "Bazen en dürüst cevap bu. Birlikte keşfederiz.",
};

interface FlowStep {
  openers: (answers: Answers) => string[];
  input: InputMode;
  respond: (input: string, answers: Answers) => string[];
  storeKey: keyof Answers | null;
}

const FLOW: FlowStep[] = [
  {
    openers: () => [
      "Merhaba. Ben Pep.",
      "Muhtemelen gelecekteki en yakın arkadaşın benim.",
      "Senin adın ne?",
    ],
    input: { type: "text", placeholder: "İsmin..." },
    respond: (v) => [`Tanıştığımıza sevindim, ${v}.`],
    storeKey: "name",
  },
  {
    openers: () => ["kaç yaşındasın?."],
    input: { type: "text", placeholder: "Yaşın..." },
    respond: (_, a) => [
      `Oooo aynı yaşlarda sayılırız çok iyi anlaşacağımıza neredeyse eminim artık, ${a.name} <3<3<3.`,
    ],
    storeKey: "age",
  },
  {
    openers: () => [timeQuestions[getTimeOfDay()]],
    input: { type: "text", placeholder: "Aklına geleni yaz..." },
    respond: () => ["Aaa neler oldu bugün?."],
    storeKey: "timeAnswer",
  },
  {
    openers: () => ["Bugün nasıl hissediyorsun?"],
    input: { type: "text", placeholder: "Bugün nasılsın?" },
    respond: (v) => {
      const s = getMoodSentiment(v);
      if (s === "negative")
        return ["O zaman bugün senden biraz daha yumuşak davranmanı isteyebilirim."];
      if (s === "positive")
        return ["Bunu sevdim. Bugün o iyi hissi biraz koruyalım."];
      return ["Anlıyorum. Her hal bir şey söyler."];
    },
    storeKey: "mood",
  },
  {
    openers: () => ["Son zamanlarda enerjin daha çok nasıl akıyor?"],
    input: {
      type: "options",
      options: ["Yüksek", "Dalgalı", "Düşük", "Emin değilim"],
    },
    respond: (v) => [energyReplies[v] ?? "Tamam. Devam edelim."],
    storeKey: "energy",
  },
  {
    openers: () => ["En çok ne zaman birinin sana iyi gelmesini istiyorsun?"],
    input: {
      type: "options",
      options: [
        "Kendimi yorgun hissettiğimde",
        "Duygularım karıştığında",
        "Regl dönemimde",
        "Sadece konuşmak istediğimde",
      ],
    },
    respond: (_, a) => [`Bunu hatırlayacağım, ${a.name}.`],
    storeKey: "need",
  },
  {
    openers: () => ["Sana nasıl yaklaşmamı istersin?"],
    input: {
      type: "options",
      options: ["Daha yumuşak", "Daha net", "Daha motive edici", "Daha sakin"],
    },
    respond: () => ["Tamam. Sana böyle yaklaşırım."],
    storeKey: "tone",
  },
  {
    openers: () => [
      "Artık nereden başlayacağımı biliyorum.",
      "Geri kalanını zamanla öğrenirim.",
      "Hadi tanışmaya devam edelim.",
    ],
    input: { type: "final" },
    respond: () => [],
    storeKey: null,
  },
];

const TOTAL_CONTENT_STEPS = FLOW.length - 1;

// ─── Sub-components ──────────────────────────────────────────────────────────

function PepOrb({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <div
      className={cn(
        "relative flex-shrink-0 rounded-full",
        size === "sm" ? "w-8 h-8" : "w-16 h-16"
      )}
    >
      <div className="absolute inset-0 rounded-full bg-accent/25 blur-md scale-110 animate-glow-pulse" />
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-accent/70 via-accent/50 to-accent/30 border border-accent/30 shadow-md flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <div
          className={cn(
            "rounded-full bg-gradient-to-br from-white/30 to-transparent",
            size === "sm" ? "w-3 h-3" : "w-6 h-6"
          )}
        />
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: `${i * 0.16}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

function PepMessage({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2.5 animate-fade-up">
      <PepOrb size="sm" />
      <div className="max-w-[82%] bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm">
        {text}
      </div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end animate-fade-up">
      <div className="max-w-[78%] bg-foreground text-background rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed shadow-sm">
        {text}
      </div>
    </div>
  );
}

// ─── Input Components ─────────────────────────────────────────────────────────

function TextInput({
  placeholder,
  onSubmit,
}: {
  placeholder: string;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }, [value, onSubmit]);

  return (
    <div className="flex items-center gap-2 bg-muted/50 border border-border/60 rounded-full px-4 py-2.5 shadow-sm">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-w-0"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0",
          value.trim()
            ? "bg-accent text-accent-foreground shadow-sm scale-100"
            : "bg-muted text-muted-foreground/40 scale-90"
        )}
        aria-label="Gönder"
      >
        <Send className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function OptionsInput({
  options,
  onSelect,
}: {
  options: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={cn(
            "px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200",
            "border-border/70 bg-card/80 text-foreground",
            "hover:border-accent/60 hover:bg-accent/8 hover:text-accent",
            "active:scale-[0.97]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function FinalButton() {
  return (
    <div className="flex justify-center">
      <a
        href="#"
        className={cn(
          "inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full",
          "bg-foreground text-background font-medium text-sm",
          "hover:bg-foreground/88 active:scale-[0.98]",
          "transition-all duration-200 shadow-lg"
        )}
      >
        App Store&apos;da Devam Et
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const progress = Math.min((step / TOTAL_CONTENT_STEPS) * 100, 100);
  return (
    <div className="h-[2px] bg-border/40 rounded-full overflow-hidden">
      <div
        className="h-full bg-accent/60 rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MeetPepFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MeetPepFlow({ isOpen, onClose }: MeetPepFlowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>({ type: "none" });
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    name: "", age: "", timeAnswer: "", mood: "",
    energy: "", need: "", tone: "",
  });
  const [started, setStarted] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const showPepMessages = useCallback(
    (texts: string[], onDone?: () => void) => {
      const seq = ++seqRef.current;

      const next = (i: number) => {
        if (seq !== seqRef.current) return;
        if (i >= texts.length) {
          onDone?.();
          return;
        }
        setIsTyping(true);
        const delay = Math.min(700 + texts[i].length * 28, 1800);
        setTimeout(() => {
          if (seq !== seqRef.current) return;
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            { id: uid(), from: "pep", text: texts[i] },
          ]);
          setTimeout(() => {
            if (seq !== seqRef.current) return;
            next(i + 1);
          }, 380);
        }, delay);
      };

      next(0);
    },
    []
  );

  const runStep = useCallback(
    (idx: number, currentAnswers: Answers) => {
      const step = FLOW[idx];
      if (!step) return;
      setInputMode({ type: "none" });
      showPepMessages(step.openers(currentAnswers), () => {
        setInputMode(step.input);
      });
    },
    [showPepMessages]
  );

  useEffect(() => {
    if (isOpen && !started) {
      setStarted(true);
      const emptyAnswers: Answers = {
        name: "", age: "", timeAnswer: "", mood: "",
        energy: "", need: "", tone: "",
      };
      setMessages([]);
      setStepIndex(0);
      setAnswers(emptyAnswers);
      runStep(0, emptyAnswers);
    }
    if (!isOpen) {
      seqRef.current++;
      setStarted(false);
      setMessages([]);
      setIsTyping(false);
      setInputMode({ type: "none" });
      setStepIndex(0);
    }
  }, [isOpen, started, runStep]);

  const handleUserInput = useCallback(
    (value: string) => {
      const step = FLOW[stepIndex];
      if (!step) return;

      setInputMode({ type: "none" });

      const newAnswers = { ...answers };
      if (step.storeKey) {
        newAnswers[step.storeKey] = value;
      }
      setAnswers(newAnswers);

      setMessages((prev) => [
        ...prev,
        { id: uid(), from: "user", text: value },
      ]);

      const responseMessages = step.respond(value, newAnswers);
      const nextIndex = stepIndex + 1;

      const advance = () => {
        setStepIndex(nextIndex);
        runStep(nextIndex, newAnswers);
      };

      if (responseMessages.length > 0) {
        showPepMessages(responseMessages, advance);
      } else {
        advance();
      }
    },
    [stepIndex, answers, showPepMessages, runStep]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-background/70 backdrop-blur-2xl animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* Ambient glow */}
      <div className="fixed inset-0 z-[91] pointer-events-none overflow-hidden animate-fade-in">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/8 rounded-full blur-[100px] animate-glow-pulse" />
      </div>

      {/* Panel */}
      <div className="fixed inset-0 z-[92] flex items-center justify-center p-4 md:p-8 pointer-events-none animate-fade-up">
        <div
          className={cn(
            "w-full max-w-md h-full max-h-[720px] flex flex-col",
            "bg-background/95 border border-border/60 rounded-3xl shadow-2xl",
            "pointer-events-auto overflow-hidden"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <PepOrb size="sm" />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none mb-0.5">
                    Pep
                  </p>
                  <p className="text-[11px] text-accent flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                    Seninle burada
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ProgressBar step={Math.min(stepIndex, TOTAL_CONTENT_STEPS)} />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scroll-smooth">
            {messages.map((msg) =>
              msg.from === "pep" ? (
                <PepMessage key={msg.id} text={msg.text} />
              ) : (
                <UserMessage key={msg.id} text={msg.text} />
              )
            )}

            {isTyping && (
              <div className="flex items-end gap-2.5">
                <PepOrb size="sm" />
                <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-border/30">
            {inputMode.type === "text" && (
              <TextInput
                key="text-input"
                placeholder={inputMode.placeholder}
                onSubmit={handleUserInput}
              />
            )}
            {inputMode.type === "options" && (
              <OptionsInput
                key="options-input"
                options={inputMode.options}
                onSelect={handleUserInput}
              />
            )}
            {inputMode.type === "final" && <FinalButton />}
            {inputMode.type === "none" && <div className="h-10" />}
          </div>
        </div>
      </div>
    </>
  );
}
