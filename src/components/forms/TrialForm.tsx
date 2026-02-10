import { useState, useEffect } from "react"
import { addDays, format, parseISO } from "date-fns"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Trial } from "@/types"

interface TrialFormProps {
    initialData?: Trial
    onSubmit: (trial: Trial) => void
    submitLabel?: string
    title?: string
}

export function TrialForm({ initialData, onSubmit, submitLabel = "Start Tracking", title = "Add New Trial" }: TrialFormProps) {
    const [serviceName, setServiceName] = useState(initialData?.serviceName || "")
    const [email, setEmail] = useState(initialData?.email || "")
    const [startDate, setStartDate] = useState(initialData?.startDate || format(new Date(), "yyyy-MM-dd"))
    const [durationLabel, setDurationLabel] = useState<Trial['durationLabel']>(initialData?.durationLabel || '7 Days')
    const [customEndDate, setCustomEndDate] = useState(initialData?.endDate || "")
    const [price, setPrice] = useState(initialData?.price?.toString() || "")
    const [currency, setCurrency] = useState(initialData?.currency || "USD")
    // Logic to handle if initialData has a custom duration or standard.
    // If initialData is provided, we might need to deduce if it was Custom.
    // For now, trusting the passed durationLabel.

    useEffect(() => {
        if (initialData) {
            setServiceName(initialData.serviceName)
            setEmail(initialData.email)
            setStartDate(initialData.startDate)
            setDurationLabel(initialData.durationLabel)
            setCustomEndDate(initialData.endDate)
            setPrice(initialData.price?.toString() || "")
            setCurrency(initialData.currency || "USD")
        }
    }, [initialData])

    // Auto-calculate end date for display/Preview
    const getCalculatedEndDate = () => {
        if (!startDate) return ""
        const start = parseISO(startDate)
        if (isNaN(start.getTime())) return "" // Invalid date

        if (durationLabel === '7 Days') return format(addDays(start, 7), "yyyy-MM-dd")
        if (durationLabel === '14 Days') return format(addDays(start, 14), "yyyy-MM-dd")
        if (durationLabel === '30 Days') return format(addDays(start, 30), "yyyy-MM-dd")

        // If it's custom, we use the customEndDate if manually set, 
        // OR if we are editing and it was already set.
        return customEndDate
    }

    const calculatedEndDate = getCalculatedEndDate()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!serviceName || !startDate) return

        const finalEndDate = calculatedEndDate
        if (!finalEndDate && durationLabel === 'Custom') return

        // For non-custom durations, ensuring finalEndDate is computed correctly
        const computedEndDate = (durationLabel !== 'Custom' && calculatedEndDate) ? calculatedEndDate : finalEndDate;

        if (!computedEndDate) return

        const newTrial: Trial = {
            id: initialData?.id || crypto.randomUUID(),
            serviceName,
            email,
            startDate,
            endDate: computedEndDate,
            durationLabel,
            isActive: true,
            price: price ? parseFloat(price) : undefined,
            currency
        }

        onSubmit(newTrial)

        // Reset form if not editing (or maybe even if editing, to close? Parent handles close)
        if (!initialData) {
            setServiceName("")
            setEmail("")
            setDurationLabel("7 Days")
            setCustomEndDate("")
            setStartDate(format(new Date(), "yyyy-MM-dd"))
            setPrice("")
            setCurrency("USD")
        }
    }

    return (
        <Card className="w-full border bg-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="px-0 pt-0">
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Service Name
                        </label>
                        <Input
                            value={serviceName}
                            onChange={e => setServiceName(e.target.value)}
                            placeholder="e.g. Netflix, Adobe"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            Email Used
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Monthly Cost</label>
                            <div className="flex gap-2">
                                <select
                                    className="flex h-10 w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value)}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="BRL">BRL (R$)</option>
                                </select>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium leading-none">Duration</label>
                            <div className="flex flex-wrap gap-2">
                                {(['7 Days', '14 Days', '30 Days'] as const).map((label) => (
                                    <Button
                                        key={label}
                                        type="button"
                                        variant={durationLabel === label ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setDurationLabel(label)}
                                        className="flex-1"
                                    >
                                        {label}
                                    </Button>
                                ))}
                                <Button
                                    type="button"
                                    variant={durationLabel === 'Custom' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setDurationLabel('Custom')}
                                    className="flex-1"
                                >
                                    Custom
                                </Button>
                            </div>
                        </div>
                    </div>

                    {durationLabel === 'Custom' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-medium leading-none">End Date</label>
                            <Input
                                type="date"
                                value={customEndDate}
                                onChange={e => setCustomEndDate(e.target.value)}
                                required={durationLabel === 'Custom'}
                            />
                        </div>
                    )}

                    <div className="pt-2">
                        <div className="text-sm text-muted-foreground mb-4">
                            Trial ends on: <span className="font-medium text-foreground">{calculatedEndDate || "Select dates"}</span>
                        </div>
                        <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-white shadow-lg">
                            {submitLabel}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
