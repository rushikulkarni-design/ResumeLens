import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(
      "resumelens-theme"
    );

    if (
      stored === "light" ||
      stored === "dark"
    ) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle(
      "dark",
      theme === "dark"
    );

    window.localStorage.setItem(
      "resumelens-theme",
      theme
    );
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) =>
      current === "dark"
        ? "light"
        : "dark"
    );
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}