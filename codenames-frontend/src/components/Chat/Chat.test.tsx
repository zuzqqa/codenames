import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Chat from "./Chat";
import { io } from "socket.io-client";

vi.mock("socket.io-client", () => ({
  io: vi.fn(),
}));

vi.mock("i18next", () => ({
  t: (key: string) => key,
}));

vi.mock("react-cookie", () => ({
  useCookies: () => [{ authToken: "test-token" }],
}));

vi.mock("../../config/api.tsx", () => ({
  apiUrl: "http://localhost:8080",
  socketUrl: "http://localhost:3000",
}));

Element.prototype.scrollIntoView = vi.fn();

describe("Chat", () => {
  const mockSocket = {
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    id: "test-socket-id",
  };

  beforeEach(() => {
    (io as any).mockReturnValue(mockSocket);

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ username: "TestUser" }),
      })
    ) as any;

    Storage.prototype.getItem = vi.fn((key) => {
      if (key === "gameId") return "test-game-123";
      return null;
    });
    Storage.prototype.setItem = vi.fn();

    const localStorageMock: { [key: string]: string } = {};
    Storage.prototype.getItem = vi.fn((key) => {
      if (key === "gameId") return "test-game-123";
      return localStorageMock[key] || null;
    });
    Storage.prototype.setItem = vi.fn((key, value) => {
      localStorageMock[key] = value;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders chat input with placeholder", async () => {
    render(<Chat/>);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("enter-the-message")
      ).toBeInTheDocument();
    });
  });

  it("sends message when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<Chat/>);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("enter-the-message")
      ).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("enter-the-message");
    await user.type(input, "Test message{Enter}");

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith("chatMessage", {
        sender: "TestUser",
        content: "Test message",
        gameID: "test-game-123",
      });
    });
  });

  it("does not send empty messages", async () => {
    const user = userEvent.setup();
    render(<Chat/>);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("enter-the-message")
      ).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("enter-the-message");
    await user.type(input, "   {Enter}");

    expect(mockSocket.emit).not.toHaveBeenCalledWith(
      "chatMessage",
      expect.anything()
    );
  });

  it("displays incoming messages", async () => {
    render(<Chat/>);

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith(
        "chatMessage",
        expect.any(Function)
      );
    });

    const chatMessageHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "chatMessage"
    )?.[1];

    if (chatMessageHandler) {
      chatMessageHandler({
        sender: "OtherUser",
        content: "Hello from other user",
        gameID: "test-game-123",
      });
    }

    await waitFor(() => {
      expect(screen.getByText("Hello from other user")).toBeInTheDocument();
      expect(screen.getByText("OtherUser")).toBeInTheDocument();
    });
  });

  it("connects to socket on mount", async () => {
    render(<Chat/>);

    await waitFor(() => {
      expect(io).toHaveBeenCalledWith(
        "http://localhost:3000/chat",
        expect.objectContaining({
          transports: ["websocket", "polling"],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })
      );
    });
  });

  it("joins game room on socket connect", async () => {
    render(<Chat/>);

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

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith("joinGame", "test-game-123");
    });
  });

  it("adds focused class when input is focused", async () => {
    const user = userEvent.setup();
    render(<Chat/>);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("enter-the-message")
      ).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("enter-the-message");
    const container = input.closest(".chat-container");

    await user.click(input);

    expect(container).toHaveClass("focused");
  });

  it("clears message input after sending", async () => {
    const user = userEvent.setup();
    render(<Chat/>);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("enter-the-message")
      ).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(
      "enter-the-message"
    ) as HTMLInputElement;
    await user.type(input, "Test message{Enter}");

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });
});
