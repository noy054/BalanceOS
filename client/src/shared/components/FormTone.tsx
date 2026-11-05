import { createContext, ReactNode, useContext } from "react";

export type FormTone = "surface" | "glass";

const FormToneContext = createContext<FormTone>("surface");

export function FormToneProvider({ tone, children }: { tone: FormTone; children: ReactNode }) {
  return <FormToneContext.Provider value={tone}>{children}</FormToneContext.Provider>;
}

export function useFormTone() {
  return useContext(FormToneContext);
}
