import { describe, expect, it } from 'vitest';
import {
  DEPLOY_OUTCOMES,
  deployMessage,
  firstLine,
  shouldAnnounce,
  slackPayload,
} from '../scripts/lib/deploy-notice.mjs';

const merge = {
  eventName: 'push',
  commitMessage:
    'Merge pull request #6 from masschallenge/claude/dependency-security\n\nUpdate sharp',
  commitSha: 'f91031709f100763a0a1ccc1a42ff7163e187ee7',
  actor: 'jschwendt',
  runUrl: 'https://github.com/masschallenge/propellant/actions/runs/1',
};

describe('the deploy notice', () => {
  it('announces merges and runs by hand, not the daily rebuild', () => {
    expect(shouldAnnounce('push')).toBe(true);
    expect(shouldAnnounce('workflow_dispatch')).toBe(true);
    expect(shouldAnnounce('schedule')).toBe(false);
    expect(shouldAnnounce('pull_request')).toBe(false);
  });

  it('names the site, the outcome, the merge and the run', () => {
    expect(deployMessage({ ...merge, outcome: 'started' })).toBe(
      'Propellant site deploy to https://propellant.masschallenge.org started. Merged: "Merge pull request #6 from masschallenge/claude/dependency-security" (f910317). https://github.com/masschallenge/propellant/actions/runs/1',
    );
    expect(deployMessage({ ...merge, outcome: 'succeeded' })).toContain(
      'succeeded. The site is live.',
    );
    expect(deployMessage({ ...merge, outcome: 'failed' })).toContain(
      'failed. The live site is unchanged.',
    );
  });

  it('says who ran a deploy by hand', () => {
    expect(
      deployMessage({ ...merge, eventName: 'workflow_dispatch', outcome: 'started' }),
    ).toContain('Run by hand by jschwendt from f910317.');
  });

  it('rejects an outcome it does not know', () => {
    expect(DEPLOY_OUTCOMES).toEqual(['started', 'succeeded', 'failed']);
    expect(() => deployMessage({ ...merge, outcome: 'paused' })).toThrow();
  });

  it('keeps only the first line of a commit message and posts plain text', () => {
    expect(firstLine('Title\n\nBody')).toBe('Title');
    expect(firstLine()).toBe('');
    expect(JSON.parse(slackPayload('Hello'))).toEqual({ text: 'Hello' });
  });
});
