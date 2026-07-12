import * as React from "react"

export function ResizablePanelGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function ResizablePanel({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function ResizableHandle() {
  return <hr />
}
