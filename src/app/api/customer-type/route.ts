import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * GET /api/customer-type
 * Returns customer type distribution data
 * This endpoint reads the customer-type.json file and returns the data
 * for visualization in the frontend dashboard
 */
export async function GET() {
  try {
    // Define the path to the JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'customer-type.json');
    
    // Read the JSON file
    const jsonData = await fs.readFile(filePath, 'utf8');
    
    // Parse the JSON data
    const data = JSON.parse(jsonData);
    
    // Return the data with proper headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
    
  } catch (error) {
    console.error('Error reading customer type data:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to load customer type data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 