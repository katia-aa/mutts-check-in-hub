import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchEventbriteOrders } from "@/utils/eventbrite/fetch-orders";
import { RefreshCw } from "lucide-react";

const TestOrders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: any = await fetchEventbriteOrders();
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      setOrders(response.data?.orders || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={fetchOrders}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? "Fetching..." : "Test Orders API"}
      </Button>

      {error && (
        <div className="text-red-500">
          Error: {error}
        </div>
      )}

      {orders.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Orders ({orders.length})</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded p-4">
                <div className="font-medium">Order ID: {order.id}</div>
                <div className="text-sm text-gray-500">
                  Status: {order.status}
                </div>
                <div className="text-sm text-gray-500">
                  Created: {new Date(order.created).toLocaleString()}
                </div>
                <div className="mt-2">
                  <div className="font-medium">Attendees:</div>
                  {order.attendees?.map((attendee: any) => (
                    <div key={attendee.id} className="text-sm ml-4">
                      {attendee.profile?.name || attendee.profile?.email}
                      {attendee.ticket_class_name && (
                        <span className="text-gray-500 ml-2">
                          ({attendee.ticket_class_name})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestOrders; 