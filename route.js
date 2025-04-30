// app/api/carquery/route.js
import { NextResponse } from 'next/server';

/**
 * A server-side proxy for CarQuery API to avoid CORS issues
 * 
 * You can call this API route from the client-side, and it
 * will make the request to CarQuery API server-side
 * 
 * Example: 
 * - GET /api/carquery?make=bmw&model=x5&year=2020
 */
export async function GET(request) {
  try {
    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    
    // Validate parameters
    if (!make || !model) {
      return NextResponse.json({ error: 'make and model parameters are required' }, { status: 400 });
    }
    
    // Build the CarQuery API URL
    const carQueryUrl = `http://www.carqueryapi.com/api/0.3/?callback=?&cmd=getTrims&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${year ? `&year=${year}` : ''}`;
    
    // Make the request to CarQuery API from the server
    const response = await fetch(carQueryUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Error fetching from CarQuery API' }, { status: 502 });
    }
    
    // The response is in JSONP format, which we need to strip
    // It typically looks like '?({...})' or 'callback({...})'
    let data = await response.text();
    
    // Strip the JSONP wrapper
    const jsonMatch = data.match(/\(\s*({.*})\s*\)/);
    if (jsonMatch && jsonMatch[1]) {
      data = jsonMatch[1];
    } else {
      return NextResponse.json({ error: 'Invalid response format from CarQuery API' }, { status: 502 });
    }
    
    try {
      // Parse the JSON data
      const jsonData = JSON.parse(data);
      
      // Return the processed data
      return NextResponse.json(jsonData);
    } catch (jsonError) {
      console.error('Error parsing CarQuery response JSON:', jsonError);
      return NextResponse.json({ error: 'Error parsing CarQuery response' }, { status: 502 });
    }
  } catch (error) {
    console.error('CarQuery proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}