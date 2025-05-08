import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400"
};
const EVENT_ID = "1330327739079";
const BASE_URL = "https://www.eventbriteapi.com/v3";
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    console.log("Fetching orders from Eventbrite API");
    const apiKey = Deno.env.get("EVENTBRITE_API_KEY");
    if (!apiKey) {
      console.error("EVENTBRITE_API_KEY is not set in Supabase secrets");
      return new Response(JSON.stringify({
        error: "API key configuration error: EVENTBRITE_API_KEY is not set in Supabase secrets",
        orders: []
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log(`Using EVENT_ID: ${EVENT_ID}`);
    const response = await fetch(`${BASE_URL}/events/${EVENT_ID}/orders/?expand=attendees,ticket_class`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Eventbrite API error: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      let errorMessage = `Eventbrite API error: ${response.status} ${response.statusText}`;
      if (response.status === 401) {
        errorMessage = "Eventbrite API authentication error (401 Unauthorized): Your API key is invalid or expired.";
      } else if (response.status === 403) {
        errorMessage = "Eventbrite API authentication error (403 Forbidden): Your API key may be valid but doesn't have permission to access this event.";
      } else if (response.status === 404) {
        errorMessage = `Eventbrite API error: Event ID ${EVENT_ID} not found. Please verify the event ID.`;
      }
      return new Response(JSON.stringify({
        error: errorMessage,
        orders: [],
        status: response.status,
        details: errorText
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const data = await response.json();
    // Check if the expected data structure exists
    if (!data.orders) {
      console.error("Unexpected API response format:", data);
      return new Response(JSON.stringify({
        error: "Unexpected API response format",
        orders: []
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log(`Successfully fetched ${data.orders.length} orders from Eventbrite`);
    // Return the data
    return new Response(JSON.stringify({
      ...data,
      event_id: EVENT_ID
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error in fetch-eventbrite-orders function:", error.message);
    return new Response(JSON.stringify({
      error: error.message,
      orders: []
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
