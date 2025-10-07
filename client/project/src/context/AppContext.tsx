import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem, Product, User } from '../types';
import { authService } from '../services/authService';
import { userService, DeliveryAddress } from '../services/userService';

interface AppState {
  cart: CartItem[];
  user: User | null;
  isAuthenticated: boolean;
  wishlist: string[];
  recentlyViewed: string[];
  deliveryAddress: DeliveryAddress | null;
  redirectPath: string | null;
  authLoading: boolean;
  isInitialized: boolean; // Add this to track if we've loaded persisted data
}

type AppAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TO_WISHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_WISHLIST'; payload: string[] }
  | { type: 'ADD_TO_RECENTLY_VIEWED'; payload: string }
  | { type: 'SET_DELIVERY_ADDRESS'; payload: DeliveryAddress | null }
  | { type: 'SET_REDIRECT_PATH'; payload: string | null }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'INITIALIZE_PERSISTED_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  cart: [],
  user: null,
  isAuthenticated: false,
  wishlist: [],
  recentlyViewed: [],
  deliveryAddress: null,
  redirectPath: null,
  authLoading: true,
  isInitialized: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.product.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.payload, quantity: 1 }],
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.product.id !== action.payload),
      };

    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        authLoading: false,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        cart: [], // Clear cart on logout
        deliveryAddress: null,
        authLoading: false,
        // Keep wishlist and recentlyViewed - they should persist across sessions
      };

    case 'ADD_TO_WISHLIST':
      if (state.wishlist.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
      };

    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(id => id !== action.payload),
      };

    case 'SET_WISHLIST':
      return {
        ...state,
        wishlist: action.payload,
      };

    case 'ADD_TO_RECENTLY_VIEWED':
      const filtered = state.recentlyViewed.filter(id => id !== action.payload);
      return {
        ...state,
        recentlyViewed: [action.payload, ...filtered].slice(0, 10), // Keep only last 10
      };

    case 'SET_DELIVERY_ADDRESS':
      return {
        ...state,
        deliveryAddress: action.payload,
      };

    case 'SET_REDIRECT_PATH':
      return {
        ...state,
        redirectPath: action.payload,
      };

    case 'SET_AUTH_LOADING':
      return {
        ...state,
        authLoading: action.payload,
      };

    case 'INITIALIZE_PERSISTED_STATE':
      return {
        ...state,
        ...action.payload,
        isInitialized: true,
      };

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted state from localStorage immediately on mount
  useEffect(() => {
    const loadPersistedState = () => {
      try {
        console.log('Loading persisted state...');
        
        const persistedCart = localStorage.getItem('optimizi_cart');
        const persistedWishlist = localStorage.getItem('optimizi_wishlist');
        const persistedRecentlyViewed = localStorage.getItem('optimizi_recently_viewed');

        console.log('Raw localStorage data:', {
          cart: persistedCart,
          wishlist: persistedWishlist,
          recentlyViewed: persistedRecentlyViewed
        });

        const persistedState: Partial<AppState> = {};

        if (persistedCart) {
          try {
            persistedState.cart = JSON.parse(persistedCart);
            console.log('Parsed cart:', persistedState.cart);
          } catch (e) {
            console.error('Error parsing cart from localStorage:', e);
          }
        }

        if (persistedWishlist) {
          try {
            persistedState.wishlist = JSON.parse(persistedWishlist);
            console.log('Parsed wishlist:', persistedState.wishlist);
          } catch (e) {
            console.error('Error parsing wishlist from localStorage:', e);
          }
        }

        if (persistedRecentlyViewed) {
          try {
            persistedState.recentlyViewed = JSON.parse(persistedRecentlyViewed);
            console.log('Parsed recently viewed:', persistedState.recentlyViewed);
          } catch (e) {
            console.error('Error parsing recently viewed from localStorage:', e);
          }
        }

        // Always dispatch to mark as initialized, even if no data
        dispatch({ type: 'INITIALIZE_PERSISTED_STATE', payload: persistedState });
        console.log('Persisted state loaded:', persistedState);
      } catch (error) {
        console.error('Error loading persisted state:', error);
        // Still mark as initialized even if there's an error
        dispatch({ type: 'INITIALIZE_PERSISTED_STATE', payload: {} });
      }
    };

    loadPersistedState();
  }, []); // Run only once on mount

  // Initialize Firebase auth listener with role validation
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Validate that user has client role
          const hasClientAccess = await authService.validateClientAccess(firebaseUser.uid);
          
          if (!hasClientAccess) {
            console.warn('User does not have client access, signing out');
            await authService.signOut();
            dispatch({ type: 'SET_AUTH_LOADING', payload: false });
            return;
          }

          const userData = await authService.getUserData(firebaseUser.uid);
          if (userData) {
            dispatch({ type: 'SET_USER', payload: userData });
            
            // Load user's delivery address
            const deliveryAddress = await userService.getDeliveryAddress(firebaseUser.uid);
            if (deliveryAddress) {
              dispatch({ type: 'SET_DELIVERY_ADDRESS', payload: deliveryAddress });
            }
          } else {
            dispatch({ type: 'SET_AUTH_LOADING', payload: false });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => unsubscribe();
  }, []);

  // Persist cart to localStorage (only after initialization)
  useEffect(() => {
    if (!state.isInitialized) return;
    
    try {
      console.log('Persisting cart to localStorage:', state.cart);
      localStorage.setItem('optimizi_cart', JSON.stringify(state.cart));
    } catch (error) {
      console.error('Error persisting cart:', error);
    }
  }, [state.cart, state.isInitialized]);

  // Persist wishlist to localStorage (only after initialization)
  useEffect(() => {
    if (!state.isInitialized) return;
    
    try {
      console.log('Persisting wishlist to localStorage:', state.wishlist);
      localStorage.setItem('optimizi_wishlist', JSON.stringify(state.wishlist));
    } catch (error) {
      console.error('Error persisting wishlist:', error);
    }
  }, [state.wishlist, state.isInitialized]);

  // Persist recently viewed to localStorage (only after initialization)
  useEffect(() => {
    if (!state.isInitialized) return;
    
    try {
      console.log('Persisting recently viewed to localStorage:', state.recentlyViewed);
      localStorage.setItem('optimizi_recently_viewed', JSON.stringify(state.recentlyViewed));
    } catch (error) {
      console.error('Error persisting recently viewed:', error);
    }
  }, [state.recentlyViewed, state.isInitialized]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}