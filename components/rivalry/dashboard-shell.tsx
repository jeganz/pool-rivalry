"use client"

import * as React from "react"
import { Plus, Swords } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface DashboardShellProps {
  activeTab: "overview" | "history"
  onTabChange: (tab: "overview" | "history") => void
  onLogMatchClick: () => void
  children: React.ReactNode
}

export function DashboardShell({
  activeTab,
  onTabChange,
  onLogMatchClick,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 supports-backdrop-filter:backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
              <Swords className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              The Rivalry
            </span>
          </div>
          <Button size="sm" onClick={onLogMatchClick}>
            <Plus aria-hidden="true" />
            Log a match
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-5">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            onTabChange(value as "overview" | "history")
          }
        >
          <TabsList className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-5">{children}</div>
      </main>
    </div>
  )
}
