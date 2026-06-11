import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-4 rounded border border-danger/30 bg-danger/5 p-8 text-center"
        >
          <AlertTriangle className="h-12 w-12 text-danger" aria-hidden />
          <div>
            <h2 className="text-lg font-semibold text-fg">出现错误</h2>
            <p className="mt-1 text-sm text-fg-muted">
              {this.state.error?.message ?? '未知错误'}
            </p>
          </div>
          <Button variant="secondary" onClick={this.handleReset} icon={<RefreshCw className="h-4 w-4" />}>
            重试
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
