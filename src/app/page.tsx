import { Button } from "@/components/ui/button";
import UserButton from "../../modules/auth/components/user-button";

export default async function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button>Get Started</Button>
      <UserButton />
    </div>
  );
}