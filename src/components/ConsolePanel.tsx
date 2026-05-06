"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ConsolePanel({ output }: { output: string[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Terminal className="h-4 w-4 text-lime-600" />
          Console Output
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[96px] p-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence initial={false}>
            {output.map((item, index) => (
              <motion.div
                key={`${item}-${index}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-md bg-[#071211] px-3 py-2 font-mono text-sm text-lime-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                {item}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {output.length === 0 ? <p className="text-sm text-muted-foreground">No logs yet</p> : null}
      </CardContent>
    </Card>
  );
}
