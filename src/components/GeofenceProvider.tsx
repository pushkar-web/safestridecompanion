import { useGeofence } from "@/hooks/use-geofence";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Headless component that activates geofencing when user is logged in.
 */
const GeofenceProvider = () => {
  const { user } = useAuth();
  useGeofence(!!user);
  return null;
};

export default GeofenceProvider;
