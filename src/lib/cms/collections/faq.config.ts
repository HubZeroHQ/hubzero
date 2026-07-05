import {
  faqEmptyStateMessage,
  faqFilters,
  faqFormFields,
  faqListColumns,
  faqSchema,
  type FaqInput,
} from "@/lib/cms/collections/faq-fields";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import { Faq, type FaqDocument } from "@/models/faq";

export const faqConfig = registerCollection(
  defineCollection<FaqDocument, FaqInput>({
    resource: "faq",
    label: "FAQs",
    model: Faq,
    zodSchema: faqSchema,
    workflow: "draft-publish",
    listColumns: faqListColumns,
    filters: faqFilters,
    formFields: faqFormFields,
    searchableFields: ["question", "category"],
    emptyStateMessage: faqEmptyStateMessage,
    studioBasePath: "faqs",
    recordLabel: (doc) => doc.question,
    revalidatesPaths: () => [],
  }),
);
