import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Destinations from "@/pages/Destinations";
import PackageDetail from "@/pages/PackageDetail";
import BookingPage from "@/pages/BookingPage";
import GalleryPage from "@/pages/GalleryPage";
import ContactPage from "@/pages/ContactPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPackages from "@/pages/admin/AdminPackages";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminContacts from "@/pages/admin/AdminContacts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/destinations" component={Destinations} />
      <Route path="/destinations/:id" component={PackageDetail} />
      <Route path="/book/:packageId" component={BookingPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/packages" component={AdminPackages} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/reviews" component={AdminReviews} />
      <Route path="/admin/gallery" component={AdminGallery} />
      <Route path="/admin/contacts" component={AdminContacts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <Router />
              <Toaster />
            </AuthProvider>
          </WouterRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
