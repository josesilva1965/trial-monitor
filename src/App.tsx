import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { TrialForm } from "@/components/forms/TrialForm"
import { TrialList } from "@/components/dashboard/TrialList"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { useTrials } from "@/hooks/useTrials"
import { useNotificationScheduler } from "@/hooks/useNotificationScheduler"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Trial } from "@/types"

function App() {
  const { trials, addTrial, deleteTrial, updateTrial } = useTrials()
  useNotificationScheduler(trials) // Activate notifications
  const [editingTrial, setEditingTrial] = useState<Trial | null>(null)
  const [deletingTrialId, setDeletingTrialId] = useState<string | null>(null)

  const handleUpdate = (updatedTrial: Trial) => {
    updateTrial(updatedTrial)
    setEditingTrial(null)
  }

  const confirmDelete = () => {
    if (deletingTrialId) {
      deleteTrial(deletingTrialId)
      setDeletingTrialId(null)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start order-1 md:order-none">
        {/* Main Content: Trial List */}
        <div className="flex-1 space-y-6 min-w-0">
          <DashboardStats trials={trials} />
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Your Trials</h2>
          </div>
          <TrialList trials={trials} onDelete={setDeletingTrialId} onEdit={setEditingTrial} />
        </div>

        {/* Side Content: Add Form */}
        {/* On mobile, we might want this on top or bottom. Currently it's after list in DOM but flex-col. */}
        {/* Let's make it sticky on desktop */}
        <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-4">
          <TrialForm onSubmit={addTrial} />
        </div>
      </div>

      <Modal
        isOpen={!!editingTrial}
        onClose={() => setEditingTrial(null)}
        title="Edit Trial"
      >
        {editingTrial && (
          <TrialForm
            initialData={editingTrial}
            onSubmit={handleUpdate}
            submitLabel="Update Trial"
            title="Edit Trial Details"
          />
        )}
      </Modal>

      <Modal
        isOpen={!!deletingTrialId}
        onClose={() => setDeletingTrialId(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this trial? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingTrialId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

export default App
