export type WebhookEvent = 'COURSE_COMPLETED' | 'COMPLIANCE_WARNING' | 'CERT_EXPIRED';

export interface WebhookDispatchResult {
  delivered: boolean;
  slack?: { status: number | string; success: boolean };
  teams?: { status: number | string; success: boolean };
  reason?: string;
  error?: string;
}

export async function dispatchWebhookEvent(
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<WebhookDispatchResult> {
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const teamsUrl = process.env.TEAMS_WEBHOOK_URL;

  if (!slackUrl && !teamsUrl) {
    console.info(`[Webhook:Skipped] event=${event} - No SLACK_WEBHOOK_URL or TEAMS_WEBHOOK_URL configured.`);
    return { delivered: false, reason: 'NO_WEBHOOK_CONFIGURED' };
  }

  const timestamp = new Date().toISOString();
  const eventTitles: Record<WebhookEvent, string> = {
    COURSE_COMPLETED: '🎓 Course Completion & Certificate Issued',
    COMPLIANCE_WARNING: '⚠️ Mandatory Compliance Expiration Notice',
    CERT_EXPIRED: '🚨 Certificate Expired & Re-enrollment Required',
  };

  const title = eventTitles[event] || `LMS Event: ${event}`;
  const details = Object.entries(payload)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `*${k}*: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join('\n');

  // Format Slack Block Kit
  const slackPayload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*System:* Buddy Learning Corporate LMS\n*Timestamp:* ${timestamp}\n\n${details}`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Event Type: \`${event}\` | Environment: \`${process.env.NODE_ENV || 'development'}\``,
          },
        ],
      },
    ],
  };

  // Format Microsoft Teams Adaptive Card
  const teamsPayload = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              text: title,
              weight: 'Bolder',
              size: 'Medium',
              color: event === 'CERT_EXPIRED' ? 'Attention' : event === 'COMPLIANCE_WARNING' ? 'Warning' : 'Good',
            },
            {
              type: 'TextBlock',
              text: `Buddy Learning Operations | ${timestamp}`,
              isSubtle: true,
              spacing: 'None',
            },
            {
              type: 'FactSet',
              facts: Object.entries(payload)
                .filter(([_, v]) => v !== undefined && v !== null)
                .map(([k, v]) => ({
                  title: k,
                  value: typeof v === 'object' ? JSON.stringify(v) : String(v),
                })),
            },
          ],
        },
      },
    ],
  };

  const result: WebhookDispatchResult = { delivered: false };

  // Dispatch Slack Webhook with 4000ms AbortController timeout
  if (slackUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      result.slack = { status: res.status, success: res.ok };
      if (res.ok) result.delivered = true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Webhook:Slack:Failed] event=${event}: ${errorMsg}`);
      result.slack = { status: 'ERROR', success: false };
    }
  }

  // Dispatch Teams Webhook with 4000ms AbortController timeout
  if (teamsUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(teamsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamsPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      result.teams = { status: res.status, success: res.ok };
      if (res.ok) result.delivered = true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Webhook:Teams:Failed] event=${event}: ${errorMsg}`);
      result.teams = { status: 'ERROR', success: false };
    }
  }

  return result;
}
