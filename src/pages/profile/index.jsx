import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserRoundIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SidebarPage from "@/pages/sidebar-page";
import useSetupStore from "@/store/setup";
import { AVATARS } from "@/data/avatars";
import { AvatarCell } from "./avatar-cell";
import { AvatarPreview } from "./avatar-preview";

const schema = z.object({
  name:  z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email").or(z.literal("")).optional(),
});

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

  const handleAvatarSelect = (emoji) => {
    const next = profile.avatar === emoji ? "" : emoji;
    setProfile({ avatar: next });
  };

  const onSubmit = (data) => {
    setProfile({ name: data.name, email: data.email || "" });
    toast.success("Profile updated!");
  };

  return (
    <SidebarPage title="Edit Profile">
      <div className="p-4 sm:p-6 max-w-xl flex flex-col gap-8">

        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <UserRoundIcon size={15} className="text-muted-foreground" />
            <h2 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Avatar
            </h2>
          </div>

          <div className="flex justify-center py-2">
            <AvatarPreview avatar={profile.avatar} name={watchedName || profile.name} />
          </div>

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
              <Label htmlFor="email">
                Email <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
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
