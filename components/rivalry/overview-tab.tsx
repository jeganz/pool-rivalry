"use client"

import { Flame, Sparkles, Target, TriangleAlert } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { OverviewStats } from "@/lib/rivalry-types"

export interface OverviewTabProps {
  stats: OverviewStats
  loading?: boolean
}

export function OverviewTab({ stats, loading }: OverviewTabProps) {
  if (loading) {
    return <OverviewSkeleton />
  }

  const {
    teamAName,
    teamBName,
    teamAMatchWins,
    teamBMatchWins,
    currentStreak,
  } = stats

  const leader =
    teamAMatchWins === teamBMatchWins
      ? null
      : teamAMatchWins > teamBMatchWins
        ? "A"
        : "B"

  const statItems: { label: string; value: number }[] = [
    { label: "Total matches", value: stats.totalMatches },
    { label: "Single-game", value: stats.singleGameMatches },
    { label: "Best-of-three", value: stats.bestOfThreeMatches },
    {
      label: "Win rate · " + (teamAMatchWins > teamBMatchWins ? teamAName : teamBName),
      value: percent(Math.max(teamAMatchWins, teamBMatchWins), teamAMatchWins + teamBMatchWins),
    },
    { label: `Best-of-3 wins · ${teamAName}`, value: stats.bestOfThreeWinsA },
    { label: `Best-of-3 wins · ${teamBName}`, value: stats.bestOfThreeWinsB },
    { label: "Longest streak · " + teamAName, value: stats.longestStreakA },
    { label: "Longest streak · " + teamBName, value: stats.longestStreakB },
    
  ]

  const reasonItems: {
    label: string
    value: number
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { label: "Clean finish", value: stats.winsByReason.clean, icon: Sparkles },
    {
      label: "Wrong pocket foul",
      value: stats.winsByReason.wrong_pocket,
      icon: Target,
    },
    {
      label: "Early 8-ball foul",
      value: stats.winsByReason.early_eight,
      icon: TriangleAlert,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Scoreboard */}
      <Card>
        <CardContent className="flex flex-col gap-5 py-1">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <ScoreSide
              name={teamAName}
              wins={teamAMatchWins}
              leading={leader === "A"}
              align="start"
            />
            <span className="text-sm font-medium text-muted-foreground">
              vs
            </span>
            <ScoreSide
              name={teamBName}
              wins={teamBMatchWins}
              leading={leader === "B"}
              align="end"
            />
          </div>

          <div className="flex items-center justify-center gap-2 border-t pt-4">
            {currentStreak ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand">
                <Flame className="size-3.5" aria-hidden="true" />
                {(currentStreak.team === "A" ? teamAName : teamBName) +
                  " · " +
                  currentStreak.count +
                  " in a row"}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                No active streak
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statItems.map((item) => (
          <Card key={item.label} size="sm">
            <CardContent className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tabular-nums tracking-tight">
                {item.value}
                {item.label.startsWith("Win rate") ? "%" : ""}
              </span>
              <span className="text-xs leading-snug text-muted-foreground text-pretty">
                {item.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wins by end reason */}
      <Card>
        <CardContent className="flex flex-col gap-3 py-1">
          <h3 className="text-sm font-medium">Wins by end reason</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {reasonItems.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-foreground/10">
                  <Icon className="size-4" />
                </span>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold tabular-nums leading-none">
                    {value}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ScoreSide({
  name,
  wins,
  leading,
  align,
}: {
  name: string
  wins: number
  leading: boolean
  align: "start" | "end"
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        align === "start" ? "items-start text-left" : "items-end text-right",
      )}
    >
      <span className="max-w-full truncate text-xs font-medium text-muted-foreground">
        {name}
      </span>
      <span
        className={cn(
          "text-5xl font-semibold tabular-nums tracking-tight",
          leading ? "text-brand" : "text-foreground",
        )}
      >
        {wins}
      </span>
    </div>
  )
}

function percent(part: number, total: number) {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-5 py-1">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex flex-col items-start gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-12 w-14" />
            </div>
            <Skeleton className="h-4 w-6" />
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-12 w-14" />
            </div>
          </div>
          <div className="flex justify-center border-t pt-4">
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} size="sm">
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3 py-1">
          <Skeleton className="h-4 w-36" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
