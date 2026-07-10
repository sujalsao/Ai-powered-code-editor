"use client";

import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";

export function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

export function ResizablePanel(props: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel {...props} />;
}

export function ResizableHandle({
  className,
  withHandle,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      className={cn(
        "relative flex w-px items-center justify-center bg-border",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="h-6 w-1 rounded-full bg-border" />
      )}
    </ResizablePrimitive.Separator>
  );
}