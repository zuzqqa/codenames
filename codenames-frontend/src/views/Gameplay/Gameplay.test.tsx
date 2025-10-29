import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Gameplay from "./Gameplay";
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

vi.mock("../../shared/utils.tsx", () => ({
  getUserId: vi.fn(() => Promise.resolve("user-123")),
}));

vi.mock("../../config/api.tsx", () => ({
  apiUrl: "http://localhost:8080",
  socketUrl: "http://localhost:3000",
}));

vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(() => "test-token"),
  },
}));

vi.mock("../../containers/Background/Background", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../components/Button/Button", () => ({
  default: ({ children, onClick, className, disabled }: any) => (
    <button onClick={onClick} className={className} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("../../components/SettingsOverlay/SettingsModal", () => ({
  default: ({ isOpen }: any) => (isOpen ? <div>Settings Modal</div> : null),
}));

vi.mock("../../components/QuitModal/QuitModal", () => ({
  default: ({ isOpen, children }: any) =>
    isOpen ? <div>Quit Modal {children}</div> : null,
}));

vi.mock("../../components/Chat/Chat.tsx", () => ({
  default: () => <div>Chat Component</div>,
}));

vi.mock("../../components/AudioRoom/AudioRoom.tsx", () => ({
  default: () => <div>Audio Room</div>,
}));

describe("Gameplay", () => {
  const mockGameSession = {
    status: "IN_PROGRESS",
    sessionId: "game-123",
    gameName: "Test Game",
    maxPlayers: 8,
    durationOfTheRound: "300",
    timeForAHint: "60",
    timeForGuessing: "120",
    voiceChatEnabled: false,
    connectedUsers: [
      [
        { id: "user-123", username: "Player1" },
        { id: "user-2", username: "Player2" },
      ],
      [
        { id: "user-3", username: "Player3" },
        { id: "user-4", username: "Player4" },
      ],
    ],
    gameState: {
      blueTeamLeader: { id: "user-3", username: "Player3" },
      redTeamLeader: { id: "user-123", username: "Player1" },
      currentSelectionLeader: { id: "user-123", username: "Player1" },
      blueTeamScore: 2,
      redTeamScore: 3,
      teamTurn: 0,
      hint: "ANIMALS",
      hintNumber: "3",
      initialHintNumber: "3",
      cards: Array(25).fill("WORD"),
      cardsColors: Array(25).fill(0),
      cardsChosen: [],
      hintTurn: true,
      guessingTurn: false,
      selectionTurn: false,
      cardsVotes: Array(25).fill(0),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/full")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGameSession),
        });
      }
      if (url.includes("/get-username")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("TestUser"),
        });
      }
      if (url.includes("/vote-cards")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("Vote submitted successfully"),
        });
      }
      if (url.includes("/reveal-card")) {
        return Promise.resolve({
          ok: true,
        });
      }
      if (url.includes("/change-turn")) {
        return Promise.resolve({
          ok: true,
        });
      }
      if (url.includes("/send-hint")) {
        return Promise.resolve({
          ok: true,
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as any;

    Storage.prototype.getItem = vi.fn((key) => {
      if (key === "gameId") return "game-123";
      if (key === "musicVolume") return "50";
      if (key === "userId") return "user-123";
      return null;
    });
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();

    class AudioMock {
      play = vi.fn();
      pause = vi.fn();
      volume = 0;
      currentTime = 0;
    }

    globalThis.Audio = AudioMock as any;
  });

  it("renders game board with cards", async () => {
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      const cards = screen.getAllByAltText(/card-/);
      expect(cards.length).toBe(25);
    });
  });

  it("displays team scores", async () => {
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/3 \/ 9/)).toBeInTheDocument();
      expect(screen.getByText(/2 \/ 8/)).toBeInTheDocument();
    });
  });

  it("displays current hint and hint number", async () => {
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/ANIMALS/)).toBeInTheDocument();
      expect(screen.getByText(/3\/3/)).toBeInTheDocument();
    });
  });

  it("connects to game socket on mount", async () => {
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(io).toHaveBeenCalledWith(
        "http://localhost:3000/game",
        expect.objectContaining({
          transports: ["websocket", "polling"],
        })
      );
    });
  });

  it("joins game room on socket connect", async () => {
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

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

    expect(mockSocket.emit).toHaveBeenCalledWith("joinGame", "game-123");
  });

  it("updates game state when receiving gameSessionData from socket", async () => {
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith(
        "gameSessionData",
        expect.any(Function)
      );
    });

    const updatedSession = {
      ...mockGameSession,
      gameState: {
        ...mockGameSession.gameState,
        hint: "NEWTHEME",
        hintNumber: "5",
      },
    };

    const dataHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "gameSessionData"
    )?.[1];

    if (dataHandler) {
      dataHandler(JSON.stringify(updatedSession));
    }

    await waitFor(() => {
      expect(screen.getByText(/NEWTHEME/)).toBeInTheDocument();
    });
  });

  it("shows toast when user disconnects", async () => {
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith(
        "disconnectUser",
        expect.any(Function)
      );
    });

    const disconnectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "disconnectUser"
    )?.[1];

    if (disconnectHandler) {
      disconnectHandler("user-999");
    }

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("user-disconnected", "error");
    });
  });

  it("sends card vote when non-leader selects card during guessing", async () => {
    const guessingSession = {
      ...mockGameSession,
      connectedUsers: [
        [
          { id: "user-123", username: "Player1" },
          { id: "user-2", username: "Player2" }, // user-2 będzie red team leaderem
        ],
        [
          { id: "user-3", username: "Player3" },
          { id: "user-4", username: "Player4" }, // user-4 będzie current selection leaderem
        ],
      ],
      gameState: {
        ...mockGameSession.gameState,
        blueTeamLeader: { id: "user-3", username: "Player3" },
        redTeamLeader: { id: "user-2", username: "Player2" }, // NIE user-123
        currentSelectionLeader: { id: "user-4", username: "Player4" }, // ktoś z drużyny
        hintTurn: false,
        guessingTurn: true,
      },
    };

    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/full")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(guessingSession),
        });
      }
      if (url.includes("/get-username")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("TestUser"),
        });
      }
      if (url.includes("/vote-cards")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("Vote submitted successfully"),
        });
      }
      return Promise.resolve({ ok: true });
    }) as any;

    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      const cards = screen.getAllByAltText(/card-/);
      expect(cards.length).toBe(25);
    });

    const cards = screen.getAllByAltText(/card-/);
    await user.click(cards[0]);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/vote-cards"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            addingVote: true,
            cardIndex: 0,
          }),
        })
      );
    });
  });

  it("opens hint modal when leader clicks on codename card during hint time", async () => {
    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("ANIMALS")).toBeInTheDocument();
    });

    const codenameContainer = document.querySelector(
      ".codename-card-container"
    );
    await user.click(codenameContainer!);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("enter-the-codename")
      ).toBeInTheDocument();
    });
  });

  it("increments hint number when + button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("ANIMALS")).toBeInTheDocument();
    });

    const codenameContainer = document.querySelector(
      ".codename-card-container"
    );
    await user.click(codenameContainer!);

    await waitFor(() => {
      expect(screen.getByText("+")).toBeInTheDocument();
    });

    expect(screen.getByText("1")).toBeInTheDocument();

    const plusButton = screen.getByText("+");
    await user.click(plusButton);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("decrements hint number when - button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("ANIMALS")).toBeInTheDocument();
    });

    const codenameContainer = document.querySelector(
      ".codename-card-container"
    );
    await user.click(codenameContainer!);

    await waitFor(() => {
      expect(screen.getByText("+")).toBeInTheDocument();
    });

    const plusButton = screen.getByText("+");
    await user.click(plusButton);
    await user.click(plusButton);

    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    const minusButton = screen.getByText("-");
    await user.click(minusButton);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("closes hint modal when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("ANIMALS")).toBeInTheDocument();
    });

    const codenameContainer = document.querySelector(
      ".codename-card-container"
    );
    await user.click(codenameContainer!);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("enter-the-codename")
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByText("cancel-button");
    await user.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("enter-the-codename")
      ).not.toBeInTheDocument();
    });
  });

  it("sends hint when Enter key is pressed", async () => {
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("ANIMALS")).toBeInTheDocument();
    });

    const codenameContainer = document.querySelector(
      ".codename-card-container"
    );
    fireEvent.click(codenameContainer!);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("enter-the-codename")
      ).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("enter-the-codename");
    fireEvent.change(input, { target: { value: "OCEAN" } });

    fireEvent.keyDown(document, { key: "Enter" });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/send-hint"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  it("closes hint modal when Escape key is pressed", async () => {
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("ANIMALS")).toBeInTheDocument();
    });

    const codenameContainer = document.querySelector(
      ".codename-card-container"
    );
    fireEvent.click(codenameContainer!);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("enter-the-codename")
      ).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("enter-the-codename")
      ).not.toBeInTheDocument();
    });
  });

  it("navigates to /games if no gameId in sessionStorage", () => {
    Storage.prototype.getItem = vi.fn(() => null);

    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(mockNavigate).toHaveBeenCalledWith("/games");
  });

  it("calls changeTurn when end round button is clicked", async () => {
    const guessingSession = {
      ...mockGameSession,
      gameState: {
        ...mockGameSession.gameState,
        hintTurn: false,
        guessingTurn: true,
        currentSelectionLeader: { id: "user-123", username: "Player1" },
      },
    };

    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/full")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(guessingSession),
        });
      }
      if (url.includes("/get-username")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("TestUser"),
        });
      }
      if (url.includes("/change-turn")) {
        return Promise.resolve({
          ok: true,
        });
      }
      return Promise.resolve({ ok: true });
    }) as any;

    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(
      () => {
        expect(screen.getByText("pass-round")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const endRoundButton = screen.getByText("pass-round");
    await user.click(endRoundButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/change-turn"),
        expect.objectContaining({
          method: "GET",
        })
      );
    });
  });

  it("opens settings modal when settings button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const settingsButton = screen.getByAltText("Settings");
    await user.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText("Settings Modal")).toBeInTheDocument();
    });
  });

  it("opens quit modal when logout button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const logoutButton = screen.getByAltText("Home");
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText(/Quit Modal/)).toBeInTheDocument();
    });
  });

  it("disconnects user and navigates when confirmed in quit modal", async () => {
    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const logoutButton = screen.getByAltText("Home");
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("yes")).toBeInTheDocument();
    });

    const yesButton = screen.getByText("yes");
    await user.click(yesButton);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith(
        "disconnectUser",
        "user-123",
        "game-123"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/games");
    });
  });

  it("closes quit modal when no button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const logoutButton = screen.getByAltText("Home");
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText("no")).toBeInTheDocument();
    });

    const noButton = screen.getByText("no");
    await user.click(noButton);

    await waitFor(() => {
      expect(screen.queryByText(/Quit Modal/)).not.toBeInTheDocument();
    });
  });

  it("navigates to win/loss when red team reaches 9 points", async () => {
    const winningGameSession = {
      ...mockGameSession,
      gameState: {
        ...mockGameSession.gameState,
        redTeamScore: 9,
      },
    };

    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/full")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(winningGameSession),
        });
      }
      if (url.includes("/get-username")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("TestUser"),
        });
      }
      return Promise.resolve({ ok: true });
    }) as any;

    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith(
          "/win-loss",
          expect.objectContaining({
            state: { result: "Victory" },
          })
        );
      },
      { timeout: 4000 }
    );
  });

  it("navigates to win/loss when blue team reaches 8 points", async () => {
    const winningGameSession = {
      ...mockGameSession,
      connectedUsers: [
        [
          { id: "user-2", username: "Player2" },
          { id: "user-5", username: "Player5" },
        ],
        [
          { id: "user-123", username: "Player1" },
          { id: "user-4", username: "Player4" },
        ],
      ],
      gameState: {
        ...mockGameSession.gameState,
        blueTeamScore: 8,
      },
    };

    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/full")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(winningGameSession),
        });
      }
      if (url.includes("/get-username")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("TestUser"),
        });
      }
      return Promise.resolve({ ok: true });
    }) as any;

    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith(
          "/win-loss",
          expect.objectContaining({
            state: { result: "Victory" },
          })
        );
      },
      { timeout: 4000 }
    );
  });

  it("shows error when hint has multiple words", async () => {
    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("ANIMALS")).toBeInTheDocument();
    });

    const codenameContainer = document.querySelector(
      ".codename-card-container"
    );
    await user.click(codenameContainer!);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("enter-the-codename")
      ).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("enter-the-codename");
    await user.type(input, "TWO WORDS");

    const confirmButton = screen.getByText("confirm-button");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("hint-one-word", "error");
    });
  });

  it("renders chat component", async () => {
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Chat Component")).toBeInTheDocument();
    });
  });

  it("displays logged in username", async () => {
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/logged-in-as/)).toBeInTheDocument();
      expect(screen.getByText(/TestUser/)).toBeInTheDocument();
    });
  });

  it("saves music volume to localStorage when changed", async () => {
    const setVolumeMock = vi.fn();
    render(
      <Gameplay
        setVolume={setVolumeMock}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("musicVolume", "50");
    });
  });

  it("reveals card when current leader clicks on it during selection turn", async () => {
    const selectionSession = {
      ...mockGameSession,
      connectedUsers: [
        [
          { id: "user-123", username: "Player1" },
          { id: "user-2", username: "Player2" },
        ],
        [
          { id: "user-3", username: "Player3" },
          { id: "user-4", username: "Player4" },
        ],
      ],
      gameState: {
        ...mockGameSession.gameState,
        blueTeamLeader: { id: "user-3", username: "Player3" },
        redTeamLeader: { id: "user-2", username: "Player2" },
        currentSelectionLeader: { id: "user-123", username: "Player1" },
        hintTurn: false,
        guessingTurn: true,
        selectionTurn: true,
      },
    };

    globalThis.fetch = vi.fn((url) => {
      if (url.includes("/full")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(selectionSession),
        });
      }
      if (url.includes("/get-username")) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("TestUser"),
        });
      }
      if (url.includes("/reveal-card")) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true });
    }) as any;

    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      const cards = screen.getAllByAltText(/card-/);
      expect(cards.length).toBe(25);
    });

    const cards = screen.getAllByAltText(/card-/);
    await user.click(cards[5]);

    await waitFor(
      () => {
        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/reveal-card"),
          expect.objectContaining({
            method: "POST",
            body: "5",
          })
        );
      },
      { timeout: 3000 }
    );
  });

  it("limits hint number to max remaining cards for red team", async () => {
    const user = userEvent.setup();
    render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("ANIMALS")).toBeInTheDocument();
    });

    const codenameContainer = document.querySelector(
      ".codename-card-container"
    );
    await user.click(codenameContainer!);

    await waitFor(() => {
      expect(screen.getByText("+")).toBeInTheDocument();
    });

    const plusButton = screen.getByText("+");

    for (let i = 0; i < 10; i++) {
      await user.click(plusButton);
    }

    await waitFor(() => {
      expect(screen.getByText("6")).toBeInTheDocument();
    });
  });

  it("disconnects socket on component unmount", async () => {
    const { unmount } = render(
      <Gameplay
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(io).toHaveBeenCalled();
    });

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
