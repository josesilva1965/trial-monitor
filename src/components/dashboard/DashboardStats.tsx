import { Trial } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { DollarSign, Activity, Timer } from "lucide-react"
import { differenceInCalendarDays, parseISO } from "date-fns"

interface DashboardStatsProps {
    trials: Trial[]
}

export function DashboardStats({ trials }: DashboardStatsProps) {
    const activeTrials = trials.filter(t => t.isActive).length

    const expiringSoon = trials.filter(t => {
        if (!t.isActive) return false
        const daysLeft = differenceInCalendarDays(parseISO(t.endDate), new Date())
        return daysLeft <= 3 && daysLeft >= 0
    }).length

    const totalsByCurrency: Record<string, number> = trials.reduce((acc, trial) => {
        if (!trial.isActive || !trial.price) return acc
        const currency = trial.currency || 'USD'
        acc[currency] = (acc[currency] || 0) + trial.price
        return acc
    }, {} as Record<string, number>)

    const hasTotals = Object.keys(totalsByCurrency).length > 0

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Active Cost</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {!hasTotals && "$0.00"}
                        {Object.entries(totalsByCurrency).map(([curr, total]) => (
                            <div key={curr} className="flex items-center gap-2">
                                <span className="text-xs font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">{curr}</span>
                                <span>{total.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        estimated monthly subscriptions
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeTrials}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        currently being tracked
                    </p>
                </CardContent>
            </Card>

            <Card className={`border shadow-sm transition-colors ${expiringSoon > 0 ? "bg-yellow-500/10 border-yellow-500/50" : "bg-card/50 backdrop-blur-sm"}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                    <Timer className={`h-4 w-4 ${expiringSoon > 0 ? "text-yellow-500" : "text-muted-foreground"}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${expiringSoon > 0 ? "text-yellow-600 dark:text-yellow-500" : ""}`}>{expiringSoon}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        within the next 3 days
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
