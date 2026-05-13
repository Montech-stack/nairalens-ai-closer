import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/confirm-email")({
  validateSearch: (s: Record<string, unknown>) => ({
    email: (s.email as string) ?? "",
  }),
  head: () => ({ meta: [{ title: "Confirm your email — NairaLens" }] }),
  component: ConfirmEmailPage,
});

function ConfirmEmailPage() {
  const { email } = useSearch({ from: "/confirm-email" });
  const [resending, setResending] = useState(false);

  const resend = async () => {
    if (!email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) toast.error(error.message);
    else toast.success("Confirmation email resent — check your inbox.");
    setResending(false);
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <div className="glass-gold rounded-2xl p-8 gold-glow">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-gold" />
          </div>
          <h1 className="font-serif text-2xl mb-2">Check your inbox</h1>
          <p className="text-muted-foreground text-sm mb-1">
            We've sent a confirmation link to
          </p>
          {email && (
            <p className="text-gold font-medium text-sm mb-4">{email}</p>
          )}
          <p className="text-muted-foreground text-sm mb-7">
            Click the link in that email to activate your account and continue
            your setup. Check spam if it doesn't arrive within a minute.
          </p>
          <div className="space-y-3">
            {email && (
              <Button
                onClick={resend}
                disabled={resending}
                variant="outline"
                className="w-full border-gold/30 text-gold hover:bg-gold/10"
              >
                {resending ? "Sending…" : "Resend confirmation email"}
              </Button>
            )}
            <Link
              to="/auth"
              className="block text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              Already confirmed? Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
