"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { BallsFieldConfig, EndReason, Step } from "@/lib/rivalry-types"

export interface LogMatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  step: Step
  scoreA: number
  scoreB: number
  teamAName: string
  teamBName: string
  ballsFieldConfig?: BallsFieldConfig
  saving?: boolean
  onPickWinner: (winner: "A" | "B") => void
  onPickReason: (reason: EndReason) => void
  onSubmitBalls: (ballsA: number, ballsB: number) => void
  onEndAsSingle: () => void
  onPlayItOut: () => void
}

const STEP_META: Record<Step, { title: string; description: string }> = {
  winner: { title: "Who won this game?", description: "Tap the winning team." },
  reason: {
    title: "How did it end?",
    description: "Pick the way the game finished.",
  },
  balls: {
    title: "Balls remaining",
    description: "How many object balls were still on the table.",
  },
  decide: {
    title: "Keep playing?",
    description: "End the match now or play the best of three.",
  },
}

export function LogMatchDialog(props: LogMatchDialogProps) {
  const {
    open,
    onOpenChange,
    step,
    scoreA,
    scoreB,
    teamAName,
    teamBName,
    saving,
  } = props

  const midMatch = scoreA + scoreB > 0
  const meta = STEP_META[step]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle>{meta.title}</DialogTitle>
            {midMatch ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums">
                <span className="text-muted-foreground">Match</span>
                <span>
                  {scoreA}–{scoreB}
                </span>
              </span>
            ) : null}
          </div>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>

        <StepBody {...props} />
      </DialogContent>
    </Dialog>
  )

  function StepBody(p: LogMatchDialogProps) {
    switch (p.step) {
      case "winner":
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ChoiceButton
              label={`${teamAName} won`}
              onClick={() => p.onPickWinner("A")}
              disabled={saving}
            />
            <ChoiceButton
              label={`${teamBName} won`}
              onClick={() => p.onPickWinner("B")}
              disabled={saving}
            />
          </div>
        )
      case "reason":
        return (
          <div className="flex flex-col gap-2.5">
            <ChoiceButton
              label="Clean win"
              hint="Sank the 8-ball legally"
              onClick={() => p.onPickReason("clean")}
              disabled={saving}
            />
            <ChoiceButton
              label="Wrong pocket foul"
              hint="8-ball in the wrong pocket"
              onClick={() => p.onPickReason("wrong_pocket")}
              disabled={saving}
            />
            <ChoiceButton
              label="Early 8-ball foul"
              hint="8-ball sank too early"
              onClick={() => p.onPickReason("early_eight")}
              disabled={saving}
            />
          </div>
        )
      case "balls":
        return (
          <BallsStep
            config={p.ballsFieldConfig ?? { showA: true, showB: true }}
            teamAName={teamAName}
            teamBName={teamBName}
            saving={saving}
            onSubmit={p.onSubmitBalls}
          />
        )
      case "decide":
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ChoiceButton
              label="End match here"
              hint="Save as a single game"
              onClick={p.onEndAsSingle}
              disabled={saving}
            />
            <ChoiceButton
              label="Play it out"
              hint="Continue best of three"
              onClick={p.onPlayItOut}
              disabled={saving}
            />
          </div>
        )
      default:
        return null
    }
  }
}

function ChoiceButton({
  label,
  hint,
  onClick,
  disabled,
}: {
  label: string
  hint?: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-auto flex-col items-start gap-0.5 whitespace-normal px-4 py-3 text-left",
        "hover:border-brand/40 hover:bg-brand-muted",
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      {hint ? (
        <span className="text-xs font-normal text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </Button>
  )
}

function BallsStep({
  config,
  teamAName,
  teamBName,
  saving,
  onSubmit,
}: {
  config: BallsFieldConfig
  teamAName: string
  teamBName: string
  saving?: boolean
  onSubmit: (ballsA: number, ballsB: number) => void
}) {
  const [ballsA, setBallsA] = React.useState("")
  const [ballsB, setBallsB] = React.useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    const a = config.showA ? clampBalls(ballsA) : 0
    const b = config.showB ? clampBalls(ballsB) : 0
    onSubmit(a, b)
  }

  const noFields = !config.showA && !config.showB

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {noFields ? (
        <p className="rounded-lg bg-muted/60 px-3 py-3 text-sm text-muted-foreground">
          No balls remaining to record for this result.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {config.showA ? (
            <BallsField
              id="balls-a"
              label={teamAName}
              value={ballsA}
              onChange={setBallsA}
            />
          ) : null}
          {config.showB ? (
            <BallsField
              id="balls-b"
              label={teamBName}
              value={ballsB}
              onChange={setBallsB}
            />
          ) : null}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Saving…
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  )
}

function BallsField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={7}
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 text-center text-lg font-medium tabular-nums"
      />
    </div>
  )
}

function clampBalls(raw: string) {
  const n = Number.parseInt(raw, 10)
  if (Number.isNaN(n) || n < 0) return 0
  if (n > 7) return 7
  return n
}
