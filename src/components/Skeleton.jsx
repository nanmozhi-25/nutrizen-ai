export function SkeletonBlock({ width = "100%", height = 16, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="card">
      <SkeletonBlock width="40%" height={14} style={{ marginBottom: 12 }} />
      <SkeletonBlock width="70%" height={22} style={{ marginBottom: 8 }} />
      <SkeletonBlock width="90%" height={12} />
    </div>
  );
}

export function Spinner() {
  return <div className="spinner" />;
}
