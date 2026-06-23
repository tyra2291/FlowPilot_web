import { createContext, useContext, useState } from "react"

type FocusModeCtx = { focusMode: boolean; setFocusMode: (v: boolean) => void }
const FocusModeContext = createContext<FocusModeCtx>({ focusMode: false, setFocusMode: () => {} })

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [focusMode, setFocusMode] = useState(false)
  return <FocusModeContext.Provider value={{ focusMode, setFocusMode }}>{children}</FocusModeContext.Provider>
}

export const useFocusMode = () => useContext(FocusModeContext)
