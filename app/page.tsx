"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Copy, ExternalLink, Plus, Square, Rocket, RotateCcw, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { createLab } from "@/lib/api";
import { useRouter } from "next/navigation";

type LabType = "python-lab" | "linux-networking-lab" | "python-cli-lab" | "sql-lab" | null
type AppState = "selection" | "launching" | "active" | "expired"

interface ActiveLab {
  id: string
  type: LabType
  url: string
  ttl: number
  remainingTime: number
}

const LAB_OPTIONS = [
  {
    id: "python-lab" as const,
    title: "Python Lab 🐍",
    description: "Write Python code in browser-based VS Code",
  },
  {
    id: "linux-networking-lab" as const,
    title: "Linux + Networking Lab 🐧🌐",
    description: "Run Linux tools, networking utilities, and terminal commands in-browser.",
  },
  {
    id: "python-cli-lab" as const,
    title: "Python CLI Lab 🐍💻",
    description: "Minimal Python REPLs in browser terminal",
  },
  {
    id: "sql-lab" as const,
    title: "SQL Lab 🧮",
    description: "Use the SQLite CLI in your browser to write and query SQL",
  },
]

const TTL_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "60 minutes" },
  { value: 90, label: "90 minutes" },
  { value: 120, label: "120 minutes" },
]

