import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import useSetupStore from "@/store/setup";
import { AVATARS } from "@/data/avatars";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email").or(z.literal("")).optional(),
});

export default function UserSetup({ onNext }) {
  const setProfile = useSetupStore((s) => s.setProfile);
  const profile = useSetupStore((s) => s.profile);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: profile.name, email: profile.email },
  });

  const handleAvatarClick = (emoji) => {
    // Tap same emoji to deselect
    setProfile({ avatar: profile.avatar === emoji ? "" : emoji });
  };

  const onSubmit = (data) => {
    setProfile({ name: data.name, email: data.email || "" });
    onNext();
  };

  return (
    <div className="flex flex-col justify-center h-full max-w-2xl mx-auto gap-6">
      <div>
        <h1 className="text-2xl font-light mb-1">Who's cooking?</h1>
        <p className="text-muted-foreground text-sm">
          Pick an avatar and tell us your name. You can change both anytime.
        </p>
      </div>

      {/* Avatar picker */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          Avatar (optional)
        </Label>
        <div className="grid grid-cols-10 gap-1.5">
          {AVATARS.map(({ id, emoji, label }) => {
            const active = profile.avatar === emoji;
            return (
              <button
                key={id}
                type="button"
                title={label}
                onClick={() => handleAvatarClick(emoji)}
                className={cn(
                  "aspect-square rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer select-none",
                  "hover:bg-accent hover:scale-110",
                  active
                    ? "bg-primary/10 ring-2 ring-primary ring-offset-2 scale-105"
                    : "bg-muted/40",
                )}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 max-w-sm"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Your name *</Label>
          <Input id="name" placeholder="e.g. Chef" {...register("name")} />
          {errors.name && (
            <span className="text-xs text-destructive">
              {errors.name.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-xs text-destructive">
              {errors.email.message}
            </span>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </div>
  );
}
