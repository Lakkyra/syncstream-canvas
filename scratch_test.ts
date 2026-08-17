import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.storage.from("media").createSignedUploadUrl("test.mp4");
  console.log("DATA:", data);
  console.log("ERROR:", error);
}

test();
