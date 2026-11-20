import { useEffect, useRef, useState, type FormEvent } from "react";
import { useApiResource } from "../lib/useApiResource";
import { loadTurnstile } from "../lib/turnstile";

interface ContactConfig {
  available: boolean;
  turnstileSiteKey: string | null;
}

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

const fieldClass =
  "mt-2 w-full border border-line bg-surface/40 px-4 py-3 text-ivory placeholder:text-mist/60 focus:border-gold";

async function sendMessage(payload: {
  name: string;
  email: string;
  message: string;
  website: string;
  turnstileToken: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) return { ok: true };

    let message = "Your message could not be sent. Please try again later.";
    try {
      const data = (await response.json()) as { error?: { message?: string } };
      if (data.error?.message) message = data.error.message;
    } catch {
      /* keep the general message */
    }
    return { ok: false, message };
  } catch {
    return { ok: false, message: "Could not reach the server. Please check your connection and try again." };
  }
}

export default function ContactForm() {
  const { data: config, loading } = useApiResource<ContactConfig>("/api/contact/config", () => ({
    available: false,
    turnstileSiteKey: null,
  }));

  const siteKey = config?.turnstileSiteKey ?? null;
  const unavailable = !loading && config !== null && !config.available;

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [token, setToken] = useState("");
  const [widgetProblem, setWidgetProblem] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // Show Cloudflare's spam check when the site has it switched on.
  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;

    loadTurnstile()
      .then((api) => {
        if (cancelled) return;
        widgetId.current = api.render(container, {
          sitekey: siteKey,
          theme: "auto",
          callback: (value) => {
            setToken(value);
            setWidgetProblem("");
          },
          "expired-callback": () => setToken(""),
          "error-callback": () => {
            setToken("");
            setWidgetProblem("The spam check could not run. Please reload the page and try again.");
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setWidgetProblem(
            "The spam check could not load. If you use a content blocker, turn it off for this site and reload.",
          );
        }
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
      widgetId.current = null;
    };
  }, [siteKey]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (status.kind === "sending") return;

    if (siteKey && !token) {
      setStatus({
        kind: "error",
        message: widgetProblem || "Please complete the spam check below the message box first.",
      });
      return;
    }

    setStatus({ kind: "sending" });
    const result = await sendMessage({ name, email, message, website, turnstileToken: token });

    if (result.ok) {
      setName("");
      setEmail("");
      setMessage("");
      setStatus({ kind: "sent" });
    } else {
      setStatus({ kind: "error", message: result.message });
    }

    // A spam-check token works only once, so ask for a new one.
    if (siteKey && widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      setToken("");
    }
  }

  const disabled = loading || unavailable || status.kind === "sending";

  return (
    <div>
      {unavailable && (
        <p className="mb-6 border border-dashed border-gold-deep p-4 text-sm text-mist">
          The contact form is not available right now. It works only on the live site.
        </p>
      )}

      <p role="status" className="mb-6 text-sm text-gold">
        {status.kind === "sent" && "Thank you. Your message has been sent, and Henry will reply by email."}
        {status.kind === "error" && status.message}
      </p>

      <form onSubmit={(e) => void onSubmit(e)} aria-label="Contact form" className="relative">
        <fieldset disabled={disabled} className="space-y-5">
          <div>
            <label htmlFor="contact-name" className="text-sm text-ivory/80">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="text-sm text-ivory/80">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="text-sm text-ivory/80">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              required
              minLength={10}
              maxLength={3000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={fieldClass}
            />
            <p className="mt-2 text-xs text-mist">{message.length} of 3000 characters.</p>
          </div>

          {/* Hidden from people. Bots that fill it in are quietly ignored. */}
          <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="contact-website">Leave this field empty</label>
            <input
              id="contact-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {siteKey && <div ref={containerRef} />}
          {widgetProblem && <p className="text-sm text-gold">{widgetProblem}</p>}

          <p className="text-xs leading-relaxed text-mist">
            Your name, email and message are stored so Henry can reply, and are not shared with anyone
            else.
          </p>

          <button
            type="submit"
            className="bg-gold px-8 py-3 text-sm font-medium tracking-wide text-canvas transition-colors duration-300 hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.kind === "sending" ? "Sending…" : "Send message"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}