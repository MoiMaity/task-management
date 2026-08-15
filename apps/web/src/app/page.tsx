export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold text-fg">Scaffold is running</h1>
      <p className="text-fg-muted">
        Theme tokens, API client and workspace wiring are in place. Screens get
        built once the design is available.
      </p>
    </main>
  );
}
