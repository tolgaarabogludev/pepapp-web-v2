"use client";

import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fadeInUp,
  staggerContainer,
  slideInLeft,
  slideInRight,
} from "@/lib/animations";

function ChatBubble({
  message,
  isUser,
}: {
  message: string;
  isUser: boolean;
}) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-accent/25 border border-accent/20 flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-foreground text-background rounded-br-sm"
            : "bg-card border border-border/60 text-foreground rounded-bl-sm"
        }`}
      >
        {message}
      </div>
    </div>
  );
}

function ChatMockup() {
  const t = useTranslations("pepTalk.chatExample");

  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -top-8 -right-8 w-56 h-56 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative rounded-3xl border border-border/60 bg-card shadow-xl overflow-hidden">
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/25 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">PepTalk</p>
            <p className="text-xs text-accent flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Çevrimiçi
            </p>
          </div>
        </div>

        {/* Chat body */}
        <div className="px-5 py-5 space-y-4">
          <ChatBubble message={t("userMessage")} isUser={true} />
          <div className="flex items-end gap-1.5 pl-9">
            <span className="text-xs text-muted-foreground/60">PepTalk yazıyor</span>
            <span className="flex gap-0.5 pb-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-muted-foreground/40 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </div>
          <ChatBubble message={t("aiMessage")} isUser={false} />

          {/* Quick replies */}
          <div className="flex gap-2 flex-wrap pl-9 pt-1">
            {["Daha fazla bilgi", "Önerileri gör"].map((q) => (
              <button
                key={q}
                className="text-xs px-3 py-1.5 rounded-full border border-accent/30 text-accent bg-accent/5 hover:bg-accent/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-border/50">
          <div className="flex items-center gap-3 bg-muted/50 rounded-full px-4 py-2.5">
            <span className="text-sm text-muted-foreground/50 flex-1">
              Bir şey sor...
            </span>
            <div className="w-7 h-7 rounded-full bg-accent/80 flex items-center justify-center">
              <ArrowRight className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PepTalk() {
  const t = useTranslations("pepTalk");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const points = ["personal", "empathetic", "actionable"] as const;

  return (
    <section id="peptalk" className="section-padding bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
        >
          {/* Chat visual */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="order-2 lg:order-1"
          >
            <ChatMockup />
          </motion.div>

          {/* Text content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="order-1 lg:order-2"
          >
            <motion.p
              variants={fadeInUp}
              className="text-xs font-semibold uppercase tracking-widest text-accent mb-4"
            >
              {t("eyebrow")}
            </motion.p>

            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold tracking-tightest text-foreground text-balance mb-6 leading-[1.06]"
            >
              {t("heading")
                .split("\n")
                .map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10"
            >
              {t("subheading")}
            </motion.p>

            <motion.ul variants={staggerContainer} className="space-y-4 mb-10">
              {points.map((point) => (
                <motion.li
                  key={point}
                  variants={fadeInUp}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {t(`points.${point}`)}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={fadeInUp}>
              <Button size="lg" variant="outline" className="group gap-2">
                {t("cta")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
