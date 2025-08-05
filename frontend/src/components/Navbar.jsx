import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useLocation and useNavigate
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation(); // Get the current location object
  const navigate = useNavigate(); // Get the navigate function

  // Determine if the current path is a special map path (public share or collaborated map)
  const isSpecialMapPath = location.pathname.startsWith('/share/') || location.pathname.startsWith('/map/');
  
  // You might also want to check if it's the login or signup page,
  // so the 'Login'/'Sign Up' links don't show when already on those pages.
  // Although in App.jsx, you handle redirects, so this might be less critical here.
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';


  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">FamJam</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* NEW: Back to My Map button for authenticated users on special map paths */}
            {authUser && isSpecialMapPath && (
              <button
                onClick={() => navigate('/')} // Navigate back to the root path (their own map)
                className="btn btn-sm gap-2 transition-colors btn-outline btn-info" // Added some styling
              >
                Back to My Map
              </button>
            )}

            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser ? ( // Use authUser to conditionally render profile and logout
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center btn btn-sm" onClick={logout}> {/* Added btn btn-sm for consistency */}
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
                // Optional: Show Login/Signup links if not authenticated and not on those pages
                <>
                    {!isLoginPage && (
                        <Link to="/login" className={`btn btn-sm gap-2`}>
                            Login
                        </Link>
                    )}
                    {!isSignupPage && (
                        <Link to="/signup" className={`btn btn-sm gap-2`}>
                            Sign Up
                        </Link>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;