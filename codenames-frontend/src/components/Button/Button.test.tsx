import { render, screen } from '@testing-library/react';
import { it, expect, vi} from 'vitest';
import Button from './Button';
import userEvent from '@testing-library/user-event';

class AudioMock {
    play = vi.fn();
}

window.Audio = AudioMock as any;

it('renders button with child text',() => {
    render(<Button soundFXVolume={50}>test</Button>);
    expect(screen.getByText("test")).toBeInTheDocument();
})

it('applies correct variant class', () => {
    render(<Button soundFXVolume={50} variant='primary-1'>test</Button>);
    const button = screen.getByRole('button')
    expect(button).toHaveClass("btn-primary-1");
})

it('calls onClick handler when clicked', async () => {
    const clickHandle = vi.fn();
    const user = userEvent.setup();
    render(<Button soundFXVolume={50} onClick={clickHandle}>test</Button>);
    await user.click(screen.getByRole('button'));
    expect(clickHandle).toBeCalled();
})

it('plays sound when clicked', async () => {
    const user = userEvent.setup();
    const audioSpy = vi.spyOn(window as any, 'Audio');

    render(<Button soundFXVolume={50}>test</Button>);
    await user.click(screen.getByRole('button'));

    expect(audioSpy).toBeCalled();
    audioSpy.mockRestore();
})