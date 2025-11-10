import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateGameForm from "./CreateGameForm";

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
vi.mock("../Toast/ToastContext.tsx", () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

vi.mock("../../shared/utils.tsx", () => ({
  getUserId: vi.fn(() => Promise.resolve("user-123")),
}));

vi.mock("../../config/api.tsx", () => ({
  apiUrl: "http://localhost:8080",
}));

vi.mock("../../containers/RoomMenu/RoomMenu.tsx", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("CreateGameForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ gameId: "game-123" }),
      })
    ) as any;

    Storage.prototype.setItem = vi.fn();
  });

  it("renders form with all fields", () => {
    render(<CreateGameForm soundFXVolume={50}/>);

    expect(screen.getByPlaceholderText("game-name")).toBeInTheDocument();
    expect(screen.getByText("private-lobby?")).toBeInTheDocument();
    expect(screen.getByText("slots:")).toBeInTheDocument();
    expect(screen.getByText("deck-language:")).toBeInTheDocument();
  });

  it("shows password field when private lobby is enabled", async () => {
    const user = userEvent.setup();
    render(<CreateGameForm soundFXVolume={50}/>);

    const checkboxes = screen.getAllByAltText("Checkmark");
    await user.click(checkboxes[0]);

    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    expect(passwordInput).toBeVisible();
  });

  it("changes player slider value", () => {
    render(<CreateGameForm soundFXVolume={50}/>);

    const slider = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "8" } });

    expect(slider.value).toBe("8");
  });

  it("shows error when game name is empty", async () => {
    const user = userEvent.setup();
    render(<CreateGameForm soundFXVolume={50}/>);

    const submitButton = screen.getByRole("button", {
      name: /create-game-button/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("game-name-required", "error");
    });
  });

  it("shows error when private lobby has no password", async () => {
    const user = userEvent.setup();
    render(<CreateGameForm soundFXVolume={50}/>);

    const gameNameInput = screen.getByPlaceholderText("game-name");
    await user.type(gameNameInput, "Test Game");

    const checkboxes = screen.getAllByAltText("Checkmark");
    await user.click(checkboxes[0]);

    const submitButton = screen.getByRole("button", {
      name: /create-game-button/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "private-lobby-password-error",
        "error"
      );
    });
  });

  it("creates game successfully and navigates to lobby", async () => {
    const user = userEvent.setup();
    render(<CreateGameForm soundFXVolume={50}/>);

    const gameNameInput = screen.getByPlaceholderText("game-name");
    await user.type(gameNameInput, "Test Game");

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "6" } });

    const submitButton = screen.getByRole("button", {
      name: /create-game-button/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/game-session/create-game",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameName: "Test Game",
            maxPlayers: 6,
            password: "",
            language: "pl",
          }),
        })
      );
    });

    expect(sessionStorage.setItem).toHaveBeenCalledWith("gameId", "game-123");
    expect(mockNavigate).toHaveBeenCalledWith("/game-lobby");
  });

  it("creates private game with password", async () => {
    const user = userEvent.setup();
    render(<CreateGameForm soundFXVolume={50}/>);

    const gameNameInput = screen.getByPlaceholderText("game-name");
    await user.type(gameNameInput, "Private Game");

    const checkboxes = screen.getAllByAltText("Checkmark");
    await user.click(checkboxes[0]);

    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    await user.type(passwordInput, "secret123");

    const submitButton = screen.getByRole("button", {
      name: /create-game-button/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/game-session/create-game",
        expect.objectContaining({
          body: JSON.stringify({
            gameName: "Private Game",
            maxPlayers: 4,
            password: "secret123",
            language: "pl",
          }),
        })
      );
    });
  });

  it("shows error when API request fails", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as any;

    const user = userEvent.setup();
    render(<CreateGameForm soundFXVolume={50}/>);

    const gameNameInput = screen.getByPlaceholderText("game-name");
    await user.type(gameNameInput, "Test Game");

    const submitButton = screen.getByRole("button", {
      name: /create-game-button/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "Failed to create game session",
        "error"
      );
    });
  });

  it("shows error on network failure", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.reject(new Error("Network error"))
    ) as any;

    const user = userEvent.setup();
    render(<CreateGameForm soundFXVolume={50}/>);

    const gameNameInput = screen.getByPlaceholderText("game-name");
    await user.type(gameNameInput, "Test Game");

    const submitButton = screen.getByRole("button", {
      name: /create-game-button/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Network error", "error");
    });
  });

  it("navigates back when back button is clicked", async () => {
    const user = userEvent.setup();
    render(<CreateGameForm soundFXVolume={50}/>);

    const backButton = screen.getByAltText("Back");
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/games");
  });
});
