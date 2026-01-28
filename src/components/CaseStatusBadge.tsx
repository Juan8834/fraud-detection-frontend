type BackendCaseStatus = "OPEN" | "PENDING" | "CLOSED";

const STATUS_STYLES: Record<BackendCaseStatus, string> = {
  OPEN: "bg-gray-400",        // Open
  PENDING: "bg-blue-500",     // Investigating / Pending
  CLOSED: "bg-green-600",     // Cleared / Closed
};

const STATUS_LABELS: Record<BackendCaseStatus, string> = {
  OPEN: "Open",
  PENDING: "Investigating",
  CLOSED: "Cleared",
};

export default function CaseStatusBadge({
  status = "OPEN",
}: {
  status?: BackendCaseStatus;
}) {
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold text-white rounded ${
        STATUS_STYLES[status]
      }`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
