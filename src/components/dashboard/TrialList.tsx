import { differenceInCalendarDays, parseISO } from "date-fns"
import { Trial } from "@/types"
import { TrialCard } from "./TrialCard"
import { PackageOpen } from "lucide-react"

interface TrialListProps {
    trials: Trial[]
    onDelete: (id: string) => void
    onEdit: (trial: Trial) => void
}

export function TrialList({ trials, onDelete, onEdit }: TrialListProps) {
    const sortedTrials = [...trials].sort((a, b) => {
        const dateA = parseISO(a.endDate)
        const dateB = parseISO(b.endDate)
        // We want ascending order of expiration date (earliest first)
        return dateA.getTime() - dateB.getTime()
    })

    if (trials.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No trials tracked yet</h3>
                <p className="text-muted-foreground max-w-sm">Add your first free trial using the form to avoid unexpected charges.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {sortedTrials.map(trial => (
                <TrialCard key={trial.id} trial={trial} onDelete={onDelete} onEdit={onEdit} />
            ))}
        </div>
    )
}
