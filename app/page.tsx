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
import type { BallsFieldConfig, EndReason, OverviewStats, Step, Team } from "@/lib/rivalry-types"

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
  const {
    matches,
    openMatch,
    loading: historyLoading,
    deleteMatch,
    refetch: refetchHistory,
  } = useMatchHistory()

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [step, setStep] = React.useState<Step>("winner")
  const [scoreA, setScoreA] = React.useState(0)
  const [scoreB, setScoreB] = React.useState(0)
  const [winner, setWinner] = React.useState<Team>("A")
  const [reason, setReason] = React.useState<EndReason>("clean")
  const [saving, setSaving] = React.useState(false)

  // Tracks which existing match row we're adding a game to (null = new match)
  const activeMatchIdRef = React.useRef<string | null>(null)
  const existingGameCountRef = React.useRef(0)

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
    if (openMatch) {
      setStep("continue")
    } else {
      startFreshGame()
    }
    setDialogOpen(true)
  }

  function startFreshGame() {
    activeMatchIdRef.current = null
    existingGameCountRef.current = 0
    setScoreA(0)
    setScoreB(0)
    setStep("winner")
  }

  async function handleStartNewMatch() {
    if (openMatch) {
      try {
        await supabase
          .from("pool_matches")
          .update({ is_complete: true })
          .eq("id", openMatch.id)
        await refetchHistory()
        console.log("Closed previous match:", openMatch.id)
      } catch (err) {
        console.error("Failed to close previous match:", err)
      }
    }
    startFreshGame()
  }

  function continueOpenMatch() {
    if (!openMatch) return
    activeMatchIdRef.current = openMatch.id
    existingGameCountRef.current = openMatch.scoreA + openMatch.scoreB
    setScoreA(openMatch.scoreA)
    setScoreB(openMatch.scoreB)
    setStep("winner")
  }

  async function saveGame(ballsA: number, ballsB: number) {
    setSaving(true)
    try {
      const nextA = winner === "A" ? scoreA + 1 : scoreA
      const nextB = winner === "B" ? scoreB + 1 : scoreB
      const totalGames = nextA + nextB
      const format = totalGames > 1 ? "best_of_three" : "single"
      const leadingTeam: Team = nextA > nextB ? "A" : "B"
      const isComplete = nextA === 2 || nextB === 2

      let matchId = activeMatchIdRef.current

      if (matchId) {
        // Continuing an existing (previously open) match
        const { error: updateErr } = await supabase
          .from("pool_matches")
          .update({ format, winning_team: leadingTeam, is_complete: isComplete })
          .eq("id", matchId)
        if (updateErr) throw updateErr
      } else {
        // Brand new match
        const { data: match, error: matchErr } = await supabase
          .from("pool_matches")
          .insert({ format, winning_team: leadingTeam, is_complete: isComplete })
          .select()
          .single()
        if (matchErr) throw matchErr
        matchId = match.id
        activeMatchIdRef.current = matchId
      }

      const gameNumber = existingGameCountRef.current + 1
      const { error: gameErr } = await supabase.from("pool_games").insert({
        match_id: matchId,
        game_number: gameNumber,
        winner,
        end_reason: reason,
        balls_left_a: ballsA,
        balls_left_b: ballsB,
      })
      if (gameErr) throw gameErr

      await Promise.all([refetchStats(), refetchHistory()])
      setDialogOpen(false)
    } catch (err) {
      console.error("Failed to save game:", err)
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
        openMatch={
          openMatch
            ? {
                leadingTeamName:
                  openMatch.leadingTeam === "A"
                    ? stats?.teamAName ?? "Team A"
                    : stats?.teamBName ?? "Team B",
                scoreA: openMatch.scoreA,
                scoreB: openMatch.scoreB,
              }
            : null
        }
        onContinueMatch={continueOpenMatch}
        onStartNewMatch={handleStartNewMatch}
        onPickWinner={(w) => {
          setWinner(w)
          setStep("reason")
        }}
        onPickReason={(r) => {
          setReason(r)
          setStep("balls")
        }}
        onSubmitBalls={(ballsA, ballsB) => {
          saveGame(ballsA, ballsB)
        }}
      />
    </>
  )
}