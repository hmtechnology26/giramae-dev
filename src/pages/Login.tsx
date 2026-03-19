import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/shared/Header";
import { Heart, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import SEOHead from "@/components/seo/SEOHead";
import { pageTitle } from "@/lib/pageTitle";

const Login = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate("/feed");
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Erro ao fazer login com Google. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-violet-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-white to-violet-50 text-foreground flex flex-col font-sans overflow-hidden">
      <SEOHead title={pageTitle.login()} />
      <Header />

      <main className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden px-4 pt-28 pb-16 md:px-6 md:pt-32 md:pb-24">
        {/* FUNDO SUAVE */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_35%),linear-gradient(to_bottom_right,#fff,#fffdfd,#faf5ff)]" />
          <div className="absolute top-[10%] left-[12%] h-56 w-56 md:h-72 md:w-72 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-[8%] right-[10%] h-64 w-64 md:h-80 md:w-80 rounded-full bg-fuchsia-200/10 blur-3xl" />
          <div className="absolute top-[36%] right-[22%] h-52 w-52 md:h-64 md:w-64 rounded-full bg-sky-200/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Card className="premium-card relative overflow-hidden rounded-[2.75rem] border border-black/15 bg-white/75 shadow-[0_28px_60px_-18px_rgba(0,0,0,0.10)] backdrop-blur-2xl md:rounded-[3.25rem]">

            <CardHeader className="space-y-5 pt-10 pb-6 text-center md:pt-12 md:pb-7">
              <div className="flex flex-col items-center gap-5">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[2.25rem] border border-primary/5 bg-white p-4 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.18)] group md:h-28 md:w-28 md:rounded-[2.5rem] md:p-5">
                  <div className="absolute inset-0 rounded-[2.5rem] bg-primary/5 blur-xl opacity-0 transition-opacity duration-1000 group-hover:opacity-100" />
                  <img
                    src="/icon-512.png"
                    className="relative z-10 h-full w-full scale-110 object-contain"
                    alt="Logo"
                  />
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-3xl font-black leading-tight tracking-tight text-foreground md:text-4xl">
                    Bem-vinda de <br />
                    <span className="text-primary italic text-glow">Volta</span>
                  </CardTitle>

                  <CardDescription className="mx-auto max-w-[320px] text-[13px] font-medium leading-relaxed text-foreground/45 md:text-sm">
                    Estamos felizes em ver você novamente em nossa comunidade.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-6 pb-8 md:px-8 md:pb-10">
              <div className="space-y-5">
                <Button
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="founders-button group h-12 w-full rounded-2xl text-sm font-black text-white shadow-2xl shadow-primary/20 transition-all duration-700 md:h-14 md:rounded-3xl md:text-base"
                >
                  <div className="flex items-center justify-center gap-4">
                    {isSigningIn ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <div className="shrink-0 rounded-xl bg-white p-2 shadow-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          className="h-4 w-4 md:h-5 md:w-5"
                          aria-hidden="true"
                        >
                          <path
                            fill="#FFC107"
                            d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.215 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.277 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                          />
                          <path
                            fill="#FF3D00"
                            d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.277 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                          />
                          <path
                            fill="#4CAF50"
                            d="M24 44c5.177 0 9.946-1.977 13.555-5.192l-6.19-5.238C29.289 35.091 26.715 36 24 36c-5.194 0-9.624-3.329-11.286-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                          />
                          <path
                            fill="#1976D2"
                            d="M43.611 20.083H42V20H24v8h11.303c-.793 2.285-2.285 4.241-4.128 5.57l.003-.002 6.19 5.238C36.93 39.17 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                          />
                        </svg>
                      </div>
                    )}

                    <span>{isSigningIn ? "Conectando..." : "Entrar com Google"}</span>
                  </div>
                </Button>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Acesso 100% Seguro
                  </div>

                  <div className="text-center text-xs font-medium text-foreground/40">
                    Não tem uma conta?{" "}
                    <Link to="/auth" className="font-black tracking-tight text-primary hover:underline">
                      Comece aqui
                    </Link>
                  </div>

                  <p className="px-6 text-center text-[10px] font-medium leading-relaxed text-foreground/30">
                    Ao continuar, você aceita nossos{" "}
                    <Link
                      to="/termos"
                      className="text-primary/60 transition-colors hover:text-primary hover:underline"
                    >
                      Termos de Uso
                    </Link>{" "}
                    e nossa{" "}
                    <Link
                      to="/privacidade"
                      className="text-primary/60 transition-colors hover:text-primary hover:underline"
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col items-center gap-5 text-center">
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20">
              <span>&copy; {new Date().getFullYear()} GiraMãe</span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary/20" />
              <div className="flex items-center gap-1.5">
                Feito com <Heart className="h-3 w-3 animate-pulse fill-primary/20 text-primary/40" /> para você
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;