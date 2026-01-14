// Performance measure error suppression
// This suppresses the Next.js/Turbopack internal performance measurement error
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // Suppress the specific performance.measure error from Next.js/Turbopack
    if (
      args[0]?.toString().includes("Failed to execute 'measure' on 'Performance'") ||
      args[0]?.toString().includes('cannot have a negative time stamp')
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}
