import { ActivePipelineApplications } from "@modules/insights/domain/executables/activePipelineApplications";
import { ApplicationsAppliedLast30Days } from "@modules/insights/domain/executables/applicationsAppliedLast30Days";
import { ApplicationsAppliedPrevious30Days } from "@modules/insights/domain/executables/applicationsAppliedPrevious30Days";
import { ApplicationsCreatedLast30Days } from "@modules/insights/domain/executables/applicationsCreatedLast30Days";
import { ApplicationsCreatedPrevious30Days } from "@modules/insights/domain/executables/applicationsCreatedPrevious30Days";
import { ApplicationsOfferLast30Days } from "@modules/insights/domain/executables/applicationsOfferLast30Days";
import { ApplicationsOfferPrevious30Days } from "@modules/insights/domain/executables/applicationsOfferPrevious30Days";
import { ApplicationsRespondedLast30Days } from "@modules/insights/domain/executables/applicationsRespondedLast30Days";
import { ApplicationsRespondedPrevious30Days } from "@modules/insights/domain/executables/applicationsRespondedPrevious30Days";
import { OfferRate } from "@modules/insights/domain/executables/offerRate";
import { RejectionRate } from "@modules/insights/domain/executables/rejectionRate";
import { ResponseRate } from "@modules/insights/domain/executables/responseRate";
import { TotalApplications } from "@modules/insights/domain/executables/totalApplications";
import { TotalAppliedApplications } from "@modules/insights/domain/executables/totalAppliedApplications";
import { TotalInterviewingApplications } from "@modules/insights/domain/executables/totalInterviewingApplications";
import { TotalOffers } from "@modules/insights/domain/executables/totalOffers";
import { TotalRejectedApplications } from "@modules/insights/domain/executables/totalRejectedApplications";
import { describe, expect, it } from "vitest";

import { createDatabaseDriverMock } from "../../../fixtures/factories/testDatabaseFactories";

