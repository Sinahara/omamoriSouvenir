'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex items-center justify-center min-h-[400px] px-4">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#333333]">Terjadi Kesalahan</h3>
            <p className="text-sm text-[#999999] max-w-sm mx-auto">
              Halaman ini mengalami error. Silakan coba lagi.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="border-[#eeeeee] text-[#666666] hover:text-[#333333] hover:bg-[#fafafa] rounded-[4px] text-[13px]"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Coba Lagi
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}