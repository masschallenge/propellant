import { deployMessage, shouldAnnounce, slackPayload } from './lib/deploy-notice.mjs';

const POST_TIMEOUT_MILLISECONDS = 15000;

const outcome = process.argv[2];
const eventName = process.env.EVENT_NAME;

if (!shouldAnnounce(eventName)) {
  console.log(`Not announcing a ${eventName} deploy.`);
  process.exit(0);
}

const message = deployMessage({
  outcome,
  eventName,
  commitMessage: process.env.COMMIT_MESSAGE,
  commitSha: process.env.COMMIT_SHA,
  actor: process.env.ACTOR,
  runUrl: process.env.RUN_URL,
});
console.log(message);

const webhook = process.env.SLACK_WEBHOOK_URL;
if (!webhook) {
  console.log('SLACK_WEBHOOK_URL is not set, so nothing was posted to Slack.');
  process.exit(0);
}

try {
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: slackPayload(message),
    signal: AbortSignal.timeout(POST_TIMEOUT_MILLISECONDS),
  });
  if (!response.ok) console.log(`::warning::Slack answered ${response.status}.`);
} catch (error) {
  console.log(`::warning::The Slack notice could not be sent: ${error.message}`);
}
