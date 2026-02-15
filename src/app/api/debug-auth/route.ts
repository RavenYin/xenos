import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET() {
  return NextResponse.json({
    count: authOptions.providers?.length || 0,
    providers: authOptions.providers?.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
    })) || [],
    raw: authOptions.providers,
  });
}
