// Shared types for The Rivalry UI.
// These are the "data in via props, actions out via callbacks" contracts.
// No logic lives here — types only.

export type Team = "A" | "B"

export type EndReason = "clean" | "wrong_pocket" | "early_eight"

export type Step = "continue" | "winner" | "reason" | "balls"
// "decide" removed — no longer needed

export interface OpenMatchSummary {
  leadingTeamName: string
  scoreA: number
  scoreB: number
}

export type MatchFormat = "single" | "best_of_three"

export interface OverviewStats {
  teamAName: string
  teamBName: string
  teamAMatchWins: number
  teamBMatchWins: number
  currentStreak: { team: Team; count: number } | null
  totalMatches: number
  singleGameMatches: number
  bestOfThreeMatches: number
  bestOfThreeWinsA: number
  bestOfThreeWinsB: number
  longestStreakA: number
  longestStreakB: number
  winsByReason: {
    clean: number
    wrong_pocket: number
    early_eight: number
  }
}

export interface GameResult {
  gameNumber: number
  winner: Team
  endReason: EndReason
  ballsLeftA: number
  ballsLeftB: number
}

export interface MatchHistoryItem {
  id: string
  date: string // pre-formatted display string, e.g. "Jul 29, 2026"
  format: MatchFormat
  winningTeam: Team
  games: GameResult[]
}

export interface BallsFieldConfig {
  showA: boolean
  showB: boolean
}

// Human-readable labels for end reasons, shared across screens.
export const END_REASON_LABEL: Record<EndReason, string> = {
  clean: "Clean win",
  wrong_pocket: "Wrong pocket foul",
  early_eight: "Early 8-ball foul",
}
