'use client'
import { createContext, useContext, useState, useEffect } from 'react';

// Create theme context
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Use state to track current theme
  const [theme, setTheme] = useState('dark');
  
  // Toggle between dark and light themes
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // Apply theme to document when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Optionally store theme preference in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Load saved theme preference on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  return useContext(ThemeContext);
} 