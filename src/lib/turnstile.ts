/** The small part of Cloudflare's Turnstile browser API that this site uses. */
interface TurnstileOptions {
  sitekey: string;
  theme?: "auto" | "light" | "dark";
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

export interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileOptions): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;

/** Loads Cloudflare's Turnstile script once, and resolves when it is ready to use. */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;

  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        loading = null;
        reject(new Error("Turnstile did not start."));
      }
    };
    script.onerror = () => {
      loading = null;
      reject(new Error("Turnstile could not be loaded."));
    };
    document.head.appendChild(script);
  });

  return loading;
}