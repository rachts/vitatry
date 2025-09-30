"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  inStock: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { productId: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState }

interface CartContextType {
  state: CartState
  addToCart: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getCartTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.productId === action.payload.productId)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: Math.min(item.quantity + action.payload.quantity, item.inStock) }
            : item,
        )
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        }
      } else {
        // We'll need to fetch product details from the API
        return state // This will be handled in the addToCart function
      }
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => item.productId !== action.payload.productId)
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems),
      }
    }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items
        .map((item) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: Math.max(0, Math.min(action.payload.quantity, item.inStock)) }
            : item,
        )
        .filter((item) => item.quantity > 0)

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems),
      }
    }

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        itemCount: 0,
      }

    case "LOAD_CART":
      return action.payload

    default:
      return state
  }
}

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0)
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("vitamend-cart")
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: cartData })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("vitamend-cart", JSON.stringify(state))
  }, [state])

  const addToCart = async (productId: string, quantity: number) => {
    try {
      // Check if item already exists in cart
      const existingItem = state.items.find((item) => item.productId === productId)

      if (existingItem) {
        dispatch({
          type: "UPDATE_QUANTITY",
          payload: { productId, quantity: existingItem.quantity + quantity },
        })
      } else {
        // Fetch product details
        const response = await fetch(`/api/shop/products/${productId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch product details")
        }

        const product = await response.json()

        const newItem: CartItem = {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: Math.min(quantity, product.inStock),
          imageUrl: product.imageUrl,
          inStock: product.inStock,
        }

        const updatedItems = [...state.items, newItem]
        dispatch({
          type: "LOAD_CART",
          payload: {
            items: updatedItems,
            total: calculateTotal(updatedItems),
            itemCount: calculateItemCount(updatedItems),
          },
        })
      }

      // Sync with server
      await fetch("/api/shop/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      throw error
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      dispatch({ type: "REMOVE_ITEM", payload: { productId } })

      // Sync with server
      await fetch("/api/shop/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
    } catch (error) {
      console.error("Error removing from cart:", error)
      throw error
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId)
      } else {
        dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } })

        // Sync with server
        await fetch("/api/shop/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        })
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      throw error
    }
  }

  const clearCart = async () => {
    try {
      dispatch({ type: "CLEAR_CART" })

      // Sync with server
      await fetch("/api/shop/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      })
    } catch (error) {
      console.error("Error clearing cart:", error)
      throw error
    }
  }

  const getCartTotal = () => state.total
  const getItemCount = () => state.itemCount

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
