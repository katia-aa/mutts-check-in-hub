
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EVENT_ID = '1317686960169'
const BASE_URL = 'https://www.eventbrite.com/api/v3'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Fetching attendees from Eventbrite API");
    const apiKey = Deno.env.get('EVENTBRITE_API_KEY');
    
    if (!apiKey) {
      console.error("EVENTBRITE_API_KEY is not set in Supabase secrets");
      throw new Error('EVENTBRITE_API_KEY is not set in Supabase secrets');
    }

    console.log(`Using EVENT_ID: ${EVENT_ID}`);
    
    const response = await fetch(`${BASE_URL}/events/${EVENT_ID}/attendees/`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Eventbrite API error: ${response.status} ${response.statusText}`);
      console.error(`Error details: ${errorText}`);
      
      if (response.status === 403) {
        throw new Error(`Eventbrite API authentication error (403 Forbidden): Your API key may be invalid or missing required permissions for this event.`);
      }
      
      throw new Error(`Eventbrite API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if the expected data structure exists
    if (!data.attendees) {
      console.error("Unexpected API response format:", data);
      return new Response(JSON.stringify({ 
        error: "Unexpected API response format",
        attendees: []
      }), {
        status: 200, // Return 200 with empty array instead of failing
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Successfully fetched ${data.attendees.length} attendees from Eventbrite`);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("Error in fetch-eventbrite function:", error.message);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      attendees: [] 
    }), {
      status: 200, // Return 200 with error message instead of 500
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
