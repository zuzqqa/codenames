import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import JoinGame from "./JoinGame";
import { io } from "socket.io-client";
import * as utils from "../../shared/utils.tsx";

const mockOn = vi.fn();
const mockDisconnect = vi.fn();

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: mockOn,
    disconnect: mockDisconnect,
  })),
}));

vi.mock("../../shared/utils.tsx", () => ({
  getCookie: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("../../config/api.tsx", () => ({
  apiUrl: "http://localhost:8080",
  socketUrl: "http://localhost:8080",
}));

vi.mock("../../containers/Background/Background", () => ({
  default: ({ children }: any) => <div data-testid="background">{children}</div>,
}));

vi.mock("../../components/Button/Button.tsx", () => ({
  default: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock("../../components/GameTitleBar/GameTitleBar.tsx", () => ({
  default: () => <div data-testid="game-title-bar">Game Title Bar</div>,
}));

vi.mock("../../components/GameList/GameList.tsx", () => ({
  default: ({ filteredSessions }: any) => (
    <div data-testid="game-list">
      {filteredSessions.map((session: any) => (
        <div key={session.sessionId}>{session.gameName}</div>
      ))}
    </div>
  ),
}));

vi.mock("../../components/SettingsOverlay/SettingsModal.tsx", () => ({
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="settings-modal">
        <button onClick={onClose}>Close Settings</button>
      </div>
    ) : null,
}));

vi.mock("../../components/UserProfileOverlay/ProfileModal.tsx", () => ({
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="profile-modal">
        <button onClick={onClose}>Close Profile</button>
      </div>
    ) : null,
}));

vi.mock("../../containers/UsernameContainer/UsernameContainer.tsx", () => ({
  default: () => <div data-testid="username-container">Username</div>,
}));

describe("JoinGame", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              status: "CREATED",
              sessionId: "session1",
              gameName: "Game 1",
              maxPlayers: 4,
              password: "",
              currentRedTeamPlayers: 1,
              currentBlueTeamPlayers: 1,
            },
            {
              status: "IN_PROGRESS",
              sessionId: "session2",
              gameName: "Game 2",
              maxPlayers: 4,
              password: "",
              currentRedTeamPlayers: 2,
              currentBlueTeamPlayers: 2,
            },
            {
              status: "CREATED",
              sessionId: "session3",
              gameName: "Game 3",
              maxPlayers: 6,
              password: "pass123",
              currentRedTeamPlayers: 0,
              currentBlueTeamPlayers: 1,
            },
          ]),
      })
    ) as any;

    Storage.prototype.getItem = vi.fn((key) => {
      if (key === "musicVolume") return "50";
      return null;
    });
    Storage.prototype.setItem = vi.fn();

    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });

    vi.mocked(utils.getCookie).mockReturnValue("test-token");
  });

  it("renders all basic elements", async () => {
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(screen.getByTestId("background")).toBeInTheDocument();
    expect(screen.getByTestId("game-title-bar")).toBeInTheDocument();
    expect(screen.getByTestId("username-container")).toBeInTheDocument();
    expect(screen.getByAltText("Settings")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("game-list")).toBeInTheDocument();
    });
  });

  it("fetches game sessions on mount", async () => {
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/game-session/all"
      );
    });
  });

  it("filters only CREATED game sessions", async () => {
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Game 1")).toBeInTheDocument();
      expect(screen.getByText("Game 3")).toBeInTheDocument();
      expect(screen.queryByText("Game 2")).not.toBeInTheDocument();
    });
  });

  it("opens settings modal when settings button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const settingsButton = screen.getByAltText("Settings");
    await user.click(settingsButton.closest("button")!);

    await waitFor(() => {
      expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
    });
  });

  it("closes settings modal when close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const settingsButton = screen.getByAltText("Settings");
    await user.click(settingsButton.closest("button")!);

    await waitFor(() => {
      expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Close Settings"));

    await waitFor(() => {
      expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();
    });
  });

  it("saves music volume to localStorage", () => {
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(localStorage.setItem).toHaveBeenCalledWith("musicVolume", "50");
  });

  it("connects to socket.io on mount", () => {
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(io).toHaveBeenCalledWith("http://localhost:8080/game", {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  });

  it("listens for gameSessionsList socket events", () => {
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(mockOn).toHaveBeenCalledWith("gameSessionsList", expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith("connect_error", expect.any(Function));
  });

  it("updates game sessions when socket emits gameSessionsList", async () => {
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const gameSessionsListCall = mockOn.mock.calls.find(
      (call) => call[0] === "gameSessionsList"
    );

    expect(gameSessionsListCall).toBeDefined();
    const gameSessionsListCallback = gameSessionsListCall![1];

    const updatedSessions = [
      {
        status: "CREATED",
        sessionId: "session4",
        gameName: "Updated Game",
        maxPlayers: 4,
        password: "",
        currentRedTeamPlayers: 1,
        currentBlueTeamPlayers: 1,
      },
    ];

    gameSessionsListCallback(JSON.stringify(updatedSessions));

    await waitFor(() => {
      expect(screen.getByText("Updated Game")).toBeInTheDocument();
    });
  });

  it("disconnects socket on unmount", () => {
    const { unmount } = render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("fetches guest status on mount", async () => {
    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/api/game-session/all")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes("/is-guest")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(false),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    }) as any;

    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/users/is-guest",
        expect.objectContaining({
          method: "GET",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
        })
      );
    });
  });

  it("shows profile button when user is not a guest", async () => {
    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/api/game-session/all")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes("/is-guest")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(false),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    }) as any;

    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByAltText("Profile")).toBeInTheDocument();
    });
  });

  it("does not show profile button when user is a guest", async () => {
    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/api/game-session/all")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes("/is-guest")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(true),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    }) as any;

    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/users/is-guest",
        expect.any(Object)
      );
    });

    expect(screen.queryByAltText("Profile")).not.toBeInTheDocument();
  });

  it("opens profile modal when profile button is clicked", async () => {
    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/api/game-session/all")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes("/is-guest")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(false),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    }) as any;

    const user = userEvent.setup();
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByAltText("Profile")).toBeInTheDocument();
    });

    const profileButton = screen.getByAltText("Profile");
    await user.click(profileButton);

    await waitFor(() => {
      expect(screen.getByTestId("profile-modal")).toBeInTheDocument();
    });
  });

  it("closes profile modal when close button is clicked", async () => {
    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/api/game-session/all")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes("/is-guest")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(false),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    }) as any;

    const user = userEvent.setup();
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByAltText("Profile")).toBeInTheDocument();
    });

    const profileButton = screen.getByAltText("Profile");
    await user.click(profileButton);

    await waitFor(() => {
      expect(screen.getByTestId("profile-modal")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Close Profile"));

    await waitFor(() => {
      expect(screen.queryByTestId("profile-modal")).not.toBeInTheDocument();
    });
  });

  it("shows logout button when user is logged in", () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "loggedIn=true",
    });

    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(screen.getByAltText("Logout")).toBeInTheDocument();
  });

  it("calls logout when logout button is clicked", async () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "loggedIn=true",
    });

    const user = userEvent.setup();
    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const logoutBtn = screen.getByAltText("Logout");
    await user.click(logoutBtn);

    expect(utils.logout).toHaveBeenCalled();
  });

  it("handles fetch error gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
    });

    globalThis.fetch = vi.fn(() => Promise.reject(new Error("Network error"))) as any;

    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching game sessions:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("handles invalid JSON in socket gameSessionsList event", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
    });

    render(
      <JoinGame
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const gameSessionsListCall = mockOn.mock.calls.find(
      (call) => call[0] === "gameSessionsList"
    );

    expect(gameSessionsListCall).toBeDefined();
    const gameSessionsListCallback = gameSessionsListCall![1];

    gameSessionsListCallback("invalid json");

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error parsing gameSessionsList JSON:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});