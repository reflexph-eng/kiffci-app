export default function Loading() {
  return (
    <main className="site-container py-16 lg:py-24" aria-busy="true" aria-label="Chargement de la page">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="skeleton h-12 w-2/3 rounded-2xl" />
        <div className="skeleton h-5 w-1/2 rounded" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-4" aria-hidden="true">
              <div className="skeleton aspect-[4/3] rounded-2xl" />
              <div className="skeleton h-5 w-4/5 rounded" />
              <div className="skeleton h-4 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
