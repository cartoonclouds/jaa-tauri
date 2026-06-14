import type { Application } from "@modules/applications/domain/entities/Application";

/**
 * Builds rich semantic-search content for an application record.
 */
export function buildApplicationSemanticContent(options: {
  application: Application;
  companyName: string | null;
}): string {
  const sections = [
    options.companyName ? `Company: ${options.companyName}` : null,
    `Role: ${options.application.title}`,
    options.application.locationText
      ? `Location: ${options.application.locationText}`
      : null,
    `Status: ${String(options.application.status)}`,
    `Event Flow: ${String(options.application.eventFlowStatus)}`,
    options.application.description
      ? `Application Notes: ${options.application.description}`
      : null,
    options.application.interviewProcess
      ? `Interview Process: ${options.application.interviewProcess}`
      : null,
    options.application.benefits
      ? `Benefits: ${options.application.benefits}`
      : null,
  ];

  return sections.filter(Boolean).join("\n");
}
