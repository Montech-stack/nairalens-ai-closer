import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — NairaLens" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submitSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in.");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <div className="glass-gold rounded-2xl p-8 gold-glow">
          {mode === "signin" && (
            <>
              <h1 className="font-serif text-3xl mb-1">Welcome back.</h1>
              <p className="text-sm text-muted-foreground mb-6">Re-enter the engine.</p>
              <form onSubmit={submitSignIn} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setForgotSent(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-gold transition-colors text-left"
                >
                  Forgot password?
                </button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold text-noir hover:bg-gold/90 font-semibold"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                New here?{" "}
                <Link to="/onboarding" className="text-gold hover:underline">
                  Create an account
                </Link>
              </div>
            </>
          )}

          {mode === "forgot" && !forgotSent && (
            <>
              <h1 className="font-serif text-3xl mb-1">Reset password.</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your email and we'll send a reset link.
              </p>
              <form onSubmit={submitForgot} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold text-noir hover:bg-gold/90 font-semibold"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode("signin")}
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  ← Back to sign in
                </button>
              </div>
            </>
          )}

          {mode === "forgot" && forgotSent && (
            <>
              <h1 className="font-serif text-2xl mb-2">Check your inbox.</h1>
              <p className="text-sm text-muted-foreground mb-2">
                We've sent a password reset link to
              </p>
              <p className="text-gold font-medium text-sm mb-4">{email}</p>
              <p className="text-sm text-muted-foreground mb-6">
                Click the link in that email, then set your new password. Check spam if it doesn't
                arrive.
              </p>
              <button
                onClick={() => {
                  setMode("signin");
                  setForgotSent(false);
                }}
                className="text-sm text-gold hover:underline"
              >
                ← Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
