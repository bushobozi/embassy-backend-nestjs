// Re-export the serverless handler from src/main
// This wrapper ensures Vercel builds it correctly
import handler from '../src/main';

export default handler;
