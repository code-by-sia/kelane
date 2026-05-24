export function AvatarPreview({ avatar, name }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]?.toUpperCase()).slice(0, 2).join("")
    : "?";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="size-20 rounded-2xl bg-primary/12 flex items-center justify-center shadow-md ring-2 ring-primary/20">
        {avatar ? (
          <span className="text-4xl leading-none">{avatar}</span>
        ) : (
          <span className="text-2xl font-semibold text-primary">{initials}</span>
        )}
      </div>
      {!avatar && (
        <p className="text-xs text-muted-foreground">No avatar — showing initials</p>
      )}
    </div>
  );
}
