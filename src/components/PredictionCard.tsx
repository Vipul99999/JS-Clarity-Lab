"use client";

import { useMemo, useState } from "react";
import { Check, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Prediction } from "@/engine/types";
import { cn } from "@/lib/utils";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

type PredictionCardProps = {
  prediction: Prediction;
  submitted: boolean;
  onSubmit: () => void;
};

export function PredictionCard({ prediction, submitted, onSubmit }: PredictionCardProps) {
  const [choice, setChoice] = useState("");
  const [text, setText] = useState("");
  const [order, setOrder] = useState(prediction.type === "order" ? prediction.options : []);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const isCorrect = useMemo(() => {
    if (prediction.type === "mcq") return choice === prediction.correct;
    if (prediction.type === "text") return normalize(text) === normalize(prediction.correct);
    return order.join("|") === prediction.correct.join("|");
  }, [choice, order, prediction, text]);

  function submit() {
    onSubmit();
  }

  function move(from: number, to: number) {
    setOrder((items) => {
      const next = [...items];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Prediction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <p className="text-sm font-medium">{prediction.question}</p>
        {prediction.type === "mcq" ? (
          <div className="grid gap-2">
            {prediction.options.map((option) => (
              <button
                key={option}
                onClick={() => setChoice(option)}
                disabled={submitted}
                className={cn(
                  "rounded-md border bg-white px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                  choice === option && "border-primary bg-teal-50"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
        {prediction.type === "text" ? (
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={submitted}
            placeholder={prediction.placeholder}
            className="h-10 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        ) : null}
        {prediction.type === "order" ? (
          <div className="space-y-2">
            {order.map((item, index) => (
              <div
                key={item}
                draggable={!submitted}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null && dragIndex !== index) move(dragIndex, index);
                  setDragIndex(null);
                }}
                className="flex cursor-grab items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-semibold">{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={submit} disabled={submitted || (prediction.type === "mcq" && !choice)}>
            Lock prediction
          </Button>
          {submitted ? (
            <div className={cn("flex items-center gap-2 text-sm font-medium", isCorrect ? "text-teal-700" : "text-red-700")}>
              {isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {isCorrect ? "Correct" : "Compare with the run"}
            </div>
          ) : null}
        </div>
        {submitted ? (
          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            <span className="font-semibold">Correct answer: </span>
            {prediction.type === "order" ? prediction.correct.join(" -> ") : prediction.correct}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
