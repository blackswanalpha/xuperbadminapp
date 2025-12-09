// ================================
// Health Check API Endpoint
// ================================

import { NextResponse } from 'next/server'

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  services: {
    database?: 'connected' | 'disconnected' | 'unknown'
    redis?: 'connected' | 'disconnected' | 'unknown'
  }
}

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  try {
    const startTime = Date.now()
    
    // Basic health check data
    const healthData: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {}
    }

    // Check database connectivity (optional)
    try {
      // Add database health check here if needed
      // const dbStatus = await checkDatabaseConnection()
      healthData.services.database = 'unknown'
    } catch (error) {
      healthData.services.database = 'disconnected'
      console.warn('Database health check failed:', error)
    }

    // Check Redis connectivity (optional)
    try {
      // Add Redis health check here if needed
      // const redisStatus = await checkRedisConnection()
      healthData.services.redis = 'unknown'
    } catch (error) {
      healthData.services.redis = 'disconnected'
      console.warn('Redis health check failed:', error)
    }

    // Determine overall health status
    const hasUnhealthyServices = Object.values(healthData.services).includes('disconnected')
    if (hasUnhealthyServices) {
      healthData.status = 'unhealthy'
    }

    const responseTime = Date.now() - startTime
    
    return NextResponse.json(healthData, {
      status: healthData.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {},
      error: 'Health check failed'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}

// Export for backwards compatibility
export const dynamic = 'force-dynamic'