import { ReportView } from '@/components/report/report-view'
import { getReportData } from '@/services/report/report'

export default async function ReportsPage() {
  const reports = await getReportData()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Sales performance across daily, weekly, and monthly periods.
        </p>
      </header>

      <ReportView reports={reports} />
    </div>
  )
}