export default function LabStack() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>("selection")
  const [selectedLab, setSelectedLab] = useState<LabType>(null)
  const [selectedTTL, setSelectedTTL] = useState<number>(30)
  const [activeLab, setActiveLab] = useState<ActiveLab | null>(null)
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)

  // Countdown timer effect
  useEffect(() => {
    if (appState === "active" && activeLab) {
      const interval = setInterval(() => {
        setActiveLab((prev) => {
          if (!prev) return null

          const newRemainingTime = prev.remainingTime - 1

          if (newRemainingTime <= 0) {
            setAppState("expired")
            return null
          }

          return { ...prev, remainingTime: newRemainingTime }
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [appState, activeLab])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleLaunchLab = async () => {
    if (!selectedLab) return;
    setAppState("launching");
    setIsLaunching(true);
    try {
      const labId = await createLab(selectedLab, selectedTTL);
      router.push(`/lab/${labId}?ttl=${selectedTTL}`);
    } catch (err) {
      alert("Failed to launch lab");
      setAppState("selection");
    } finally {
      setIsLaunching(false);
    }
  }

  const handleExtendTTL = async () => {
    if (!activeLab) return

    setActiveLab((prev) =>
      prev
        ? {
            ...prev,
            remainingTime: prev.remainingTime + 30 * 60,
          }
        : null,
    )
  }

  const handleTerminate = async () => {
    if (!activeLab) return
    setShowTerminateDialog(false)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      await fetch(`${baseUrl}/labs/${activeLab.id}/terminate`, {
        method: "POST",
      })
    } catch (err) {
      // Optionally show error toast
    }
    setActiveLab(null)
    setAppState("expired")
  }

  const handleCopyUrl = async () => {
    if (activeLab?.url) {
      await navigator.clipboard.writeText(activeLab.url)
    }
  }

  const handleLaunch = async (labType: string) => {
    const labId = await createLab(labType);
    router.push(`/lab/${labId}`);
  };

  const resetToSelection = () => {
    setAppState("selection")
    setSelectedLab(null)
    setActiveLab(null)
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e5e5e5]">
      {/* Header */}
      <header className="border-b border-[#2d333b] px-6 py-4">
        <h1 className="text-2xl font-bold">LabStack</h1>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl px-6 py-12">
        {appState === "selection" && (
          <div className="space-y-8">
            {/* Lab Selector */}
            <section>
              <h2 className="text-xl font-semibold mb-6">Choose Your Lab</h2>
              <div className="grid gap-4">
                {LAB_OPTIONS.map((lab) => (
                  <Card
                    key={lab.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                      "bg-[#161b22] border-[#2d333b] hover:border-[#6366f1]",
                      selectedLab === lab.id && "border-[#6366f1] ring-2 ring-[#6366f1]/20",
                    )}
                    onClick={() => setSelectedLab(lab.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium mb-2">{lab.title}</h3>
                          <p className="text-[#8b949e]">{lab.description}</p>
                        </div>
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2 transition-colors",
                            selectedLab === lab.id ? "border-[#6366f1] bg-[#6366f1]" : "border-[#2d333b]",
                          )}
                        >
                          {selectedLab === lab.id && <div className="w-full h-full rounded-full bg-white scale-50" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* TTL Picker */}
            <section>
              <label className="block text-lg font-medium mb-4">Set Time to Live</label>
              <Select value={selectedTTL.toString()} onValueChange={(value) => setSelectedTTL(Number(value))}>
                <SelectTrigger className="bg-[#161b22] border-[#2d333b] text-[#e5e5e5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#2d333b]">
                  {TTL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>

            {/* Launch CTA */}
            <Button
              onClick={handleLaunchLab}
              disabled={!selectedLab || isLaunching}
              className="w-full h-14 text-lg bg-[#6366f1] hover:bg-[#5855eb] disabled:opacity-50"
            >
              {isLaunching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Launching Lab...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Launch Lab
                </>
              )}
            </Button>
          </div>
        )}

        {appState === "launching" && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6366f1] mb-8" />
            <h2 className="text-2xl font-semibold mb-2">Launching your lab...</h2>
            <p className="text-[#8b949e]">Please wait while we provision your environment.</p>
          </div>
        )}

        {appState === "active" && activeLab && (
          <div className="space-y-8">
            {/* Active Lab Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-[#10b981] mr-3" />
                <h2 className="text-2xl font-bold">
                  Your {LAB_OPTIONS.find((lab) => lab.id === activeLab.type)?.title.split(" ")[0]} Lab is Running
                </h2>
              </div>
              <p className="text-[#8b949e]">Auto-deletes after TTL</p>
            </div>

            {/* TTL Countdown */}
            <Card className="bg-[#161b22] border-[#2d333b]">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-mono font-bold text-[#6366f1] mb-2">
                  {formatTime(activeLab.remainingTime)}
                </div>
                <p className="text-[#8b949e]">Time remaining</p>
              </CardContent>
            </Card>

            {/* Access Lab */}
            <section>
              <h3 className="text-lg font-medium mb-4">Access your lab</h3>
              <Card className="bg-[#161b22] border-[#2d333b]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-[#10b981] bg-[#0d1117] px-3 py-2 rounded flex-1 mr-3">
                      {activeLab.url}
                    </code>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyUrl}
                        className="border-[#2d333b] hover:bg-[#2d333b] bg-transparent"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => window.open(activeLab.url, "_blank")}
                        className="bg-[#10b981] hover:bg-[#059669]"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Lab
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleExtendTTL}
                variant="outline"
                className="flex-1 border-[#2d333b] hover:bg-[#2d333b] bg-transparent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Extend TTL (+30m)
              </Button>
              <Button
                onClick={() => setShowTerminateDialog(true)}
                variant="outline"
                className="flex-1 border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white"
              >
                <Square className="mr-2 h-4 w-4" />
                Terminate Now
              </Button>
            </div>
          </div>
        )}

        {appState === "expired" && (
          <div className="text-center space-y-6">
            <div>
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-2xl font-bold mb-2">Your lab has expired</h2>
              <p className="text-[#8b949e]">It was deleted after its TTL.</p>
            </div>

            <Button onClick={resetToSelection} className="bg-[#6366f1] hover:bg-[#5855eb]">
              <RotateCcw className="mr-2 h-4 w-4" />
              Launch New Lab
            </Button>
          </div>
        )}
      </main>

      {/* Terminate Confirmation Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent className="bg-[#161b22] border-[#2d333b]">
          <DialogHeader>
            <DialogTitle>Terminate Lab</DialogTitle>
            <DialogDescription className="text-[#8b949e]">
              Are you sure you want to terminate your lab? This action cannot be undone and all data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTerminateDialog(false)}
              className="border-[#2d333b] hover:bg-[#2d333b]"
            >
              Cancel
            </Button>
            <Button onClick={handleTerminate} className="bg-[#ef4444] hover:bg-[#dc2626]">
              Terminate Lab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
