import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./RegisterPage";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
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
  frontendUrl: "http://localhost:5173",
  secure: false,
}));

vi.mock("../../shared/utils.tsx", () => ({
  logout: vi.fn(),
}));

vi.mock("../../utils/validation.tsx", () => ({
  validateEmail: vi.fn(() => true),
  validateUsername: vi.fn(() => true),
  validatePassword: vi.fn(() => true),
}));

vi.mock("js-cookie");

vi.mock("../../components/GoogleAuthentication/GoogleLoginButton.tsx", () => ({
  default: () => <div>Google Login Button</div>,
}));

vi.mock("../../containers/Background/Background", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../components/Button/Button.tsx", () => ({
  default: ({ children, onClick, type, variant }: any) => (
    <button onClick={onClick} type={type} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock("../../components/FormInput/FormInput.tsx", () => ({
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

vi.mock("../../components/Title/Title.tsx", () => ({
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

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ search: "" });

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as any;

    Storage.prototype.getItem = vi.fn((key) => {
      if (key === "musicVolume") return "50";
      if (key === "i18nextLng") return "en";
      return null;
    });
    Storage.prototype.setItem = vi.fn();

    vi.mocked(Cookies.get).mockReturnValue(undefined as any);
  });

  it("renders registration form with all elements", () => {
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText("E-MAIL")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("LOGIN")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("PASSWORD")).toBeInTheDocument();
    expect(screen.getByText("submit-button")).toBeInTheDocument();
    expect(screen.getByText("already-have-an-account")).toBeInTheDocument();
    expect(screen.getByText("or-continue-as-guset")).toBeInTheDocument();
  });

  it("updates email input when user types", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const emailInput = screen.getByPlaceholderText("E-MAIL");
    await user.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("updates login input when user types", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const loginInput = screen.getByPlaceholderText("LOGIN");
    await user.type(loginInput, "testuser");

    expect(loginInput).toHaveValue("testuser");
  });

  it("updates password input when user types", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    await user.type(passwordInput, "Password123!");

    expect(passwordInput).toHaveValue("●●●●●●●●●●●●");
  });

  it("toggles password visibility when eye button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    const passwordInput = screen.getByPlaceholderText("PASSWORD");
    await user.type(passwordInput, "Pass123!");

    const eyeButton = screen.getByAltText("Show password");
    await user.click(eyeButton);

    await waitFor(() => {
      expect(screen.getByAltText("Hide password")).toBeInTheDocument();
    });

    expect(passwordInput).toHaveValue("Pass123!");
  });

  it("shows error when email field is empty", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("LOGIN"), "testuser");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "Password123!");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("email-error-message", "error");
    });
  });

  it("shows error when username field is empty", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("E-MAIL"), "test@example.com");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "Password123!");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "username-error-message",
        "error"
      );
    });
  });

  it("shows error when password field is empty", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("E-MAIL"), "test@example.com");
    await user.type(screen.getByPlaceholderText("LOGIN"), "testuser");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "password-error-message",
        "error"
      );
    });
  });

  it("shows error when email format is invalid", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("E-MAIL"), "invalid-email");
    await user.type(screen.getByPlaceholderText("LOGIN"), "testuser");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "Password123!");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        t("email-error-message"),
        "error"
      );
    });
  });

  it("shows error when username contains special characters", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("E-MAIL"), "test@example.com");
    await user.type(screen.getByPlaceholderText("LOGIN"), "test@user!");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "Password123!");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        t("username-error-message"),
        "error"
      );
    });
  });

  it("shows error when password is too weak", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("E-MAIL"), "test@example.com");
    await user.type(screen.getByPlaceholderText("LOGIN"), "testuser");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "weak");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "Password must be 8+ chars, with upper, lower, number & special char.",
        "error"
      );
    });
  });

  it("submits form with valid data and shows success toast", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("E-MAIL"), "test@example.com");
    await user.type(screen.getByPlaceholderText("LOGIN"), "testuser");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "Password123!");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/users?language=en",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            username: "testuser",
            password: "Password123!",
            roles: "USER",
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "activation-link-sent",
        "notification"
      );
    });
  });

  it("shows error when username already exists", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Username already exists." }),
      })
    ) as any;

    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("E-MAIL"), "test@example.com");
    await user.type(screen.getByPlaceholderText("LOGIN"), "existinguser");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "Password123!");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "username-exists-error",
        "error"
      );
    });
  });

  it("shows error when email already exists", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "E-mail already exists." }),
      })
    ) as any;

    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(
      screen.getByPlaceholderText("E-MAIL"),
      "existing@example.com"
    );
    await user.type(screen.getByPlaceholderText("LOGIN"), "testuser");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "Password123!");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("e-mail-exists-error", "error");
    });
  });

  it("shows network error when fetch fails", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.reject(new Error("Network error"))
    ) as any;

    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("E-MAIL"), "test@example.com");
    await user.type(screen.getByPlaceholderText("LOGIN"), "testuser");
    await user.type(screen.getByPlaceholderText("PASSWORD"), "Password123!");
    await user.click(screen.getByText("submit-button"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("network-error", "error");
    });
  });

  it("navigates to login page when login link is clicked", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    await user.click(screen.getByText("already-have-an-account"));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("navigates to home when back button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <RegisterPage
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
      <RegisterPage
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

  it("saves music volume to localStorage", () => {
    render(
      <RegisterPage
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
      <RegisterPage
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
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(screen.getByText("Google Login Button")).toBeInTheDocument();
  });

  it("redirects to /games when user is already logged in", () => {
    vi.mocked(Cookies.get).mockImplementation(((key: string) => {
      if (key === "loggedIn") return "true";
      if (key === "authToken") return "test-token";
      return undefined;
    }) as any);

    render(
      <RegisterPage
        setVolume={vi.fn()}
        soundFXVolume={50}
        setSoundFXVolume={vi.fn()}
      />
    );

    expect(mockNavigate).toHaveBeenCalledWith("/games");
  });
});
