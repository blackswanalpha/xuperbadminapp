
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UIState {
    isSidebarOpen: boolean
    toggleSidebar: () => void
    setSidebarOpen: (isOpen: boolean) => void
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isSidebarOpen: true, // Default open
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
        }),
        {
            name: 'ui-storage',
            storage: createJSONStorage(() => localStorage), // Persist UI preferences
        },
    ),
)
