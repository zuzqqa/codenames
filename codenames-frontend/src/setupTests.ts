import "@testing-library/jest-dom";
import { vi } from "vitest";

class AudioMock {
  play = vi.fn();
  pause = vi.fn();
}

Object.defineProperty(window, "Audio", {
  writable: true,
  value: AudioMock,
});
