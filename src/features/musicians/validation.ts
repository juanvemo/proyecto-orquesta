import { z } from "zod";

export const musicianSchema = z.object({
  first_name: z.string().trim().min(2, "Escribe el nombre"),
  last_name: z.string().trim().min(2, "Escribe los apellidos"),
  email: z.string().trim().email("Correo no válido").or(z.literal("")),
  document_number: z.string().trim(),
  phone: z.string().trim(),
  whatsapp: z.string().trim(),
  city: z.string().trim(),
  experience_years: z.string().refine((value) => !value || Number(value) >= 0, "La experiencia no puede ser negativa"),
  habitual_rate: z.string().refine((value) => Number(value) >= 0, "La tarifa no puede ser negativa"),
  event_rate: z.string().refine((value) => Number(value) >= 0, "La tarifa no puede ser negativa"),
  rehearsal_rate: z.string().refine((value) => Number(value) >= 0, "La tarifa no puede ser negativa"),
  instrument_ids: z.array(z.string()).min(1, "Selecciona al menos un instrumento"),
  role_ids: z.array(z.string()).min(1, "Selecciona al menos un rol musical"),
});
