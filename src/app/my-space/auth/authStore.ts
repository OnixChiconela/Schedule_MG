import { create } from "zustand";
import api from "@/app/api/api";
import { z } from "zod";
import toast from "react-hot-toast";
import { saveTokenAndUserToStorage } from "@/app/api/actions/user/saveTokenAndUserToStorage";
import { User } from "@/app/types/back-front";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  hashedPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = loginSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

interface AuthState {
  mode: "login" | "register" | "forgot-password";
  email: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  error: string | null;
  fieldErrors: Partial<Record<"email" | "hashedPassword" | "firstName" | "lastName", string>>;
  loading: boolean;
  setMode: (mode: "login" | "register" | "forgot-password") => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setError: (error: string | null) => void;
  setFieldErrors: (errors: Partial<Record<"email" | "hashedPassword" | "firstName" | "lastName", string>>) => void;
  submit: (setCurrentUser: (user: User | null) => void) => Promise<boolean>;
  reset: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  mode: "login",
  email: "",
  hashedPassword: "",
  firstName: "",
  lastName: "",
  error: null,
  fieldErrors: {},
  loading: false,
  setMode: (mode) => set({ mode, email: "", hashedPassword: "", firstName: "", lastName: "", error: null, fieldErrors: {} }),
  setEmail: (email) => set({ email, fieldErrors: { ...get().fieldErrors, email: undefined } }),
  setPassword: (hashedPassword) => set({ hashedPassword, fieldErrors: { ...get().fieldErrors, hashedPassword: undefined } }),
  setFirstName: (firstName) => set({ firstName, fieldErrors: { ...get().fieldErrors, firstName: undefined } }),
  setLastName: (lastName) => set({ lastName, fieldErrors: { ...get().fieldErrors, lastName: undefined } }),
  setError: (error) => set({ error }),
  setFieldErrors: (fieldErrors) => set({ fieldErrors }),
  submit: async (setCurrentUser) => {
    const { mode, email, hashedPassword, firstName, lastName, setError, setFieldErrors } = get();
    set({ loading: true, error: null, fieldErrors: {} });

    const toastId = toast.loading(
      mode === "login" ? "Signing in..." : mode === "register" ? "Creating account..." : "Sending reset link..."
    );

    try {
      const schema = mode === "register" ? registerSchema : mode === "forgot-password" ? forgotPasswordSchema : loginSchema;
      const data = mode === "register"
        ? { email, hashedPassword, firstName, lastName }
        : mode === "forgot-password"
        ? { email }
        : { email, hashedPassword };

      schema.parse(data);

      const endpoint = mode === "register"
        ? "/users/create-user"
        : mode === "forgot-password"
        ? "/auth/forgot-password"
        : "/auth/login";

      const response = await api.post(endpoint, data, { withCredentials: true });
      // console.log("Auth response:", response.data);

      if (mode === "login") {
        const { user, token, refreshToken } = response.data;
        // console.log(user, " ", token, " ", refreshToken)
        await saveTokenAndUserToStorage(token, user, refreshToken);
        setCurrentUser(user);
        toast.success("Signed in successfully!", { id: toastId });
      } else if (mode === "forgot-password") {
        setError(response.data.message || "Password reset email sent");
        toast.success("Password reset email sent!", { id: toastId });
        set({ loading: false });
        return true;
      } else if (mode === "register") {
        // Login automático após registro
        const loginResponse = await api.post("/auth/login", { email, hashedPassword }, { withCredentials: true });
        // console.log("Login response after register:", loginResponse.data);
        const { user, token, refreshToken } = loginResponse.data;
        await saveTokenAndUserToStorage(token, user,refreshToken);
        setCurrentUser(user);
        toast.success("Account created and signed in!", { id: toastId });
        set({ loading: false });
        return true;
      }

      set({ loading: false });
      return true;
    } catch (err: any) {
      // console.error("Auth error:", err);
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<"email" | "hashedPassword" | "firstName" | "lastName", string>> = {};
        err.errors.forEach((e) => {
          if (e.path[0] in fieldErrors) {
            fieldErrors[e.path[0] as keyof typeof fieldErrors] = e.message;
          }
        });
        setFieldErrors(fieldErrors);
        setError("Please correct the errors below");
        toast.error("Please correct the errors below", { id: toastId });
      } else {
        const errorMessage = err.response?.data?.message || `An error occurred during ${mode}`;
        setError(errorMessage);
        toast.error(errorMessage, { id: toastId });
      }
      set({ loading: false });
      return false;
    }
  },
  reset: () => set({ email: "", hashedPassword: "", firstName: "", lastName: "", error: null, fieldErrors: {} }),
}));

export default useAuthStore;