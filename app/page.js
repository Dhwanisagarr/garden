import GardenApp from '@/components/GardenApp'

export default function Page() {
  return (
    <div>
      {/* Semantic static SSR content for crawlers, AI assistants, and search engines */}
      <section className="sr-only">
        <h1>Dahlia — Botanical Memory Journal</h1>
        <p>
          Dahlia is a private, web-based botanical memory journal app. Plant a photo memory for every day,
          watch monthly floral gardens bloom, view year-in-bloom retrospectives, and export high-resolution keepsake prints.
        </p>
        <h2>Key Features</h2>
        <ul>
          <li>Daily Memory Keeping: Add photos to your daily calendar grid to capture ordinary days.</li>
          <li>Botanical Flora: Watch unique seasonal flowers and ecosystem themes blossom as memories are planted.</li>
          <li>Private & Local: Memories stay securely on your device using local IndexedDB storage.</li>
          <li>Visual Keepsakes: Export your monthly memory garden to PDF, PNG, or Instagram story formats.</li>
        </ul>
      </section>

      <GardenApp />
    </div>
  )
}
