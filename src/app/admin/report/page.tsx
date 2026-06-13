import { ReportView } from '@/components/report/report-view'

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Sales performance across daily, weekly, and monthly periods.
        </p>
      </header>

      <ReportView />
    </div>
  )
}
