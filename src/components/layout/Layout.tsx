import { ThemeToggle } from "@/components/ThemeToggle"
import { LayoutDashboard, Sparkles, Settings, LogOut } from "lucide-react"
import { useState } from "react"
import { SettingsModal } from "@/components/settings/SettingsModal"
import { Button } from "@/components/ui/Button"

export function Layout({ children }: { children: React.ReactNode }) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-subtle text-foreground flex">
            <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

            {/* Sidebar */}
            <aside className="w-64 glass border-r-0 p-6 hidden md:flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-xl bg-gradient-primary animate-pulse-subtle">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                        TrialMonitor
                    </h1>
                </div>
                <nav className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-primary/10 text-primary rounded-lg font-medium cursor-pointer transition-all hover:bg-primary/15 hover:scale-[1.02]">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </div>
                    <div
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:text-foreground rounded-lg font-medium cursor-pointer transition-all hover:bg-muted/50 hover:scale-[1.02]"
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </div>
                </nav>
                <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">Theme</span>
                        <ThemeToggle />
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.close()}
                        className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="h-4 w-4" />
                        Exit App
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    )
}
