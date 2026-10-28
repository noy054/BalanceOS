import { BadgeTone } from "../../admin/components/StatusBadge";
import { CatalogSubmissionStatus } from "../types";

export function submissionStatusTone(status: CatalogSubmissionStatus): BadgeTone {
  switch (status) {
    case "PENDING":
      return "warning";
    case "APPROVED":
      return "success";
    case "MERGED":
      return "accent";
    case "REJECTED":
      return "danger";
  }
}
