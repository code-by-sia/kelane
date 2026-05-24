export function NavItem({ href, icon: Icon, label, active, onClick }) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      className={`mobile-nav__item ${active ? "mobile-nav__item--active" : "mobile-nav__item--idle"}`}
    >
      <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
      <span>{label}</span>
    </Tag>
  );
}
