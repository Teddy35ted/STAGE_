import { NextRequest, NextResponse } from 'next/server';

/**
 * Route de santé pour vérifier la disponibilité du serveur
 * GET /api/health
 */
export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({ 
            status: 'healthy',
            timestamp: new Date().toISOString(),
            server: 'Next.js',
            version: process.env.npm_package_version || '1.0.0'
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ 
            status: 'error',
            message: 'Server health check failed'
        }, { status: 500 });
    }
}
