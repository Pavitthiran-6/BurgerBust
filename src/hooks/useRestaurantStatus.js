import { useState, useEffect } from 'react';
import { restaurantService } from '../services/restaurantService';

/**
 * useRestaurantStatus — returns live restaurant operational status.
 * Recalculates every 60 seconds to track open/busy/closed transitions.
 */
export function useRestaurantStatus() {
  const [status, setStatus] = useState({
    status: 'CLOSED',
    label: 'CHECKING STATUS',
    color: 'bg-gray-500',
    message: 'Loading restaurant availability…',
    canOrder: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    const loadStatus = async () => {
      try {
        const restaurant = await restaurantService.getRestaurant();
        if (!active) return;
        const maintenance = restaurant.maintenanceMode;
        setStatus({
          ...restaurant,
          label: maintenance ? 'MAINTENANCE' : restaurant.status,
          color: maintenance || restaurant.status === 'BUSY'
            ? 'bg-orange-500'
            : restaurant.status === 'OPEN' ? 'bg-[#34C759]' : 'bg-gray-700',
          message: maintenance
            ? restaurant.maintenanceMessage || 'Temporarily unavailable for maintenance.'
            : `${restaurant.estimatedDeliveryMinutes} min estimated delivery`,
          canOrder: restaurant.canAcceptOrders,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (active) setStatus(previous => ({ ...previous, loading: false, error: error.message }));
      }
    };
    loadStatus();
    const interval = setInterval(loadStatus, 60_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return status;
}
