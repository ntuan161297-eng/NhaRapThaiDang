// apps/web/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lỗi ứng dụng chưa bắt được:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.hash = '';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-stone-200 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-stone-900">Đã xảy ra lỗi hiển thị</h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                Hệ thống ghi nhận sự cố tạm thời. Dữ liệu của quý khách vẫn an toàn. Vui lòng tải lại trang hoặc quay lại trang chủ.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-stone-100 rounded-xl text-left text-xs font-mono text-stone-600 max-h-32 overflow-y-auto">
                {this.state.error.message || 'Lỗi không xác định'}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải lại trang</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="py-3 px-4 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
