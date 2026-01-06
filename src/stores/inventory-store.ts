import { create } from 'zustand'
import {
    fetchInventoryItems,
    fetchParts,
    fetchStockUsage,
    fetchInventorySuppliers,
    fetchStockUsageStats,
    fetchSupplierStats,
} from '@/lib/api'
import {
    InventoryItem,
    Part,
    StockUsage,
    InventorySupplier,
    InventoryFilters,
    PartsFilters,
    StockUsageFilters,
    StockUsageStats,
    SupplierStats,
} from '@/types/inventory-api'

interface PaginationState {
    currentPage: number
    totalPages: number
    totalCount: number
    pageSize: number
}

interface DataSlice<T> extends PaginationState {
    data: T[]
    loading: boolean
    error: string | null
    lastFetched: number | null // timestamp
}

interface InventoryStoreState {
    // Vehicle inventory
    vehicles: DataSlice<InventoryItem>

    // Parts
    parts: DataSlice<Part>

    // Stock Usage
    stockUsage: DataSlice<StockUsage>
    stockUsageStats: StockUsageStats | null

    // Suppliers
    suppliers: DataSlice<InventorySupplier>
    supplierStats: SupplierStats | null

    // Actions
    fetchVehicles: (page: number, pageSize: number, filters?: InventoryFilters) => Promise<void>
    fetchParts: (page: number, pageSize: number, filters?: PartsFilters) => Promise<void>
    fetchStockUsage: (page: number, pageSize: number, filters?: StockUsageFilters) => Promise<void>
    fetchSuppliers: (page: number, pageSize: number) => Promise<void>

    // Reset actions
    resetVehicles: () => void
    resetParts: () => void
    resetStockUsage: () => void
    resetSuppliers: () => void

    // Utility
    setVehiclesPage: (page: number) => void
    setPartsPage: (page: number) => void
    setStockUsagePage: (page: number) => void
    setSuppliersPage: (page: number) => void
}

const initialDataSlice = <T>(pageSize: number): DataSlice<T> => ({
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    pageSize,
})

// Retry wrapper for API calls
async function withRetry<T>(
    fn: () => Promise<T>,
    retries: number = 2,
    delay: number = 1000
): Promise<T> {
    let lastError: Error | unknown

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)))
            }
        }
    }

    throw lastError
}

export const useInventoryStore = create<InventoryStoreState>()((set, get) => ({
    // Initial state
    vehicles: initialDataSlice<InventoryItem>(10),
    parts: initialDataSlice<Part>(10),
    stockUsage: initialDataSlice<StockUsage>(10),
    stockUsageStats: null,
    suppliers: initialDataSlice<InventorySupplier>(6),
    supplierStats: null,

    // Fetch vehicles
    fetchVehicles: async (page, pageSize, filters) => {
        const state = get()

        // Skip if already loading
        if (state.vehicles.loading) return

        set(s => ({
            vehicles: { ...s.vehicles, loading: true, error: null }
        }))

        try {
            const response = await withRetry(() => fetchInventoryItems(filters, page, pageSize))

            const totalCount = response.count || 0
            const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

            set({
                vehicles: {
                    data: response.results || [],
                    loading: false,
                    error: null,
                    lastFetched: Date.now(),
                    currentPage: page,
                    totalPages,
                    totalCount,
                    pageSize,
                }
            })
        } catch (error) {
            console.error('Error fetching vehicles:', error)
            set(s => ({
                vehicles: {
                    ...s.vehicles,
                    loading: false,
                    error: 'Failed to load vehicle inventory. Please try again.',
                }
            }))
        }
    },

    // Fetch parts
    fetchParts: async (page, pageSize, filters) => {
        const state = get()
        if (state.parts.loading) return

        set(s => ({
            parts: { ...s.parts, loading: true, error: null }
        }))

        try {
            const response = await withRetry(() => fetchParts(filters, page, pageSize))

            const totalCount = response.count || 0
            const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

            set({
                parts: {
                    data: response.results || [],
                    loading: false,
                    error: null,
                    lastFetched: Date.now(),
                    currentPage: page,
                    totalPages,
                    totalCount,
                    pageSize,
                }
            })
        } catch (error) {
            console.error('Error fetching parts:', error)
            set(s => ({
                parts: {
                    ...s.parts,
                    loading: false,
                    error: 'Failed to load parts inventory. Please try again.',
                }
            }))
        }
    },

    // Fetch stock usage
    fetchStockUsage: async (page, pageSize, filters) => {
        const state = get()
        if (state.stockUsage.loading) return

        set(s => ({
            stockUsage: { ...s.stockUsage, loading: true, error: null }
        }))

        try {
            const [usageResponse, statsResponse] = await Promise.all([
                withRetry(() => fetchStockUsage(filters, page, pageSize)),
                withRetry(() => fetchStockUsageStats()),
            ])

            const totalCount = usageResponse.count || 0
            const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

            set({
                stockUsage: {
                    data: usageResponse.results || [],
                    loading: false,
                    error: null,
                    lastFetched: Date.now(),
                    currentPage: page,
                    totalPages,
                    totalCount,
                    pageSize,
                },
                stockUsageStats: statsResponse,
            })
        } catch (error) {
            console.error('Error fetching stock usage:', error)
            set(s => ({
                stockUsage: {
                    ...s.stockUsage,
                    loading: false,
                    error: 'Failed to load stock usage data. Please try again.',
                }
            }))
        }
    },

    // Fetch suppliers
    fetchSuppliers: async (page, pageSize) => {
        const state = get()
        if (state.suppliers.loading) return

        set(s => ({
            suppliers: { ...s.suppliers, loading: true, error: null }
        }))

        try {
            const [suppliersResponse, statsResponse] = await Promise.all([
                withRetry(() => fetchInventorySuppliers(page, pageSize)),
                withRetry(() => fetchSupplierStats()),
            ])

            const totalCount = suppliersResponse.count || 0
            const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

            set({
                suppliers: {
                    data: suppliersResponse.results || [],
                    loading: false,
                    error: null,
                    lastFetched: Date.now(),
                    currentPage: page,
                    totalPages,
                    totalCount,
                    pageSize,
                },
                supplierStats: statsResponse,
            })
        } catch (error) {
            console.error('Error fetching suppliers:', error)
            set(s => ({
                suppliers: {
                    ...s.suppliers,
                    loading: false,
                    error: 'Failed to load suppliers data. Please try again.',
                }
            }))
        }
    },

    // Reset actions
    resetVehicles: () => set({ vehicles: initialDataSlice<InventoryItem>(10) }),
    resetParts: () => set({ parts: initialDataSlice<Part>(10) }),
    resetStockUsage: () => set({ stockUsage: initialDataSlice<StockUsage>(10) }),
    resetSuppliers: () => set({ suppliers: initialDataSlice<InventorySupplier>(6) }),

    // Page setters
    setVehiclesPage: (page) => set(s => ({
        vehicles: { ...s.vehicles, currentPage: page }
    })),
    setPartsPage: (page) => set(s => ({
        parts: { ...s.parts, currentPage: page }
    })),
    setStockUsagePage: (page) => set(s => ({
        stockUsage: { ...s.stockUsage, currentPage: page }
    })),
    setSuppliersPage: (page) => set(s => ({
        suppliers: { ...s.suppliers, currentPage: page }
    })),
}))
