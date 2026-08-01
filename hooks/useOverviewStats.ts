// hooks/useOverviewStats.ts
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { OverviewStats } from "@/lib/rivalry-types"

export function useOverviewStats() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchStats() {
    setLoading(true)
    try {
      const { data: settings } = await supabase
        .from("pool_settings")
        .select("*")
        .eq("id", 1)
        .single()

      const { data: matches, error: matchErr } = await supabase
        .from("pool_matches")
        .select("*")
        .order("created_at", { ascending: false })
      if (matchErr) throw matchErr

      const { data: games, error: gamesErr } = await supabase
        .from("pool_games")
        .select("*")
      if (gamesErr) throw gamesErr

      const teamAMatchWins = matches.filter((m) => m.winning_team === "A").length
      const teamBMatchWins = matches.filter((m) => m.winning_team === "B").length

      const bestOfThreeWinsA = matches.filter(
        (m) => m.format === "best_of_three" && m.winning_team === "A",
      ).length
      const bestOfThreeWinsB = matches.filter(
        (m) => m.format === "best_of_three" && m.winning_team === "B",
      ).length

      const winsByReason = {
        clean: games?.filter((g) => g.end_reason === "clean").length || 0,
        wrong_pocket: games?.filter((g) => g.end_reason === "wrong_pocket").length || 0,
        early_eight: games?.filter((g) => g.end_reason === "early_eight").length || 0,
      }

      let currentStreak: OverviewStats["currentStreak"] = null
      if (matches.length > 0) {
        const team = matches[0].winning_team as "A" | "B"
        let count = 1
        for (let i = 1; i < matches.length; i++) {
          if (matches[i].winning_team === team) count++
          else break
        }
        currentStreak = { team, count }
      }

      const chron = [...matches].reverse()
      let longestStreakA = 0
      let longestStreakB = 0
      let runA = 0
      let runB = 0
      for (const m of chron) {
        if (m.winning_team === "A") {
          runA++
          runB = 0
          longestStreakA = Math.max(longestStreakA, runA)
        } else {
          runB++
          runA = 0
          longestStreakB = Math.max(longestStreakB, runB)
        }
      }

      setStats({
        teamAName: settings?.team_a_name ?? "Team A",
        teamBName: settings?.team_b_name ?? "Team B",
        teamAMatchWins,
        teamBMatchWins,
        currentStreak,
        totalMatches: matches.length,
        singleGameMatches: matches.filter((m) => m.format === "single").length,
        bestOfThreeMatches: matches.filter((m) => m.format === "best_of_three").length,
        bestOfThreeWinsA,
        bestOfThreeWinsB,
        longestStreakA,
        longestStreakB,
        winsByReason,
      })
    } catch (err) {
      console.error("Failed to fetch overview stats:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, refetch: fetchStats }
}