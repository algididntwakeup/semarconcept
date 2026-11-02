import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';

const TestConsumer: React.FC = () => {
  const { theme, resolvedTheme, isDarkMode, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolvedTheme">{resolvedTheme}</span>
      <span data-testid="isDarkMode">{isDarkMode ? 'dark-active' : 'light-active'}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
};

describe('ThemeContext and ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.body.className = '';
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.body.className = '';
  });

  it('initializes with default light theme when no preference is saved', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(screen.getByTestId('resolvedTheme').textContent).toBe('light');
    expect(screen.getByTestId('isDarkMode').textContent).toBe('light-active');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles theme between light and dark', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('isDarkMode').textContent).toBe('light-active');

    fireEvent.click(screen.getByText('Toggle Theme'));

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('resolvedTheme').textContent).toBe('dark');
    expect(screen.getByTestId('isDarkMode').textContent).toBe('dark-active');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.body.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    // Toggle back to light
    fireEvent.click(screen.getByText('Toggle Theme'));

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(screen.getByTestId('resolvedTheme').textContent).toBe('light');
    expect(screen.getByTestId('isDarkMode').textContent).toBe('light-active');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.body.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('sets dark mode directly via setTheme', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set Dark'));

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('reads initial theme from localStorage if available', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('isDarkMode').textContent).toBe('dark-active');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

