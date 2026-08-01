"use client"

import * as React from "react"
import { KeyRound, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface PINGateProps {
  onSubmit: (pin: string) => void
  error?: string
  loading?: boolean
}

export function PINGate({ onSubmit, error, loading }: PINGateProps) {
  const [pin, setPin] = React.useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading || pin.length === 0) return
    onSubmit(pin)
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm" size="default">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full bg-brand-muted text-brand">
            <KeyRound className="size-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-lg">The Rivalry</CardTitle>
          <CardDescription>Enter your PIN to keep score.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pin" className="sr-only">
                PIN
              </Label>
              <Input
                id="pin"
                inputMode="numeric"
                autoComplete="off"
                pattern="[0-9]*"
                placeholder="••••"
                value={pin}
                autoFocus
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "pin-error" : undefined}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                className={cn(
                  "h-12 text-center text-2xl tracking-[0.5em] font-medium",
                )}
              />
              {error ? (
                <p
                  id="pin-error"
                  role="alert"
                  className="text-center text-sm text-destructive"
                >
                  {error}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || pin.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Checking…
                </>
              ) : (
                "Unlock"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
