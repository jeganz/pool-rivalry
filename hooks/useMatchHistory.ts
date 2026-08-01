// hooks/useMatchHistory.ts
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { MatchHistoryItem } from "@/lib/rivalry-types"

export function useMatchHistory() {
  const [matches, setMatches] = useState<MatchHistoryItem[]>([])
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
    } catch (err) {
      console.error("Failed to delete match:", err)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  return { matches, loading, deleteMatch, refetch: fetchHistory }
}