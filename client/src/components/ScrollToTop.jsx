import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever the pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Immediate scroll for better UX
    });

    // Fallback for older browsers
    if (window.scrollY !== 0) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  return null;
} 