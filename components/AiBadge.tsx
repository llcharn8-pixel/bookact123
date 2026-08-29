export function AiBadge({ confidence }: { confidence: number | null }) {
  const isLowConfidence = confidence !== null && confidence < 0.5;

  return (
    <span
      title={
        confidence !== null
          ? `AI confidence: ${Math.round(confidence * 100)}%`
          : "AI-generated"
      }
      className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        isLowConfidence
          ? "bg-doing-soft text-doing"
          : "bg-gold-soft text-gold"
      }`}
    >
      {isLowConfidence ? "AI · low confidence" : "AI"}
    </span>
  );
}
