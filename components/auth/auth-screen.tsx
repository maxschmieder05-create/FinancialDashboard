"use client";

import { useState, type FormEvent } from "react";
import { BarChart3, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseClient } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

export function AuthScreen() {
  const supabase = getSupabaseClient();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Add your Supabase URL and anon key to .env.local to enable authentication.");
      return;
    }

    setLoading(true);

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
              emailRedirectTo:
                typeof window === "undefined" ? undefined : window.location.origin,
            },
          });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Account created. Check your email to confirm your address before signing in.");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1fr_480px]">
        <section className="flex min-h-[44vh] flex-col justify-between border-b border-border bg-secondary/30 p-6 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Industrials</p>
              <h1 className="text-xl font-semibold">Finance Dashboard</h1>
            </div>
          </div>

          <div className="max-w-3xl py-14 lg:py-0">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Secure workspace
            </p>
            <h2 className="max-w-2xl text-4xl font-semibold leading-tight text-foreground md:text-6xl">
              Sign in to your market intelligence dashboard.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Track industrial leaders, deal flow, customer concentration, forecasts, and news from
              one protected view.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {["Market data", "M&A pipeline", "Forecasting"].map((item) => (
              <div key={item} className="border-t border-border pt-3">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <Tabs
              value={mode}
              onValueChange={(value) => {
                setMode(value as AuthMode);
                setError(null);
                setMessage(null);
              }}
              className="gap-6"
            >
              <TabsList className="grid h-10 w-full grid-cols-2">
                <TabsTrigger value="signin">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <AuthForm
                mode="signin"
                currentMode={mode}
                email={email}
                password={password}
                fullName={fullName}
                loading={loading}
                disabled={!supabase}
                error={error}
                message={message}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onFullNameChange={setFullName}
                onSubmit={submitAuth}
              />
              <AuthForm
                mode="signup"
                currentMode={mode}
                email={email}
                password={password}
                fullName={fullName}
                loading={loading}
                disabled={!supabase}
                error={error}
                message={message}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onFullNameChange={setFullName}
                onSubmit={submitAuth}
              />
            </Tabs>
          </div>
        </section>
      </div>
    </main>
  );
}

interface AuthFormProps {
  mode: AuthMode;
  currentMode: AuthMode;
  email: string;
  password: string;
  fullName: string;
  loading: boolean;
  disabled: boolean;
  error: string | null;
  message: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function AuthForm({
  mode,
  currentMode,
  email,
  password,
  fullName,
  loading,
  disabled,
  error,
  message,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onSubmit,
}: AuthFormProps) {
  const isSignup = mode === "signup";
  const isActive = currentMode === mode;

  return (
    <TabsContent value={mode}>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <h3 className="text-2xl font-semibold">
            {isSignup ? "Create your account" : "Welcome back"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isSignup
              ? "Use your work email to request access to the dashboard."
              : "Enter your credentials to continue to the dashboard."}
          </p>
        </div>

        {isSignup && (
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              autoComplete="name"
              value={fullName}
              onChange={(event) => onFullNameChange(event.target.value)}
              disabled={loading || disabled}
              placeholder="Jane Doe"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`${mode}-email`}>Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={`${mode}-email`}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              disabled={loading || disabled}
              placeholder="name@company.com"
              required={isActive}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${mode}-password`}>Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={`${mode}-password`}
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              disabled={loading || disabled}
              minLength={6}
              required={isActive}
              className="pl-9"
            />
          </div>
        </div>

        {(error || message || disabled) && (
          <p
            className={cn(
              "rounded-md border px-3 py-2 text-sm",
              error || disabled
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-accent/40 bg-accent/10 text-accent"
            )}
          >
            {error || message || "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading || disabled}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {isSignup ? "Create account" : "Log in"}
        </Button>
      </form>
    </TabsContent>
  );
}
