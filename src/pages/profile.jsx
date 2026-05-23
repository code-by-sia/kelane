import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckIcon, UserRoundIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SidebarPage from "@/pages/sidebar-page";
import useSetupStore from "@/store/setup";
import { AVATARS } from "@/data/avatars";
import { cn } from "@/lib/utils";

// ── Validation ────────────────────────────────────────────────────────────────
const schema = z.object({
  name:  z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email").or(z.literal("")).optional(),
});

// ── Avatar picker cell ────────────────────────────────────────────────────────
function AvatarCell({ avatar, selected, onSelect }) {
  return (
    <button
      type="button"
      title={avatar.label}
      onClick={() => onSelect(avatar.emoji)}
      className={cn(
        "relative flex items-center justify-center rounded-2xl text-2xl aspect-square",
        "transition-all duration-150 cursor-pointer",
        selected
          ? "bg-primary/15 ring-2 ring-primary ring-offset-2 scale-105 shadow-md"
          : "bg-muted hover:bg-accent hover:scale-105",
      )}
    >
      {avatar.emoji}
      {selected && (
        <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary flex items-center justify-center shadow">
          <CheckIcon size={9} className="text-primary-foreground" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ── Large avatar preview ──────────────────────────────────────────────────────
function AvatarPreview({ avatar, name }) {
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const profile  = useSetupStore((s) => s.profile);
  const setProfile = useSetupStore((s) => s.setProfile);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: profile.name, email: profile.email },
  });

  const watchedName = watch("name");

  // Avatar is auto-saved on click (instant feedback)
  const handleAvatarSelect = (emoji) => {
    const next = profile.avatar === emoji ? "" : emoji; // toggle off if tapping current
    setProfile({ avatar: next });
  };

  const onSubmit = (data) => {
    setProfile({ name: data.name, email: data.email || "" });
    toast.success("Profile updated!");
  };

  return (
    <SidebarPage title="Edit Profile">
      <div className="p-4 sm:p-6 max-w-xl flex flex-col gap-8">

        {/* ── Avatar section ── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <UserRoundIcon size={15} className="text-muted-foreground" />
            <h2 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Avatar
            </h2>
          </div>

          {/* Preview */}
          <div className="flex justify-center py-2">
            <AvatarPreview avatar={profile.avatar} name={watchedName || profile.name} />
          </div>

          {/* Picker grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {AVATARS.map((av) => (
              <AvatarCell
                key={av.id}
                avatar={av}
                selected={profile.avatar === av.emoji}
                onSelect={handleAvatarSelect}
              />
            ))}
          </div>
          {profile.avatar && (
            <button
              type="button"
              onClick={() => setProfile({ avatar: "" })}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline self-start transition-colors"
            >
              Remove avatar
            </button>
          )}
        </section>

        <Separator />

        {/* ── Profile fields ── */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Personal info
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Chef"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <span className="text-xs text-destructive">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <span className="text-xs text-destructive">{errors.email.message}</span>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={!isDirty}>
                Save changes
              </Button>
            </div>
          </form>
        </section>

      </div>
    </SidebarPage>
  );
}
