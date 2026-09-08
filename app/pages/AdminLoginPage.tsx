import { agentNativePath } from "@agent-native/core/client/api-path";
import { useSession } from "@agent-native/core/client/hooks";
import {
  IconArrowRight,
  IconBrandGoogle,
  IconLoader2,
  IconLock,
} from "@tabler/icons-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { session, isLoading: sessionLoading } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!sessionLoading && session) navigate("/admin", { replace: true });
  }, [navigate, session, sessionLoading]);

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(
        agentNativePath("/_agent-native/auth/login"),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: email.trim(), password }),
        },
      );
      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(result?.error ?? "Email atau password tidak sesuai.");
      }
      window.location.assign("/admin");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login belum berhasil. Silakan coba lagi.",
      );
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const url = new URL(
        agentNativePath("/_agent-native/google/auth-url"),
        window.location.origin,
      );
      url.searchParams.set("return", "/admin");
      const response = await fetch(url, { credentials: "include" });
      const result = (await response.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;
      if (!response.ok || !result?.url) {
        throw new Error(result?.error ?? "Login Google belum tersedia.");
      }
      window.location.assign(result.url);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login Google belum berhasil.",
      );
      setIsGoogleLoading(false);
    }
  }

  if (sessionLoading || session) {
    return (
      <div className="public-neon-page public-neon-grid grid min-h-screen place-items-center p-6">
        <p className="flex items-center gap-2 text-sm text-cyan-100">
          <IconLoader2 className="size-4 animate-spin" /> Menyiapkan halaman
          operator...
        </p>
      </div>
    );
  }

  return (
    <main className="public-neon-page public-neon-grid min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <section className="hidden lg:block">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-semibold text-white"
            >
              <span className="public-neon-logo grid size-10 place-items-center overflow-hidden rounded-xl p-1.5">
                <img
                  src="/rakitapp-logo.png"
                  alt=""
                  aria-hidden="true"
                  className="size-full object-contain"
                />
              </span>
              <span>RakitApp</span>
            </Link>
            <p className="public-neon-badge mt-10 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
              Ruang operator
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Kelola solusi yang sedang dirakit.
            </h1>
            <p className="public-neon-copy mt-5 max-w-lg text-lg leading-8">
              Masuk untuk menindaklanjuti lead konsultasi, prototype client, dan
              katalog solusi digital RakitApp.
            </p>
          </section>

          <section className="public-glass-panel rounded-[2rem] border-cyan-300/30 p-6 shadow-[0_0_70px_rgba(34,211,238,0.12)] sm:p-8">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="public-neon-logo grid size-10 place-items-center overflow-hidden rounded-xl p-1.5">
                <img
                  src="/rakitapp-logo.png"
                  alt=""
                  aria-hidden="true"
                  className="size-full object-contain"
                />
              </span>
              <span className="text-lg font-semibold text-white">RakitApp</span>
            </div>
            <div className="mt-6 lg:mt-0">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-200">
                <IconLock className="size-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-white">
                Masuk ke admin
              </h2>
              <p className="public-neon-muted mt-2 text-sm leading-6">
                Gunakan akun operator RakitApp yang sudah terdaftar.
              </p>
            </div>

            <form onSubmit={handleEmailLogin} className="mt-7 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-200">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="operator@contoh.com"
                  required
                  className="public-neon-input h-11 rounded-xl px-3 outline-none"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-200">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  required
                  className="public-neon-input h-11 rounded-xl px-3 outline-none"
                />
              </label>
              {error ? (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-3 py-2.5 text-sm leading-6 text-rose-100"
                >
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                className="public-neon-button h-11 rounded-xl"
                disabled={isSubmitting || isGoogleLoading}
              >
                {isSubmitting ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : null}
                Masuk ke admin <IconArrowRight className="size-4" />
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-slate-700/70" />
              atau
              <span className="h-px flex-1 bg-slate-700/70" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => void handleGoogleLogin()}
              disabled={isSubmitting || isGoogleLoading}
              className="h-11 w-full rounded-xl border-slate-600/70 bg-slate-900/50 text-slate-100 hover:bg-slate-800/70 hover:text-white"
            >
              {isGoogleLoading ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconBrandGoogle className="size-4" />
              )}
              Masuk dengan Google
            </Button>

            <p className="public-neon-muted mt-6 text-center text-xs leading-5">
              Akses admin hanya tersedia untuk email yang tercantum di daftar
              operator RakitApp.
            </p>
            <Link
              to="/"
              className="public-neon-link mt-5 inline-flex w-full justify-center text-sm"
            >
              ← Kembali ke RakitApp
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
