import { model, models, type Model, type Schema } from "mongoose";

/**
 * Guards against Mongoose's "OverwriteModelError" across dev hot-reloads and
 * warm serverless invocations — the same one-line check `lead.ts` already
 * used inline (`models.Lead ?? model("Lead", leadSchema)`). Extracted here
 * per `ARCHITECTURE/19_CMS_FOUNDATION.md` §12 once a second model (`User`)
 * needed the identical guard, so it isn't retyped in every model file.
 */
export function defineModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (models[name] as Model<T>) ?? model<T>(name, schema);
}
