export interface SalesDataPoint {
  name: string
  sales: number
  revenue: number
  orders: number
}

export interface ProductDataPoint {
  name: string
  value: number
  color: string
}

export interface MetricData {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: string
    isPositive: boolean
  }
}

export interface AnalyticsData {
  salesData: SalesDataPoint[]
  productData: ProductDataPoint[]
  metrics: {
    overview: MetricData[]
    sales: MetricData[]
    products: MetricData[]
    customers: MetricData[]
  }
}