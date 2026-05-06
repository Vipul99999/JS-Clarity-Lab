"use client";

import { QueuePanel } from "./QueuePanel";

export function CallStack({ items }: { items: string[] }) {
  return <QueuePanel title="Call Stack" items={items} emptyLabel="Stack is clear" />;
}
