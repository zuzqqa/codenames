// TODO: commment the code
import { apiRequest } from "./apiClient";

export type CreateGameRequest = {
  gameName: string;
  maxPlayers: number;
  password: string;
  language: string;
}

enum SessionStatus {
  CREATED = "CREATED",
  LEADER_SELECTION = "LEADER_SELECTION",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

export type GameSessionRoomLobbyDTO = {
  status: SessionStatus;
  gameName: string;
  maxPlayers: number;
  connectedUsers: UserRoomLobbyDTO[][];
}

export type UserRoomLobbyDTO = {
  id: string;
  username: string;
  profilePic: number;
  status: UserStatus;
}

enum UserStatus {
  INACTIVE = "INACTIVE",
  ACTIVE = "ACTIVE",
}

export async function getGameSession(sessionId: string): Promise<GameSessionRoomLobbyDTO> {
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

export async function createGame(data: CreateGameRequest): Promise<string> {
  const response = await apiRequest(`/api/game-session/create-game`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return response.gameId;
}

export async function authenticatePassword(
  sessionId: string,
  password: string,
) {
  return await apiRequest(
    `/api/game-session/${sessionId}/authenticate-password/${password}`,
    {
      method: "POST",
    },
  );
}
