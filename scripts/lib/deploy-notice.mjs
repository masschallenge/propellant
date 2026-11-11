export const SITE_URL = 'https://propellant.masschallenge.org';

export const DEPLOY_OUTCOMES = ['started', 'succeeded', 'failed'];

const ANNOUNCED_EVENTS = ['push', 'workflow_dispatch'];

const OUTCOME_TEXT = {
  started: 'started',
  succeeded: 'succeeded. The site is live',
  failed: 'failed. The live site is unchanged',
};

export const shouldAnnounce = (eventName) => ANNOUNCED_EVENTS.includes(eventName);

export const firstLine = (text = '') => text.split('\n')[0].trim();

const sourceText = ({ eventName, commitMessage, commitSha, actor }) => {
  const shortSha = (commitSha || '').slice(0, 7);
  if (eventName === 'workflow_dispatch') {
    return `Run by hand${actor ? ` by ${actor}` : ''} from ${shortSha}.`;
  }
  const title = firstLine(commitMessage);
  return title ? `Merged: "${title}" (${shortSha}).` : `Merged ${shortSha}.`;
};

export const deployMessage = ({ outcome, eventName, commitMessage, commitSha, actor, runUrl }) => {
  if (!DEPLOY_OUTCOMES.includes(outcome)) throw new Error(`Unknown deploy outcome: ${outcome}`);
  return [
    `Propellant site deploy to ${SITE_URL} ${OUTCOME_TEXT[outcome]}.`,
    sourceText({ eventName, commitMessage, commitSha, actor }),
    runUrl,
  ]
    .filter(Boolean)
    .join(' ');
};

export const slackPayload = (message) => JSON.stringify({ text: message });
