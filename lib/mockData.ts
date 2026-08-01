// Sample data used ONLY for previewing components in isolation.
// Never fetched — defined statically outside any component.

import type { MatchHistoryItem, OverviewStats } from "./rivalry-types"

export const TEAM_A_NAME = "Team S&M"
export const TEAM_B_NAME = "Team J&C"

export const mockOverviewStats: OverviewStats = {
  teamAName: TEAM_A_NAME,
  teamBName: TEAM_B_NAME,
  teamAMatchWins: 18,
  teamBMatchWins: 14,
  currentStreak: { team: "A", count: 3 },
  totalMatches: 32,
  singleGameMatches: 21,
  bestOfThreeMatches: 11,
  bestOfThreeWinsA: 6,
  bestOfThreeWinsB: 5,
  longestStreakA: 5,
  longestStreakB: 4,
  winsByReason: {
    clean: 24,
    wrong_pocket: 5,
    early_eight: 3,
  },
}

export const mockMatches: MatchHistoryItem[] = [
  {
    id: "m-1",
    date: "Jul 29, 2026",
    format: "single",
    winningTeam: "A",
    games: [
      {
        gameNumber: 1,
        winner: "A",
        endReason: "clean",
        ballsLeftA: 0,
        ballsLeftB: 4,
      },
    ],
  },
  {
    id: "m-2",
    date: "Jul 27, 2026",
    format: "best_of_three",
    winningTeam: "B",
    games: [
      {
        gameNumber: 1,
        winner: "A",
        endReason: "clean",
        ballsLeftA: 0,
        ballsLeftB: 2,
      },
      {
        gameNumber: 2,
        winner: "B",
        endReason: "wrong_pocket",
        ballsLeftA: 3,
        ballsLeftB: 0,
      },
      {
        gameNumber: 3,
        winner: "B",
        endReason: "clean",
        ballsLeftA: 5,
        ballsLeftB: 0,
      },
    ],
  },
  {
    id: "m-3",
    date: "Jul 25, 2026",
    format: "single",
    winningTeam: "B",
    games: [
      {
        gameNumber: 1,
        winner: "B",
        endReason: "early_eight",
        ballsLeftA: 0,
        ballsLeftB: 6,
      },
    ],
  },
  {
    id: "m-4",
    date: "Jul 22, 2026",
    format: "best_of_three",
    winningTeam: "A",
    games: [
      {
        gameNumber: 1,
        winner: "A",
        endReason: "clean",
        ballsLeftA: 0,
        ballsLeftB: 1,
      },
      {
        gameNumber: 2,
        winner: "A",
        endReason: "clean",
        ballsLeftA: 0,
        ballsLeftB: 3,
      },
    ],
  },
]
