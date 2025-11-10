import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn(() => ({
  search: "",
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
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

vi.mock("../../config/api.tsx", () => ({
  apiUrl: "http://localhost:8080",
  secure: false,
}));

vi.mock("../../shared/utils.tsx", () => ({
  logout: vi.fn(),
}));

vi.mock("../../components/GoogleAuthentication/GoogleLoginButton.tsx", () => ({
  default: () => <div>Google Login Button</div>,
}));

vi.mock("../../containers/Background/Background", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../components/Button/Button", () => ({
  default: ({ children, onClick, type, variant }: any) => (
    <button onClick={onClick} type={type} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock("../../components/FormInput/FormInput", () => ({
  default: ({ value, onChange, placeholder, type, button }: any) => (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {button}
    </div>
  ),
}));

vi.mock("../../components/Title/Title", () => ({
  default: ({ children }: any) => <h1>{children}</h1>,
}));

vi.mock("../../components/GameTitleBar/GameTitleBar.tsx", () => ({
  default: () => <div>Game Title Bar</div>,
}));

vi.mock("../../components/SettingsOverlay/SettingsModal.tsx", () => ({
  default: ({ isOpen }: any) => (isOpen ? <div>Settings Modal</div> : null),
}));

vi.mock("../../containers/LoginRegister/LoginRegister.tsx", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../Home/Home.tsx", () => ({
  createGuestUser: vi.fn(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ search: "" });

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: "test-token" }),
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

    delete (window as any).location;
    (window as any).location = { href: "" };
  });

  it("renders login form with all elements", () => {
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText("LOGIN")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("PASSWORD")).toBeInTheDocument();
    expect(screen.getByText("submit-button")).toBeInTheDocument();
    expect(screen.getByText("forgot-password-text")).toBeInTheDocument();
    expect(screen.getByText("dont-have-an-account")).toBeInTheDocument();
    expect(screen.getByText("or-continue-as-guset")).toBeInTheDocument();
  });

  it("updates login input when user types", async () => {
    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const loginInput = screen.getByPlaceholderText("LOGIN");
    await user.clear(loginInput);
    await user.type(loginInput, "testuser");

    expect(loginInput).toHaveValue("testuser");
  });

  it("updates password input when user types", async () => {
    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    await user.type(passwordInput, "password123");

    expect(passwordInput).toHaveValue("●●●●●●●●●●●");
  });

  it("toggles password visibility when eye button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    await user.type(passwordInput, "test123");

    const eyeButton = screen.getByAltText("Show password");
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByAltText("Hide password")).toBeInTheDocument();
    });

    expect(passwordInput).toHaveValue("test123");
  });

  it("submits form with valid credentials and redirects", async () => {
    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const loginInput = screen.getByPlaceholderText("LOGIN");
    const passwordInput = screen.getByPlaceholderText("PASSWORD");

    await user.clear(loginInput);
    await user.clear(passwordInput);
    await user.type(loginInput, "testuser");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByText("submit-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/users/authenticate",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "testuser",
            password: "password123",
          }),
        })
      );
    });

    expect(window.location.href).toBe("/games");
  });

  it("shows error toast when login fails with invalid credentials", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Invalid credentials" }),
      })
    ) as any;

    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("LOGIN"), "wronguser");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "wrongpass");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "invalid-login-or-password",
        "error"
      );
    });
  });

  it("shows error toast when account is not activated", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            error: "Account is not active. Please check your email.",
          }),
      })
    ) as any;

    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("LOGIN"), "inactiveuser");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "password123");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "account-not-activated",
        "error"
      );
    });
  });

  it("shows generic error toast when server error occurs", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      })
    ) as any;

    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("LOGIN"), "testuser");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "password123");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("login-failed", "error");
    });
  });

  it("navigates to register page when register link is clicked", async () => {
    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.click(screen.getByText("dont-have-an-account"));
    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  it("navigates to reset password page when forgot password link is clicked", async () => {
    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.click(screen.getByText("forgot-password-text"));
    expect(mockNavigate).toHaveBeenCalledWith("/send-reset-password");
  });

  it("navigates to home when back button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const backButton = screen.getByAltText("Back");
    await user.click(backButton.closest("button")!);

    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("opens settings modal when settings button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const settingsButton = screen.getByAltText("Settings");
    await user.click(settingsButton.closest("button")!);

    await waitFor(() => {
      expect(screen.getByText("Settings Modal")).toBeInTheDocument();
    });
  });

  it("saves music volume to localStorage when changed", () => {
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(localStorage.setItem).toHaveBeenCalledWith("musicVolume", "50");
  });

  it("creates guest user when guest link is clicked", async () => {
    const { createGuestUser } = await import("../Home/Home.tsx");
    const user = userEvent.setup();

    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.click(screen.getByText("or-continue-as-guset"));

    expect(createGuestUser).toHaveBeenCalledWith(
      "http://localhost:8080",
      false
    );
  });

  it("renders Google login button", () => {
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(screen.getByText("Google Login Button")).toBeInTheDocument();
  });

  it("pre-fills login when username is in URL params", () => {
    mockUseLocation.mockReturnValue({
      search: "?username=testuser&activated=true",
    });

    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const loginInput = screen.getByPlaceholderText("LOGIN");
    expect(loginInput).toHaveValue("testuser");
  });

  it("shows logout button when user is logged in", () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "loggedIn=true",
    });

    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(screen.getByAltText("Logout")).toBeInTheDocument();
  });

  it("calls logout function when logout button is clicked", async () => {
    const { logout } = await import("../../shared/utils.tsx");
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "loggedIn=true",
    });

    const user = userEvent.setup();
    render(
      <LoginPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const logoutBtn = screen.getByAltText("Logout");
    await user.click(logoutBtn);

    expect(logout).toHaveBeenCalled();
  });
});
