function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-serif text-lg font-bold text-ink">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Disclaimer &amp; Terms
        </h1>
        <p className="text-sm text-ink-soft">
          Please read this before using ReadAct. By using the app, you agree to the points
          below.
        </p>
      </div>

      <Section title="General">
        <p>
          ReadAct is provided &quot;as is&quot;, without warranties of any kind, express or
          implied. We make no guarantee that the app will be error-free, uninterrupted, or
          fit for any particular purpose. Use it at your own discretion.
        </p>
      </Section>

      <Section title="AI-generated content">
        <p>
          Several features in this app — &quot;Suggest key points&quot;, Smart Assistant
          (URL, title, and audio/video modes), and Discover recommendations — use
          third-party AI models to generate summaries, key points, action steps, and
          recommendations. AI output can be incomplete, outdated, or factually wrong,
          especially content generated from a title alone (marked &quot;generated from the
          assistant&apos;s own knowledge&quot;) or audio/video transcriptions. Always verify
          AI-generated content before relying on it, and treat low-confidence items with
          extra caution.
        </p>
      </Section>

      <Section title="Your content and intellectual property">
        <p>
          Anything you upload or paste into ReadAct — text, markdown, PDF files, audio,
          video, or URLs — must be content you own or otherwise have the legal right to use
          and to submit for processing by third-party AI services. You are solely
          responsible for the content you add. We do not review uploads for copyright or
          licensing status, do not claim ownership over your content, and are not liable for
          any intellectual-property infringement, privacy violation, or other legal issue
          arising from content you submit. If you don&apos;t hold the rights to a piece of
          text, a PDF, or a recording, don&apos;t upload it here.
        </p>
      </Section>

      <Section title="Third-party AI services">
        <p>
          AI features send the relevant text, URL content, or audio/video data to
          third-party providers (currently Google Gemini and OpenRouter) for processing.
          That data is subject to those providers&apos; own terms and privacy policies,
          which are outside our control. Don&apos;t submit sensitive personal data,
          confidential material, or content you wouldn&apos;t want processed by an external
          AI service.
        </p>
      </Section>

      <Section title="Not professional advice">
        <p>
          Nothing in ReadAct — including AI-generated summaries, action steps, or book
          recommendations — constitutes financial, legal, medical, investment, or other
          professional advice. It is a personal reading and habit-tracking tool only.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, ReadAct and its operator are not liable
          for any direct, indirect, incidental, or consequential damages arising from your
          use of the app, including reliance on AI-generated content, loss of data, or
          issues with third-party services this app depends on.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          This disclaimer may be updated from time to time as the app changes. Continued use
          of ReadAct after an update means you accept the current version.
        </p>
      </Section>
    </div>
  );
}
