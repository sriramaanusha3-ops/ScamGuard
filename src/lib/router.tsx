import { createContext, useContext, useState, type ReactNode } from 'react';

type Route =
  | '/'
  | '/analyze'
  | '/upload'
  | '/company'
  | '/recruiter'
  | '/chat'
  | '/history'
  | '/settings'
  | '/patterns'
  | '/resume'
  | '/salary'
  | '/job-analyzer'
  | '/certificates'
  | '/compare'
  | '/auth';

interface RouterContextValue {
  currentRoute: Route;
  navigate: (route: Route) => void;
}

const RouterContext = createContext<RouterContextValue>({
  currentRoute: '/',
  navigate: () => {},
});

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<Route>('/');

  const navigate = (route: Route) => setCurrentRoute(route);

  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function useNavigate() {
  const { navigate } = useRouter();
  return navigate;
}

interface NavLinkProps {
  to: Route;
  children: ReactNode;
  className?: string | ((props: { isActive: boolean }) => string);
  onClick?: () => void;
}

export function NavLink({ to, children, className, onClick }: NavLinkProps) {
  const { currentRoute, navigate } = useRouter();
  const isActive = currentRoute === to || (to !== '/' && currentRoute.startsWith(to));

  const resolvedClass =
    typeof className === 'function' ? className({ isActive }) : className;

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
        onClick?.();
      }}
      className={resolvedClass}
    >
      {children}
    </a>
  );
}

interface LinkProps {
  to: Route;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Link({ to, children, className, onClick }: LinkProps) {
  const { navigate } = useRouter();
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
        onClick?.();
      }}
      className={className}
    >
      {children}
    </a>
  );
}
