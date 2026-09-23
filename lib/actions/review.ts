"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markKeyPointReviewed(
  keyPointId: string,
  remembered: boolean,
): Promise<void> {
  const supabase = await createClient();

  if (remembered) {
    const { data } = await supabase
      .from("key_points")
      .select("review_count")
      .eq("id", keyPointId)
      .single();
    const nextCount = (data?.review_count ?? 0) + 1;
    await supabase
      .from("key_points")
      .update({ review_count: nextCount, last_reviewed_at: new Date().toISOString() })
      .eq("id", keyPointId);
  } else {
    await supabase
      .from("key_points")
      .update({ review_count: 0, last_reviewed_at: new Date().toISOString() })
      .eq("id", keyPointId);
  }

  revalidatePath("/review");
  revalidatePath("/", "layout");
}
