import { AuthShell } from "@/components/auth-shell";

/** Das Onboarding gehört visuell zum Auth-Flow, liegt aber außerhalb der `(auth)`-Gruppe. */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
