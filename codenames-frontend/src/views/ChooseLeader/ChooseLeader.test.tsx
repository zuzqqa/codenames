import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ChooseLeader from "./ChooseLeader";
import { io } from "socket.io-client";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("socket.io-client");

const mockGetUserId = vi.fn(() => Promise.resolve("user-123"));

vi.mock("../../shared/utils.tsx", () => ({
  getUserId: () => mockGetUserId(),
  formatTime: (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ChooseLeader", () => {
  const mockProps = {
    setVolume: vi.fn(),
    soundFXVolume: 50,
    setSoundFXVolume: vi.fn(),
  };

  const mockGameSession = {
    status: "LEADER_SELECTION",
    gameName: "Test Game",
    maxPlayers: 6,
    connectedUsers: [
      [
        {
          id: "user-123",
          username: "Player1",
          profilePic: 1,
          status: "ACTIVE",
        },
        {
          id: "user-456",
          username: "Player2",
          profilePic: 2,
          status: "ACTIVE",
        },
      ],
      [
        {
          id: "user-789",
          username: "Player3",
          profilePic: 3,
          status: "ACTIVE",
        },
      ],
    ],
  };

  const mockVoteState = {
    voteState: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem("gameId", "test-game-id");
    localStorage.setItem("userId", "user-123");

    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/vote-state")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVoteState),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGameSession),
      } as Response);
    });

    const mockSocket = {
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    };
    (io as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("renders the component with compass image", async () => {
    render(
      <BrowserRouter>
        <ChooseLeader {...mockProps} />
      </BrowserRouter>
    );

    await waitFor(() => {
      const compass = screen.getByAltText("compass");
      expect(compass).toBeInTheDocument();
    });
  });

  it("displays countdown timer", async () => {
    render(
      <BrowserRouter>
        <ChooseLeader {...mockProps} />
      </BrowserRouter>
    );

    await waitFor(() => {
      const timer = screen.getByText(/\d+:\d+/);
      expect(timer).toBeInTheDocument();
    });
  });

  it("allows clicking on a player", async () => {
    render(
      <BrowserRouter>
        <ChooseLeader {...mockProps} />
      </BrowserRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText("Player1")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const player1Element = screen.getByText("Player1").closest(".player");
    expect(player1Element).toBeInTheDocument();

    if (player1Element) {
      fireEvent.click(player1Element);
    }
  });

  it("displays players in teams", async () => {
    const { container } = render(
      <BrowserRouter>
        <ChooseLeader {...mockProps} />
      </BrowserRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText("Player1")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const myTeam = container.querySelector(".team.my-team");

    expect(myTeam).toBeInTheDocument();

    const myTeamPlayers = myTeam?.querySelectorAll(".player");

    expect(myTeamPlayers?.length).toBe(2);
  });

  it("navigates to /games if gameId is not in sessionStorage", () => {
    sessionStorage.removeItem("gameId");

    render(
      <BrowserRouter>
        <ChooseLeader {...mockProps} />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/games");
  });

  it("fetches game session data on mount", async () => {
    render(
      <BrowserRouter>
        <ChooseLeader {...mockProps} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/game-session/test-game-id")
      );
    });
  });

  it("displays my team with correct players", async () => {
    render(
      <BrowserRouter>
        <ChooseLeader {...mockProps} />
      </BrowserRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText("Player1")).toBeInTheDocument();
        expect(screen.getByText("Player2")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("connects to socket on mount", async () => {
    render(
      <BrowserRouter>
        <ChooseLeader {...mockProps} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(io).toHaveBeenCalledWith(
        expect.stringContaining("/game"),
        expect.objectContaining({
          transports: ["websocket", "polling"],
        })
      );
    });
  });
});