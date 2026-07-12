'use client'

import { type ReactNode, useState } from 'react'
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Users,
  Warehouse,
  UserCog,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAppStore, type Page } from '@/lib/store'
import AdminLogin from '@/components/admin/login'

interface NavItem {
  label: string
  icon: ReactNode
  page: Page
  superOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, page: 'admin-dashboard' },
  { label: 'Produk', icon: <Package className="w-5 h-5" />, page: 'admin-products' },
  { label: 'Penawaran', icon: <FileText className="w-5 h-5" />, page: 'admin-quotes' },
  { label: 'Pesanan', icon: <ShoppingCart className="w-5 h-5" />, page: 'admin-orders' },
  { label: 'Klien', icon: <Users className="w-5 h-5" />, page: 'admin-clients' },
  { label: 'Inventaris', icon: <Warehouse className="w-5 h-5" />, page: 'admin-inventory' },
  { label: 'Pengguna', icon: <UserCog className="w-5 h-5" />, page: 'admin-users', superOnly: true },
  { label: 'Pengaturan', icon: <Settings className="w-5 h-5" />, page: 'admin-settings', superOnly: true },
]

const pageTitles: Record<string, string> = {
  'admin-dashboard': 'Dashboard',
  'admin-products': 'Kelola Produk',
  'admin-products-form': 'Form Produk',
  'admin-quotes': 'Manajemen Penawaran',
  'admin-quote-detail': 'Detail Penawaran',
  'admin-orders': 'Manajemen Pesanan',
  'admin-order-detail': 'Detail Pesanan',
  'admin-clients': 'Client Management',
  'admin-clients-form': 'Form Klien',
  'admin-inventory': 'Inventaris Bahan Baku',
  'admin-inventory-form': 'Form Inventaris',
  'admin-users': 'Manajemen User',
  'admin-settings': 'Pengaturan',
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { currentPage, navigate, adminUser, logout } = useAppStore()

  const handleNav = (page: Page) => {
    navigate(page)
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-6 py-5">
        <img src="/logo.png" alt="Omamori Souvenir" className="h-8 w-auto object-contain" />
        <span className="text-lg font-bold text-[#333333]">Omamori Souvenir</span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          if (item.superOnly && adminUser?.role !== 'super_admin') return null
          const isActive = currentPage === item.page
          return (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#e8f5ee] text-[#00a651]'
                  : 'text-[#666666] hover:bg-[#f5f5f5] hover:text-[#333333]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-[#e0e0e0] pt-4">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#e8f5ee] flex items-center justify-center text-sm font-semibold text-[#00a651]">
            {adminUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#333333] truncate">{adminUser?.name}</p>
            <p className="text-xs text-[#999999]">{adminUser?.role === 'super_admin' ? 'Super Admin' : 'Staff'}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { currentPage, adminUser } = useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!adminUser) {
    return <AdminLogin />
  }

  const title = pageTitles[currentPage] || 'Admin'

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col corp-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-[#e0e0e0] shadow-sm">
            <Menu className="w-5 h-5 text-[#333333]" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-white border-r border-[#e0e0e0]">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigasi</SheetTitle>
          </SheetHeader>
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 corp-nav">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="pl-12 lg:pl-0">
              <h1 className="text-lg font-semibold text-[#333333]">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#666666] hidden sm:block">{adminUser.name}</span>
              <Badge variant={adminUser.role === 'super_admin' ? 'default' : 'secondary'}>
                {adminUser.role === 'super_admin' ? 'Super Admin' : 'Staff'}
              </Badge>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}