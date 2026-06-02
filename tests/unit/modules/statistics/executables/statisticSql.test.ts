import {
  EFFECTIVE_STAGE_TYPE_SQL,
  INTERVIEWING_STAGE_PREDICATE_SQL,
  LAST_30_DAYS_APPLIED_SQL,
  OFFER_STAGE_PREDICATE_SQL,
  PREVIOUS_30_DAYS_APPLIED_SQL,
  REJECTED_STAGE_PREDICATE_SQL,
  RESPONDED_STAGE_PREDICATE_SQL,
} from "@modules/statistics/domain/executables/statisticSql";
import { describe, expect, it } from "vitest";

describe("statisticSql", () => {
  it("builds expected SQL snippets", () => {
    expect(EFFECTIVE_STAGE_TYPE_SQL).toContain("SELECT e.type");
    expect(EFFECTIVE_STAGE_TYPE_SQL).toContain("application_events");
    expect(INTERVIEWING_STAGE_PREDICATE_SQL).toContain("Interview/%");
    expect(OFFER_STAGE_PREDICATE_SQL).toContain("Offer/%");
    expect(REJECTED_STAGE_PREDICATE_SQL).toContain("Decision/Rejected");
    expect(RESPONDED_STAGE_PREDICATE_SQL).toContain(
      INTERVIEWING_STAGE_PREDICATE_SQL.trim(),
    );
    expect(LAST_30_DAYS_APPLIED_SQL).toContain("-30 day");
    expect(PREVIOUS_30_DAYS_APPLIED_SQL).toContain("-60 day");
  });
});
