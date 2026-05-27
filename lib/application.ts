import { z } from "zod";

export const applicationSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя"),
  phone: z.string().trim().min(5, "Укажите телефон"),
  telegram: z.string().trim().optional(),
  region: z.string().trim().min(2, "Укажите регион"),
  comment: z.string().trim().optional(),
  source: z.enum(["quick", "contacts"]),
});

export type ApplicationPayload = z.infer<typeof applicationSchema>;

export const applicationSourceLabels: Record<
  ApplicationPayload["source"],
  string
> = {
  quick: "Быстрая заявка",
  contacts: "Заявка (контакты)",
};
