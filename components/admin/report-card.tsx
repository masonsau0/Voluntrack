import { AdminReport } from "@/app/api/admin/reports/route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Trash2, Pencil, CheckCircle, Eye } from "lucide-react"

interface ReportCardProps {
  report: AdminReport
  onRemove: (reportId: string, opportunityId: string) => void
  onAllow: (reportId: string) => void
  onEditClick: (report: AdminReport) => void
  onViewOpportunity: (report: AdminReport) => void
}

export function ReportCard({ report, onRemove, onAllow, onEditClick, onViewOpportunity }: ReportCardProps) {
  const date = new Date(report.createdAt).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">{report.opportunityTitle}</p>
            {report.orgName && (
              <p className="text-xs text-gray-600 font-medium mt-0.5">{report.orgName}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">Reported {date}</p>
          </div>
          <span className="shrink-0 text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-full">
            Pending Review
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Reason</p>
          <p className="text-sm text-gray-800">{report.reason}</p>
        </div>

        {report.text && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Additional details</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">
              {report.text}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5 border-gray-300 text-gray-700"
            onClick={() => onViewOpportunity(report)}
          >
            <Eye className="w-3.5 h-3.5" />
            View Opportunity
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => onRemove(report.id, report.opportunityId)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove Opportunity
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5 border-gray-300"
            onClick={() => onEditClick(report)}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Opportunity
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 text-gray-500"
            onClick={() => onAllow(report.id)}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Allow / Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
