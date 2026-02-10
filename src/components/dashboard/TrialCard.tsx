import { differenceInCalendarDays, parseISO, format } from "date-fns"
import { Copy, Trash2, Calendar, Clock, Edit, CreditCard } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Trial } from "@/types"
import { cn } from "@/lib/utils"

interface TrialCardProps {
    trial: Trial
    onDelete: (id: string) => void
    onEdit: (trial: Trial) => void
}

export function TrialCard({ trial, onDelete, onEdit }: TrialCardProps) {
    const endDate = parseISO(trial.endDate)
    const startDate = parseISO(trial.startDate)
    const daysLeft = differenceInCalendarDays(endDate, new Date())
    const totalDays = differenceInCalendarDays(endDate, startDate)
    const progressPercent = totalDays > 0 ? Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100)) : 100

    let status: 'default' | 'success' | 'warning' | 'destructive' = 'success'
    let statusText = 'Active'
    let glowClass = 'hover:glow-success'

    if (daysLeft <= 0) {
        status = 'destructive'
        statusText = 'Expired'
        glowClass = 'glow-destructive'
    } else if (daysLeft <= 3) {
        status = 'warning'
        statusText = 'Expiring Soon'
        glowClass = 'hover:glow-warning'
    }

    const copyEmail = () => {
        if (trial.email) {
            navigator.clipboard.writeText(trial.email)
        }
    }

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-slide-up",
            glowClass,
            daysLeft <= 0 && "opacity-70"
        )}>
            {/* Progress bar at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                <div
                    className={cn(
                        "h-full transition-all duration-500",
                        status === 'success' && "bg-green-500",
                        status === 'warning' && "bg-yellow-500",
                        status === 'destructive' && "bg-red-500"
                    )}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <CardHeader className="pb-3 pt-5 flex flex-row items-start justify-between space-y-0 gap-2">
                <div className="space-y-1.5 min-w-0 flex-1">
                    <h3 className="font-semibold leading-none tracking-tight text-lg truncate pr-1" title={trial.serviceName}>{trial.serviceName}</h3>
                    <div
                        className="flex items-center text-sm text-muted-foreground gap-1.5 cursor-pointer hover:text-foreground transition-colors group/email min-w-0"
                        onClick={copyEmail}
                        title="Click to copy"
                    >
                        <span className="truncate">{trial.email || "No email stored"}</span>
                        {trial.email && <Copy className="h-3 w-3 opacity-0 group-hover/email:opacity-100 transition-opacity shrink-0" />}
                    </div>
                </div>
                <Badge variant={status} className="animate-fade-in">{statusText}</Badge>
            </CardHeader>

            <CardContent className="pb-3 text-sm grid gap-2.5">
                <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Ends:</span>
                    <span className="font-medium">{format(endDate, "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{trial.durationLabel}</span>
                </div>
                {trial.price !== undefined && (
                    <div className="flex items-center gap-2.5">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-medium">
                            {trial.currency === 'USD' ? '$' :
                                trial.currency === 'EUR' ? '€' :
                                    trial.currency === 'GBP' ? '£' :
                                        trial.currency === 'BRL' ? 'R$' : trial.currency}
                            {trial.price.toFixed(2)}
                        </span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0 flex justify-between items-center gap-2">
                <div className={cn(
                    "text-xl sm:text-2xl font-bold tabular-nums truncate",
                    daysLeft <= 3 && daysLeft > 0 && "text-yellow-500",
                    daysLeft <= 0 && "text-destructive"
                )}>
                    {daysLeft > 0 ? daysLeft : 0}
                    <span className="text-xs font-normal text-muted-foreground ml-1">days left</span>
                </div>
                <div className="flex gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(trial)}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all hover:scale-110"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(trial.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all hover:scale-110"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

