export default function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="page-header">
      <div className="icon-circle">
        <Icon size={24} strokeWidth={2} />
      </div>
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}
