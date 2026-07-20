"use client";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onReset: () => void;
}

interface State {
  error: Error | null;
}

/**
 * 최소 구현 에러 바운더리.
 * useSuspenseQuery는 요청 실패 시 에러를 throw하므로, 가장 가까운 에러 바운더리에서 잡는다.
 * "다시 시도" 시 QueryErrorResetBoundary와 함께 쿼리 캐시를 리셋해 재요청하게 한다.
 */
class InnerBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  handleRetry = () => {
    this.props.onReset();
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="py-4 text-sm text-red-600">
          <p>에러: {this.state.error.message}</p>
          <button
            onClick={this.handleRetry}
            className="mt-2 cursor-pointer rounded-md border border-gray-300 px-3 py-1 text-neutral-900 hover:bg-gray-50"
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function BroadcastErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => <InnerBoundary onReset={reset}>{children}</InnerBoundary>}
    </QueryErrorResetBoundary>
  );
}