describe("insight executables", () => {
  it("returns default view state before execution for summary metrics", () => {
    const { driver } = createDatabaseDriverMock();
    const metric = new TotalApplications(driver);

    expect(metric.toView()).toEqual({
      id: TotalApplications.id,
      title: "Total applications",
      description: "All active records in your tracker",
      icon: "heroicons:briefcase",
      tone: "info",
      value: 0,
      trendValue: undefined,
      trendTone: "neutral",
    });
  });

  it("executes aggregate count metrics and maps them to card views", async () => {
    const cases = [
      {
        MetricClass: TotalApplications,
        row: { totalApplications: 42 },
        expectedValue: 42,
        expectedView: { trendValue: "+42%", trendTone: "positive" },
      },
      {
        MetricClass: TotalAppliedApplications,
        row: { totalAppliedApplications: 21 },
        expectedValue: 21,
        expectedView: { trendValue: "+21%", trendTone: "positive" },
      },
      {
        MetricClass: TotalInterviewingApplications,
        row: { totalInterviewingApplications: 7 },
        expectedValue: 7,
        expectedView: { trendTone: "positive" },
      },
      {
        MetricClass: TotalOffers,
        row: { totalOffers: 3 },
        expectedValue: 3,
        expectedView: { trendTone: "positive" },
      },
      {
        MetricClass: TotalRejectedApplications,
        row: { totalRejectedApplications: 5 },
        expectedValue: 5,
        expectedView: { trendTone: "positive" },
      },
      {
        MetricClass: ActivePipelineApplications,
        row: { activePipelineApplications: 11 },
        expectedValue: 11,
        expectedView: { trendTone: "positive" },
      },
      {
        MetricClass: ApplicationsCreatedPrevious30Days,
        row: { applicationsCreatedPrevious30Days: 8 },
        expectedValue: 8,
        expectedView: { trendTone: "positive" },
      },
      {
        MetricClass: ApplicationsAppliedPrevious30Days,
        row: { applicationsAppliedPrevious30Days: 6 },
        expectedValue: 6,
        expectedView: { trendTone: "positive" },
      },
      {
        MetricClass: ApplicationsRespondedLast30Days,
        row: { applicationsRespondedLast30Days: 4 },
        expectedValue: 4,
        expectedView: { trendTone: "positive" },
      },
      {
        MetricClass: ApplicationsRespondedPrevious30Days,
        row: { applicationsRespondedPrevious30Days: 2 },
        expectedValue: 2,
        expectedView: { trendTone: "positive" },
      },
      {
        MetricClass: ApplicationsOfferLast30Days,
        row: { applicationsOfferLast30Days: 1 },
        expectedValue: 1,
        expectedView: { trendTone: "positive" },
      },
      {
        MetricClass: ApplicationsOfferPrevious30Days,
        row: { applicationsOfferPrevious30Days: 1 },
        expectedValue: 1,
        expectedView: { trendTone: "positive" },
      },
    ] as const;

    for (const testCase of cases) {
      const { driver, selectMock } = createDatabaseDriverMock();
      selectMock.mockResolvedValue([testCase.row]);
      const metric = new testCase.MetricClass(driver);

      await expect(metric.execute()).resolves.toBe(testCase.expectedValue);

      expect(selectMock).toHaveBeenCalledOnce();
      expect(String(selectMock.mock.calls[0]?.[0])).toContain(
        "FROM applications",
      );
      expect(metric.toView()).toEqual(
        expect.objectContaining({
          id: testCase.MetricClass.id,
          value: testCase.expectedValue,
          ...testCase.expectedView,
        }),
      );
    }
  });

  it("calculates rolling created and applied trends", async () => {
    const created = createDatabaseDriverMock();
    created.selectMock.mockResolvedValue([
      {
        applicationsCreatedLast30Days: 6,
        applicationsCreatedPrevious30Days: 3,
      },
    ]);
    const createdMetric = new ApplicationsCreatedLast30Days(created.driver);

    await expect(createdMetric.execute()).resolves.toBe(6);
    expect(createdMetric.toView()).toEqual(
      expect.objectContaining({
        id: ApplicationsCreatedLast30Days.id,
        value: 6,
        trendValue: "+100%",
        trendTone: "positive",
      }),
    );

    const applied = createDatabaseDriverMock();
    applied.selectMock.mockResolvedValue([
      {
        applicationsAppliedLast30Days: 4,
        applicationsAppliedPrevious30Days: 2,
      },
    ]);
    const appliedMetric = new ApplicationsAppliedLast30Days(applied.driver);

    await expect(appliedMetric.execute()).resolves.toBe(4);
    expect(appliedMetric.toView()).toEqual(
      expect.objectContaining({
        id: ApplicationsAppliedLast30Days.id,
        value: 4,
        trendValue: "+100%",
        trendTone: "positive",
      }),
    );
  });

  it("calculates response, offer, and rejection rates", async () => {
    const response = createDatabaseDriverMock();
    response.selectMock.mockResolvedValue([
      {
        responded: 5,
        applied: 10,
        responded_last_30: 3,
        applied_last_30: 4,
        responded_previous_30: 1,
        applied_previous_30: 4,
      },
    ]);
    const responseMetric = new ResponseRate(response.driver);

    await expect(responseMetric.execute()).resolves.toBe(50);
    expect(responseMetric.toView()).toEqual(
      expect.objectContaining({
        id: ResponseRate.id,
        value: 50,
        suffix: "%",
        trendValue: "+50pp",
        trendTone: "positive",
      }),
    );

    const offer = createDatabaseDriverMock();
    offer.selectMock.mockResolvedValue([
      {
        offers: 2,
        applied: 8,
        offers_last_30: 1,
        applied_last_30: 2,
        offers_previous_30: 0,
        applied_previous_30: 4,
      },
    ]);
    const offerMetric = new OfferRate(offer.driver);

    await expect(offerMetric.execute()).resolves.toBe(25);
    expect(offerMetric.toView()).toEqual(
      expect.objectContaining({
        id: OfferRate.id,
        value: 25,
        suffix: "%",
        trendValue: "+50pp",
        trendTone: "positive",
      }),
    );

    const rejection = createDatabaseDriverMock();
    rejection.selectMock.mockResolvedValue([{ rejected: 1, applied: 4 }]);
    const rejectionMetric = new RejectionRate(rejection.driver);

    await expect(rejectionMetric.execute()).resolves.toBe(25);
    expect(rejectionMetric.toView()).toEqual(
      expect.objectContaining({
        id: RejectionRate.id,
        value: 25,
        suffix: "%",
        trendTone: "positive",
      }),
    );
  });

  it("falls back to zero values when metric queries return no data", async () => {
    const { driver, selectMock } = createDatabaseDriverMock();
    selectMock.mockResolvedValue([]);
    const metric = new ResponseRate(driver);

    await expect(metric.execute()).resolves.toBe(0);
    expect(metric.toView()).toEqual(
      expect.objectContaining({
        id: ResponseRate.id,
        value: 0,
        trendValue: "0pp",
        trendTone: "neutral",
      }),
    );
  });
});

