"use client"

import * as React from "react"

import { DashboardShell } from "@/components/rivalry/dashboard-shell"
import { HistoryTab } from "@/components/rivalry/history-tab"
import { LogMatchDialog } from "@/components/rivalry/log-match-dialog"
import { OverviewTab } from "@/components/rivalry/overview-tab"
import { PINGate } from "@/components/rivalry/pin-gate"
import { supabase } from "@/lib/supabase"
import { useOverviewStats } from "@/hooks/useOverviewStats"
import { useMatchHistory } from "@/hooks/useMatchHistory"
import type { BallsFieldConfig, EndReason, OverviewStats,Step, Team } from "@/lib/rivalry-types"

const APP_PIN = process.env.NEXT_PUBLIC_APP_PIN || "1220"

const EMPTY_STATS: OverviewStats = {
  teamAName: "Team A",
  teamBName: "Team B",
  teamAMatchWins: 0,
  teamBMatchWins: 0,
  currentStreak: null,
  totalMatches: 0,
  singleGameMatches: 0,
  bestOfThreeMatches: 0,
  bestOfThreeWinsA: 0,
  bestOfThreeWinsB: 0,
  longestStreakA: 0,
  longestStreakB: 0,
  winsByReason: { clean: 0, wrong_pocket: 0, early_eight: 0 },
}

interface PendingGame {
  gameNumber: number
  winner: Team
  endReason: EndReason
  ballsLeftA: number
  ballsLeftB: number
}

function ballsConfigForResult(winner: Team, reason: EndReason): BallsFieldConfig {
  const winnerIsA = winner === "A"
  switch (reason) {
    case "clean":
      return { showA: !winnerIsA, showB: winnerIsA }
    case "wrong_pocket":
      return { showA: winnerIsA, showB: !winnerIsA }
    case "early_eight":
      return { showA: true, showB: true }
  }
}

export default function Page() {
  const [unlocked, setUnlocked] = React.useState(false)
  const [pinError, setPinError] = React.useState<string>()
  const [pinLoading, setPinLoading] = React.useState(false)

  const [tab, setTab] = React.useState<"overview" | "history">("overview")

  const { stats, loading: statsLoading, refetch: refetchStats } = useOverviewStats()
  const { matches, loading: historyLoading, deleteMatch, refetch: refetchHistory } =
    useMatchHistory()

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [step, setStep] = React.useState<Step>("winner")
  const [scoreA, setScoreA] = React.useState(0)
  const [scoreB, setScoreB] = React.useState(0)
  const [winner, setWinner] = React.useState<Team>("A")
  const [reason, setReason] = React.useState<EndReason>("clean")
  const [pendingGames, setPendingGames] = React.useState<PendingGame[]>([])
  const [saving, setSaving] = React.useState(false)

  function handlePinSubmit(pin: string) {
    setPinLoading(true)
    setPinError(undefined)
    window.setTimeout(() => {
      setPinLoading(false)
      if (pin === APP_PIN) {
        setUnlocked(true)
      } else {
        setPinError("That PIN doesn't match. Try again.")
      }
    }, 300)
  }

  function openDialog() {
    setStep("winner")
    setScoreA(0)
    setScoreB(0)
    setPendingGames([])
    setDialogOpen(true)
  }

  async function finalizeMatch(
    finalGames: PendingGame[],
    format: "single" | "best_of_three",
    winningTeam: Team,
  ) {
    setSaving(true)
    try {
      const { data: match, error: matchErr } = await supabase
        .from("pool_matches")
        .insert({ format, winning_team: winningTeam })
        .select()
        .single()
      if (matchErr) throw matchErr

      const rows = finalGames.map((g) => ({
        match_id: match.id,
        game_number: g.gameNumber,
        winner: g.winner,
        end_reason: g.endReason,
        balls_left_a: g.ballsLeftA,
        balls_left_b: g.ballsLeftB,
      }))
      const { error: gamesErr } = await supabase.from("pool_games").insert(rows)
      if (gamesErr) throw gamesErr

      await Promise.all([refetchStats(), refetchHistory()])
      setDialogOpen(false)
    } catch (err) {
      console.error("Failed to save match:", err)
    } finally {
      setSaving(false)
    }
  }

  if (!unlocked) {
    return <PINGate onSubmit={handlePinSubmit} error={pinError} loading={pinLoading} />
  }

  return (
    <>
      <DashboardShell activeTab={tab} onTabChange={setTab} onLogMatchClick={openDialog}>
        {tab === "overview" ? (
            stats ? (
              <OverviewTab stats={stats} loading={statsLoading} />
            ) : (
              <OverviewTab stats={EMPTY_STATS} loading={true} />
            )
          ) : (
          <HistoryTab
            matches={matches}
            teamAName={stats?.teamAName ?? "Team A"}
            teamBName={stats?.teamBName ?? "Team B"}
            onDeleteMatch={deleteMatch}
            loading={historyLoading}
          />
        )}
      </DashboardShell>

      <LogMatchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        step={step}
        scoreA={scoreA}
        scoreB={scoreB}
        teamAName={stats?.teamAName ?? "Team A"}
        teamBName={stats?.teamBName ?? "Team B"}
        ballsFieldConfig={ballsConfigForResult(winner, reason)}
        saving={saving}
        onPickWinner={(w) => {
          setWinner(w)
          setStep("reason")
        }}
        onPickReason={(r) => {
          setReason(r)
          setStep("balls")
        }}
        onSubmitBalls={(ballsA, ballsB) => {
          const gameNumber = pendingGames.length + 1
          const newGame: PendingGame = {
            gameNumber,
            winner,
            endReason: reason,
            ballsLeftA: ballsA,
            ballsLeftB: ballsB,
          }
          const updated = [...pendingGames, newGame]
          setPendingGames(updated)

          const nextA = winner === "A" ? scoreA + 1 : scoreA
          const nextB = winner === "B" ? scoreB + 1 : scoreB
          setScoreA(nextA)
          setScoreB(nextB)

          if (nextA === 2 || nextB === 2) {
            finalizeMatch(updated, "best_of_three", nextA === 2 ? "A" : "B")
          } else if (updated.length === 1) {
            setStep("decide")
          } else {
            setStep("winner")
          }
        }}
        onEndAsSingle={() => {
          finalizeMatch(pendingGames, "single", pendingGames[0].winner)
        }}
        onPlayItOut={() => setStep("winner")}
      />
    </>
  )
}