import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameList from "./GameList";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../config/api.tsx", () => ({
  apiUrl: "http://localhost:8080",
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

enum SessionStatus {
  CREATED = "CREATED",
  LEADER_SELECTION = "LEADER_SELECTION",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

interface GameSessionJoinGameDTO {
  status: SessionStatus;
  sessionId: string;
  gameName: string;
  maxPlayers: number;
  password: string;
  currentRedTeamPlayers: number;
  currentBlueTeamPlayers: number;
}

describe("GameList", () => {
  const mockGameSessions: GameSessionJoinGameDTO[] = [
    {
      sessionId: "session-1",
      gameName: "Test Game 1",
      maxPlayers: 8,
      password: "",
      currentRedTeamPlayers: 2,
      currentBlueTeamPlayers: 2,
      status: SessionStatus.CREATED,
    },
    {
      sessionId: "session-2",
      gameName: "Private Game",
      maxPlayers: 6,
      password: "secret123",
      currentRedTeamPlayers: 1,
      currentBlueTeamPlayers: 1,
      status: SessionStatus.CREATED,
    },
    {
      sessionId: "session-3",
      gameName: "Another Game",
      maxPlayers: 10,
      password: "",
      currentRedTeamPlayers: 3,
      currentBlueTeamPlayers: 2,
      status: SessionStatus.CREATED,
    },
  ];

  const mockSetFilteredSessions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(true),
      })
    ) as any;

    Storage.prototype.setItem = vi.fn();
    Storage.prototype.getItem = vi.fn();
  });

  it("renders list of game sessions", () => {
    render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={mockGameSessions}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    expect(screen.getByText("Test Game 1")).toBeInTheDocument();
    expect(screen.getByText("Private Game")).toBeInTheDocument();
    expect(screen.getByText("Another Game")).toBeInTheDocument();
  });

  it("displays player count for each session", () => {
    render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={mockGameSessions}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    expect(screen.getByText("Slots: 4/8")).toBeInTheDocument();
    expect(screen.getByText("Slots: 2/6")).toBeInTheDocument();
    expect(screen.getByText("Slots: 5/10")).toBeInTheDocument();
  });

  it("shows lock icon for password-protected sessions", () => {
    const { container } = render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={mockGameSessions}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    const lockIcons = container.querySelectorAll(".small-lock-icon");
    expect(lockIcons.length).toBe(1);
  });

  it("filters sessions based on search term", async () => {
    const user = userEvent.setup();
    render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={mockGameSessions}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "Private");

    expect(mockSetFilteredSessions).toHaveBeenCalled();
  });

  it("joins non-password session directly", async () => {
    const user = userEvent.setup();
    render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={mockGameSessions}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    await user.click(screen.getByText("Test Game 1"));

    expect(sessionStorage.setItem).toHaveBeenCalledWith("gameId", "session-1");
    expect(mockNavigate).toHaveBeenCalledWith("/game-lobby");
  });

  it("opens password overlay for password-protected session", async () => {
    const user = userEvent.setup();
    render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={mockGameSessions}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    await user.click(screen.getByText("Private Game"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("PASSWORD")).toBeInTheDocument();
    });
  });

  it("joins password-protected session with correct password", async () => {
    const user = userEvent.setup();
    render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={mockGameSessions}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    await user.click(screen.getByText("Private Game"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("PASSWORD")).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    await user.type(passwordInput, "secret123");

    const submitButton = screen.getByText("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/game-session/session-2/authenticate-password/secret123",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        })
      );
    });

    await waitFor(() => {
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        "gameId",
        "session-2"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/game-lobby");
    });
  });

  it("shows error toast with incorrect password", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(false),
      })
    ) as any;

    const user = userEvent.setup();
    render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={mockGameSessions}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    await user.click(screen.getByText("Private Game"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("PASSWORD")).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    await user.type(passwordInput, "wrongpassword");

    const submitButton = screen.getByText("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("incorrect-password")).toBeInTheDocument();
    });
  });

  it("closes password overlay when close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={mockGameSessions}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    await user.click(screen.getByText("Private Game"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("PASSWORD")).toBeInTheDocument();
    });

    const closeButton = screen.getByAltText("Close");
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("PASSWORD")).not.toBeInTheDocument();
    });
  });

  it("navigates back when back button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={mockGameSessions}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    const backButton = screen.getByAltText("Back");
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/games");
  });

  it("clears search and resets filtered sessions on search toggle", async () => {
    const user = userEvent.setup();
    render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={[mockGameSessions[0]]}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "test");
    await user.clear(searchInput);

    expect(mockSetFilteredSessions).toHaveBeenCalled();
  });

  it("renders empty list when no sessions match search", () => {
    render(
      <GameList
        soundFXVolume={50}
        gameSessions={mockGameSessions}
        filteredSessions={[]}
        setFilteredSessions={mockSetFilteredSessions}
      />
    );

    const listItems = screen.queryAllByRole("listitem");
    expect(listItems.length).toBe(0);
  });
});
