// hooks/useMatchHistory.ts
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { MatchHistoryItem, OpenMatchSummary, Team } from "@/lib/rivalry-types"

interface OpenMatchInternal {
  id: string
  scoreA: number
  scoreB: number
  leadingTeam: Team
}

export function useMatchHistory() {
  const [matches, setMatches] = useState<MatchHistoryItem[]>([])
  const [openMatch, setOpenMatch] = useState<OpenMatchInternal | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchHistory() {
    setLoading(true)
    try {
      const { data: matchRows, error: matchErr } = await supabase
        .from("pool_matches")
        .select("*")
        .order("created_at", { ascending: false })
      if (matchErr) throw matchErr

      const { data: gameRows, error: gamesErr } = await supabase
        .from("pool_games")
        .select("*")
        .order("game_number", { ascending: true })
      if (gamesErr) throw gamesErr

      const shaped: MatchHistoryItem[] = matchRows.map((m) => ({
        id: m.id,
        date: new Date(m.created_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        format: m.format,
        winningTeam: m.winning_team,
        games: (gameRows || [])
          .filter((g) => g.match_id === m.id)
          .map((g) => ({
            gameNumber: g.game_number,
            winner: g.winner,
            endReason: g.end_reason,
            ballsLeftA: g.balls_left_a,
            ballsLeftB: g.balls_left_b,
          })),
      }))
      setMatches(shaped)

      // Detect an open (incomplete) match — always the most recent one, if any
      const mostRecent = matchRows[0]
      if (mostRecent && mostRecent.is_complete === false) {
        const games = (gameRows || []).filter((g) => g.match_id === mostRecent.id)
        const scoreA = games.filter((g) => g.winner === "A").length
        const scoreB = games.filter((g) => g.winner === "B").length
        setOpenMatch({
          id: mostRecent.id,
          scoreA,
          scoreB,
          leadingTeam: mostRecent.winning_team,
        })
      } else {
        setOpenMatch(null)
      }
    } catch (err) {
      console.error("Failed to fetch match history:", err)
    } finally {
      setLoading(false)
    }
  }

  async function deleteMatch(matchId: string) {
    try {
      const { error } = await supabase.from("pool_matches").delete().eq("id", matchId)
      if (error) throw error
      setMatches((prev) => prev.filter((m) => m.id !== matchId))
      if (openMatch?.id === matchId) setOpenMatch(null)
    } catch (err) {
      console.error("Failed to delete match:", err)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  return { matches, openMatch, loading, deleteMatch, refetch: fetchHistory }
}