"use client"

import { Inbox, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  END_REASON_LABEL,
  type GameResult,
  type MatchHistoryItem,
  type Team,
} from "@/lib/rivalry-types"

export interface HistoryTabProps {
  matches: MatchHistoryItem[]
  teamAName: string
  teamBName: string
  onDeleteMatch: (matchId: string) => void
  loading?: boolean
}

export function HistoryTab({
  matches,
  teamAName,
  teamBName,
  onDeleteMatch,
  loading,
}: HistoryTabProps) {
  if (loading) {
    return <HistorySkeleton />
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">No matches yet</p>
          <p className="text-sm text-muted-foreground text-pretty">
            Log your first match to start the rivalry.
          </p>
        </div>
      </div>
    )
  }

  const teamName = (t: Team) => (t === "A" ? teamAName : teamBName)

  return (
    <ul className="flex flex-col gap-3">
      {matches.map((match) =>
        match.format === "best_of_three" ? (
          <li key={match.id}>
            <Card className="bg-muted/60">
              <div className="flex items-start justify-between gap-2 px-4">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Best of 3</Badge>
                    <span className="text-sm font-medium">
                      {teamName(match.winningTeam)} won
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {match.date} · {bestOfThreeScore(match)}
                  </span>
                </div>
                <DeleteButton
                  onClick={() => onDeleteMatch(match.id)}
                  label={`Delete match from ${match.date}`}
                />
              </div>
              <div className="mx-4 flex flex-col divide-y rounded-lg bg-background ring-1 ring-foreground/10">
                {match.games.map((game) => (
                  <GameRow
                    key={game.gameNumber}
                    game={game}
                    teamAName={teamAName}
                    teamBName={teamBName}
                    showGameNumber
                  />
                ))}
              </div>
            </Card>
          </li>
        ) : (
          <li key={match.id}>
            <Card className="flex flex-row items-center justify-between gap-2 bg-muted/60 px-4">
              <SingleGameRow
                game={match.games[0]}
                date={match.date}
                teamAName={teamAName}
                teamBName={teamBName}
              />
              <DeleteButton
                onClick={() => onDeleteMatch(match.id)}
                label={`Delete match from ${match.date}`}
              />
            </Card>
          </li>
        ),
      )}
    </ul>
  )
}

function SingleGameRow({
  game,
  date,
  teamAName,
  teamBName,
}: {
  game: GameResult
  date: string
  teamAName: string
  teamBName: string
}) {
  const winnerName = game.winner === "A" ? teamAName : teamBName
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Single</Badge>
        <span className="text-sm font-medium">{winnerName} won</span>
        <ReasonBadge game={game} />
      </div>
      <span className="text-xs text-muted-foreground">
        {date} · balls left {teamAName} {game.ballsLeftA} · {teamBName}{" "}
        {game.ballsLeftB}
      </span>
    </div>
  )
}

function GameRow({
  game,
  teamAName,
  teamBName,
  showGameNumber,
}: {
  game: GameResult
  teamAName: string
  teamBName: string
  showGameNumber?: boolean
}) {
  const winnerName = game.winner === "A" ? teamAName : teamBName
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        {showGameNumber ? (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.7rem] font-medium tabular-nums text-muted-foreground">
            {game.gameNumber}
          </span>
        ) : null}
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">
            {winnerName} won
          </span>
          <span className="text-xs text-muted-foreground">
            {teamAName} {game.ballsLeftA} · {teamBName} {game.ballsLeftB} left
          </span>
        </div>
      </div>
      <ReasonBadge game={game} />
    </div>
  )
}

function ReasonBadge({ game }: { game: GameResult }) {
  const isFoul = game.endReason !== "clean"
  return (
    <Badge
      variant={isFoul ? "outline" : "secondary"}
      className={cn(!isFoul && "bg-brand-muted text-brand")}
    >
      {END_REASON_LABEL[game.endReason]}
    </Badge>
  )
}

function DeleteButton({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label={label}
      className="shrink-0 text-muted-foreground hover:text-destructive"
    >
      <Trash2 />
    </Button>
  )
}

function bestOfThreeScore(match: MatchHistoryItem) {
  const a = match.games.filter((g) => g.winner === "A").length
  const b = match.games.filter((g) => g.winner === "B").length
  return `${a}–${b}`
}

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card
          key={`single-${i}`}
          className="flex flex-row items-center justify-between bg-muted/60 px-4"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="size-7 rounded-md" />
        </Card>
      ))}
      <Card className="bg-muted/60">
        <div className="flex items-start justify-between px-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="size-7 rounded-md" />
        </div>
        <div className="mx-4 flex flex-col gap-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </Card>
    </div>
  )
}
