import { db } from './index';
import { modelTransitions, requests } from './schema';
import { eq, desc } from 'drizzle-orm';

export interface TransitionData {
  session_id: string;
  from_model: string | null;
  to_model: string;
  trigger: string;
  context_note?: string;
}

/**
 * Insert a model transition
 */
export async function insertModelTransition(data: TransitionData): Promise<number> {
  const result = await db.insert(modelTransitions).values({
    sessionId: data.session_id,
    timestamp: new Date(),
    fromModel: data.from_model,
    toModel: data.to_model,
    trigger: data.trigger,
    contextNote: data.context_note || null,
  }).returning({ id: modelTransitions.id });

  return result[0].id;
}

/**
 * Get the last request for a session
 */
export async function getLastRequest(sessionId: string) {
  const result = await db
    .select()
    .from(requests)
    .where(eq(requests.sessionId, sessionId))
    .orderBy(desc(requests.timestamp))
    .limit(1);

  return result[0] || null;
}
