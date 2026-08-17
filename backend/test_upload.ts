import { supabase } from "./src/supabase";

async function test() {
  const { data, error } = await supabase.storage.from("media").createSignedUploadUrl("test_video.mp4");
  console.log("SIGNED URL:", data);

  const res = await fetch(data!.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Authorization": `Bearer ${data!.token}`,
    },
    body: "dummy data",
  });

  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);
}

test();
