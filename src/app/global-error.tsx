'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-ink">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="max-w-md text-center text-sm text-muted">
          An unexpected error occurred. You can try again, or go back to the home page.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
