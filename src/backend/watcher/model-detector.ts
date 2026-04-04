import { getLastRequest, insertModelTransition, type TransitionData } from '../db/transitions';

export class ModelTransitionDetector {
  /**
   * Detect if a model transition occurred and record it
   * Returns the transition data if detected, null otherwise
   */
  async detectTransition(
    sessionId: string,
    currentModel: string
  ): Promise<TransitionData | null> {
    const lastRequest = await getLastRequest(sessionId);

    // First request in session
    if (!lastRequest) {
      const transition: TransitionData = {
        session_id: sessionId,
        from_model: null,
        to_model: currentModel,
        trigger: 'session_start',
      };

      await insertModelTransition(transition);
      return transition;
    }

    // Model changed
    if (lastRequest.model !== currentModel) {
      const transition: TransitionData = {
        session_id: sessionId,
        from_model: lastRequest.model,
        to_model: currentModel,
        trigger: this.inferTrigger(lastRequest),
      };

      await insertModelTransition(transition);
      return transition;
    }

    // No transition
    return null;
  }

  /**
   * Infer why the model changed based on context
   */
  private inferTrigger(lastRequest: any): string {
    // Sub-agent spawning
    if (lastRequest.isSubagent) {
      return 'subagent_spawn';
    }

    // Future: Check for EnterPlanMode/ExitPlanMode in recent messages
    // For now, mark as unknown
    return 'unknown';
  }
}
