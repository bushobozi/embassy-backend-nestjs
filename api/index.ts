// Re-export the serverless handler from the compiled main.ts
// This is a thin wrapper that Vercel can properly build
export { default } from '../src/main';
