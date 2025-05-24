import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="bg-red-100 rounded-full p-3">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
        </div>

        <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
        <h2 className="mt-2 text-2xl font-bold text-gray-800">Page Not Found</h2>

        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Oops! Something went wrong</AlertTitle>
          <AlertDescription>
            The page you're looking for doesn't exist or has been moved.
          </AlertDescription>
        </Alert>

        <p className="mt-4 text-gray-600">
          The page at <span className="font-medium text-red-500">{location.pathname}</span> could not be found.
        </p>

        <div className="mt-8">
          <Button asChild className="w-full flex items-center justify-center gap-2">
            <Link to="/">
              <Home size={18} />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
