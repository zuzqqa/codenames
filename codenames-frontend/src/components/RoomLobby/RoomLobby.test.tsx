import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RoomLobby from "./RoomLobby";
import { io } from "socket.io-client";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockAddToast = vi.fn();
vi.mock("../../components/Toast/ToastContext.tsx", () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocket),
}));

vi.mock("../../config/api.tsx", () => ({
  apiUrl: "http://localhost:8080",
  frontendUrl: "http://localhost:5173",
  socketUrl: "http://localhost:3000",
}));

vi.mock("../../shared/utils.tsx", () => ({
  getUserId: vi.fn(() => Promise.resolve("user-123")),
  getCookie: vi.fn(() => "test-token"),
}));

vi.mock("../../containers/RoomMenu/RoomMenu.tsx", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../Button/Button.tsx", () => ({
  default: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

describe("RoomLobby", () => {
  const mockGameSession = {
    status: "CREATED",
    gameName: "Test Game",
    maxPlayers: 8,
    connectedUsers: [
      [
        {
          id: "user-1",
          username: "Player1",
          profilePic: 1,
          status: "ACTIVE",
        },
      ],
      [
        {
          id: "user-2",
          username: "Player2",
          profilePic: 2,
          status: "ACTIVE",
        },
      ],
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/api/game-session/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameSession),
        });
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve("user-123"),
      });
    }) as any;

    Storage.prototype.getItem = vi.fn((key) => {
      if (key === "gameId") return "test-game-123";
      return null;
    });
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();

    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn(() => Promise.resolve()),
      },
      writable: true,
      configurable: true,
    });
  });

  it("renders game session data", async () => {
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    expect(screen.getByText(/slots/i)).toBeInTheDocument();
  });

  it("displays players in red and blue teams", async () => {
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(screen.getByText("Player1")).toBeInTheDocument();
      expect(screen.getByText("Player2")).toBeInTheDocument();
    });
  });

  it("joins red team when join red button is clicked", async () => {
    const user = userEvent.setup();
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    const joinButtons = screen.getAllByText("+");
    await user.click(joinButtons[0]);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/connect?userId=user-123&teamIndex=0"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );
    });
  });

  it("joins blue team when join blue button is clicked", async () => {
    const user = userEvent.setup();
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    const joinButtons = screen.getAllByText("+");
    await user.click(joinButtons[1]);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/connect?userId=user-123&teamIndex=1"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );
    });
  });

  it("leaves team when minus button is clicked after joining", async () => {
    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/connect")) {
        return Promise.resolve({ ok: true });
      }
      if (url.includes("/disconnect")) {
        return Promise.resolve({ ok: true });
      }
      if (url.includes("/api/game-session/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameSession),
        });
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve("user-123"),
      });
    }) as any;

    const user = userEvent.setup();
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    const joinButtons = screen.getAllByText("+");
    await user.click(joinButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("-")).toBeInTheDocument();
    });

    const leaveButton = screen.getByText("-");
    await user.click(leaveButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/disconnect?userId=user-123"),
        expect.objectContaining({
          method: "DELETE",
          credentials: "include",
        })
      );
    });
  });

  it("starts game when start button is clicked with enough players", async () => {
    const extendedGameSession = {
      ...mockGameSession,
      connectedUsers: [
        [
          {
            id: "user-1",
            username: "Player1",
            profilePic: 1,
            status: "ACTIVE",
          },
          {
            id: "user-2",
            username: "Player2",
            profilePic: 2,
            status: "ACTIVE",
          },
        ],
        [
          {
            id: "user-3",
            username: "Player3",
            profilePic: 3,
            status: "ACTIVE",
          },
          {
            id: "user-4",
            username: "Player4",
            profilePic: 4,
            status: "ACTIVE",
          },
        ],
      ],
    };

    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/start")) {
        return Promise.resolve({ ok: true });
      }
      if (url.includes("/api/game-session/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(extendedGameSession),
        });
      }
      return Promise.resolve({ ok: true });
    }) as any;

    const user = userEvent.setup();
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    const startButton = screen.getByText("Start");
    await user.click(startButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/choose-leader");
    });
  });

  it("shows notification after copying link", async () => {
    const user = userEvent.setup();
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    const linkIcons = screen.getAllByAltText("Link");
    await user.click(linkIcons[0]);

    const copyButton = screen.getByText("copy");
    await user.click(copyButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("link-copied", "notification");
    });
  });

  it("navigates to choose-leader when gameSessionUpdate received with LEADER_SELECTION status", async () => {
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith(
        "gameSessionUpdate",
        expect.any(Function)
      );
    });

    const updateHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "gameSessionUpdate"
    )?.[1];

    const updatedSession = {
      ...mockGameSession,
      status: "LEADER_SELECTION",
    };

    if (updateHandler) {
      updateHandler(JSON.stringify(updatedSession));
    }

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/choose-leader");
    });
  });

  it("connects to game socket on mount", async () => {
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(io).toHaveBeenCalledWith(
        "http://localhost:3000/game",
        expect.objectContaining({
          transports: ["websocket", "polling"],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })
      );
    });
  });

  it("emits joinGame event on socket connect", async () => {
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith(
        "connect",
        expect.any(Function)
      );
    });

    const connectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "connect"
    )?.[1];

    if (connectHandler) {
      connectHandler();
    }

    expect(mockSocket.emit).toHaveBeenCalledWith("joinGame", "test-game-123");
  });

  it("navigates back and removes gameId when back button is clicked", async () => {
    const user = userEvent.setup();
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    const backButton = screen.getByAltText("Back");
    await user.click(backButton);

    expect(sessionStorage.removeItem).toHaveBeenCalledWith("gameId");
    expect(mockNavigate).toHaveBeenCalledWith("/games");
  });

  it("navigates to join-game if no gameId in sessionStorage", () => {
    Storage.prototype.getItem = vi.fn(() => null);

    render(<RoomLobby soundFXVolume={50}/>);

    expect(mockNavigate).toHaveBeenCalledWith("/join-game");
  });

  it("updates team players when gameSessionUpdate is received", async () => {
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith(
        "gameSessionUpdate",
        expect.any(Function)
      );
    });

    const updateHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "gameSessionUpdate"
    )?.[1];

    const updatedSession = {
      ...mockGameSession,
      connectedUsers: [
        [
          {
            id: "user-1",
            username: "NewPlayer1",
            profilePic: 1,
            status: "ACTIVE",
          },
          {
            id: "user-3",
            username: "NewPlayer3",
            profilePic: 3,
            status: "ACTIVE",
          },
        ],
        [
          {
            id: "user-2",
            username: "Player2",
            profilePic: 2,
            status: "ACTIVE",
          },
        ],
      ],
    };

    if (updateHandler) {
      updateHandler(JSON.stringify(updatedSession));
    }

    await waitFor(() => {
      expect(screen.getByText("NewPlayer1")).toBeInTheDocument();
      expect(screen.getByText("NewPlayer3")).toBeInTheDocument();
    });
  });

  it("copies lobby link to clipboard when copy button is clicked", async () => {
    const user = userEvent.setup();
    render(<RoomLobby soundFXVolume={50}/>);

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    const linkIcons = screen.getAllByAltText("Link");
    await user.click(linkIcons[0]);

    const copyButton = screen.getByText("copy");
    await user.click(copyButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("link-copied", "notification");
    });
  });
});
