import { apiRequest } from "./apiClient";

export async function fetchGameSession(sessionId: string) {
  return apiRequest(`/api/game-session/${sessionId}`);
}

export async function fetchVoteState(sessionId: string) {
  return apiRequest(`/api/game-session/${sessionId}/vote-state`);
}

export async function assignLeaders(sessionId: string, language: string) {
  return apiRequest(
    `/api/game-session/${sessionId}/assign-leaders?language=${language}`,
  );
}

export async function voteForPlayer(
  sessionId: string,
  voteRequest: { userId: string; votedUserId: string },
) {
  return apiRequest(`/api/game-session/${sessionId}/vote`, {
    method: "POST",
    body: JSON.stringify(voteRequest),
  });
}
