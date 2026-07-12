import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";
import { draftPublishStatusValues, workflowFields } from "@/models/shared/workflow-fields";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `CareerListing` collection
 * — with one deliberate, documented naming resolution flagged in the Phase D
 * report for founder review, not silently picked: that document's own block
 * for this collection reads `{ _id, title, description, requirements,
 * status: 'open' | 'closed' }` — a domain status (is this role still
 * accepting applicants), the same kind of "not a publish-lifecycle state"
 * field `Lead.status` already is. But `09_CMS_ARCHITECTURE.md` §2's own
 * workflow column says "Draft → Published" for Career Listings, and
 * `19_CMS_FOUNDATION.md` §11 explicitly maps it to `workflow:
 * "draft-publish"` alongside Testimonials/Services/FAQs — both
 * founder-approved documents, in tension with each other on this one field.
 *
 * Resolution: both concepts are real and both are kept, disambiguated by
 * name rather than picking one document over the other. `status` is the
 * standard `workflowFields()` draft/published lifecycle (so a listing goes
 * through the same review/version-history machinery every other collection
 * does before it's publicly visible); `listingStatus` is `11`'s open/closed
 * concept — whether a *published* listing is still accepting applicants.
 * Every field `11` names is preserved; nothing is invented, only the one
 * naming collision between two approved documents is resolved.
 */
const careerListingSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 8000 },
    requirements: { type: [String], default: [] },
    listingStatus: { type: String, required: true, enum: ["open", "closed"], default: "open" },
    ...workflowFields(draftPublishStatusValues),
  },
  { timestamps: true },
);

careerListingSchema.index({ status: 1, publishedAt: -1 });

export type CareerListingDocument = InferSchemaType<typeof careerListingSchema> & {
  _id: Types.ObjectId;
};

export const CareerListing = defineModel<CareerListingDocument>(
  "CareerListing",
  careerListingSchema,
);
