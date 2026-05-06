"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QueuePanelProps = {
  title: string;
  items: string[];
  emptyLabel: string;
};

export function QueuePanel({ title, items, emptyLabel }: QueuePanelProps) {
  return (
    <Card className="min-h-[132px]">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-3">
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <motion.div
              key={`${item}-${index}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="rounded-md border border-teal-900/10 bg-white px-3 py-2 text-sm font-medium shadow-sm"
            >
              {item}
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 ? <p className="text-sm text-muted-foreground">{emptyLabel}</p> : null}
      </CardContent>
    </Card>
  );
}
