/**
 * Ambient module declaration for @umijs/max.
 *
 * UMI generates the real type file inside src/.umi/ at dev/build time.
 * This file provides IDE type-checking when that generated folder does not
 * exist (e.g. after a fresh clone or Docker-only workflow).
 *
 * It re-exports the same symbols that UMI exposes at runtime.
 */
declare module '@umijs/max' {
  // ─── React Router v6 ────────────────────────────────────────────────────────
  export {
    useNavigate,
    useLocation,
    useParams,
    useSearchParams,
    useMatch,
    useOutlet,
    useOutletContext,
    Link,
    NavLink,
    Outlet,
    Navigate,
    Route,
    Routes,
  } from 'react-router-dom';

  // ─── UMI history helpers ─────────────────────────────────────────────────────
  export function history(): import('history').History;

  // ─── UMI model / initial state ───────────────────────────────────────────────
  export function useModel(namespace: string, selector?: (model: any) => any): any;
  export function useAccess(): Record<string, boolean>;
  export function getLocale(): string;
  export function setLocale(locale: string, realReload?: boolean): void;
  export function useIntl(): { formatMessage: (descriptor: { id: string }, values?: Record<string, any>) => string };

  // ─── Misc re-exports from React ──────────────────────────────────────────────
  export { default as React } from 'react';
}
