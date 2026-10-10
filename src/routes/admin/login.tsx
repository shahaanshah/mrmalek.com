import * as React from 'react';
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { adminLogin } from '@/lib/cms/admin.functions';
import { loginSchema } from '@/lib/cms/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const login = useServerFn(adminLogin);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: { email: string; password: string }) {
    setError(null);
    setBusy(true);
    try {
      const result = await login({ data: values });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await router.invalidate();
      navigate({ to: '/admin', replace: true });
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      const msg = err instanceof Error ? err.message : String(err || '');
      setError(msg ? `Sign in error: ${msg}` : 'Could not sign in right now. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-app relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 sm:p-8">
      <div className="pointer-events-none absolute inset-0 admin-login-grid" aria-hidden="true" />
      <a href="/" className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground sm:left-8 sm:top-8">
        <ArrowLeft className="size-4" /> Back to website
      </a>
      <Card className="relative w-full max-w-md border-border/80 bg-card/95 shadow-2xl">
        <CardHeader className="space-y-5 p-6 pb-4 sm:p-8 sm:pb-5">
          <div className="flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Lock className="size-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 text-emerald-400" /> Private workspace</span>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to Content Studio to manage your website.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="username" placeholder="name@example.com" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="pr-10" {...field} />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 size-8" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="mt-1 w-full" size="lg" disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {busy ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </Form>
          <p className="mt-5 text-center text-xs text-muted-foreground">Authorized access only · Session expires automatically</p>
        </CardContent>
      </Card>
    </main>
  );
}

export const Route = createFileRoute('/admin/login')({
  head: () => ({
    meta: [
      { title: 'Admin sign in | Content Studio' },
      { name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' },
      { name: 'googlebot', content: 'noindex, nofollow, noarchive, nosnippet' },
      { name: 'bingbot', content: 'noindex, nofollow, noarchive, nosnippet' },
      { name: 'description', content: 'Private administration area.' },
    ],
  }),
  component: LoginPage,
});
