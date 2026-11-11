export interface History<State> {
  past: State[];
  present: State;
  future: State[];
  lastKey: string | null;
  lastAt: number;
}

export const HISTORY_LIMIT = 100;
export const COALESCE_MILLISECONDS = 1000;

export const createHistory = <State>(present: State): History<State> => ({
  past: [],
  present,
  future: [],
  lastKey: null,
  lastAt: 0,
});

export const pushHistory = <State>(
  history: History<State>,
  next: State,
  key: string | null = null,
  now = 0,
): History<State> => {
  if (next === history.present) return history;
  const coalesces =
    key !== null && key === history.lastKey && now - history.lastAt < COALESCE_MILLISECONDS;
  if (coalesces) return { ...history, present: next, future: [], lastAt: now };
  return {
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
    lastKey: key,
    lastAt: now,
  };
};

export const replacePresent = <State>(history: History<State>, next: State): History<State> =>
  next === history.present ? history : { ...history, present: next };

export const canUndo = <State>(history: History<State>): boolean => history.past.length > 0;

export const canRedo = <State>(history: History<State>): boolean => history.future.length > 0;

export const undoHistory = <State>(history: History<State>): History<State> => {
  if (!canUndo(history)) return history;
  return {
    past: history.past.slice(0, -1),
    present: history.past[history.past.length - 1],
    future: [history.present, ...history.future],
    lastKey: null,
    lastAt: 0,
  };
};

export const redoHistory = <State>(history: History<State>): History<State> => {
  if (!canRedo(history)) return history;
  return {
    past: [...history.past, history.present],
    present: history.future[0],
    future: history.future.slice(1),
    lastKey: null,
    lastAt: 0,
  };
};
