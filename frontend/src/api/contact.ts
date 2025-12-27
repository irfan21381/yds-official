import { api } from "@/lib/api";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export const submitContactForm = async (data: ContactFormData) => {
  const response = await api.post("/contact", data);
  return response.data;
};
