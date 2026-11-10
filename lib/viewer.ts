// What the interface needs to know about the current visitor. Safe to pass to Client Components.
export type Viewer = {
  signedIn: boolean;
  isDemo: boolean;
  demoAvailable: boolean;
};
