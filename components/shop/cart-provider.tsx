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
  | { type: "ADD_ITEM"; payload: CartItem }
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

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0)
}

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
        const updatedItems = [...state.items, action.payload]
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        }
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
        // Fetch product details from API
        const res = await fetch("/api/medicines")
        const json = await res.json()
        const medicines = json.medicines || []
        const med = medicines.find((m: any) => (m.id || m._id) === productId)

        if (!med) {
          throw new Error("Product not found")
        }

        const newItem: CartItem = {
          productId: med.id || med._id,
          name: med.name,
          price: 0,
          quantity: Math.min(quantity, med.quantity || 0),
          imageUrl: med.imageUrls?.[0] || "/placeholder.svg",
          inStock: med.quantity || 0,
        }

        dispatch({ type: "ADD_ITEM", payload: newItem })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      throw error
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      dispatch({ type: "REMOVE_ITEM", payload: { productId } })
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
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      throw error
    }
  }

  const clearCart = async () => {
    try {
      dispatch({ type: "CLEAR_CART" })
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
