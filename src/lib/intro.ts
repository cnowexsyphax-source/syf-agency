export const INTRO_KEY = 'syf-intro-seen';
export const REPLAY_EVENT = 'syf:replay-intro';
export const replayIntro = () => window.dispatchEvent(new Event(REPLAY_EVENT));
