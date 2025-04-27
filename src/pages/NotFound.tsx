
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center page-gradient">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="mx-auto w-24 h-24 rounded-full bg-mutts-primary/10 flex items-center justify-center">
          <span className="text-5xl">🐾</span>
        </div>
        
        <h1 className="text-4xl font-bold text-mutts-primary">Oops! Wrong path</h1>
        <p className="text-xl text-gray-600">
          Looks like we've wandered off the trail! Let's get back to the main path.
        </p>
        
        <Button asChild className="bg-mutts-primary hover:bg-mutts-primary/90 rounded-xl mt-4">
          <a href="/">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
