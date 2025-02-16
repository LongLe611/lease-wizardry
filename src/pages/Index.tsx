
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function IndexPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Welcome!</h1>
      <Button asChild>
        <Link to="/auth">Login / Register</Link>
      </Button>
    </div>
  );
}
