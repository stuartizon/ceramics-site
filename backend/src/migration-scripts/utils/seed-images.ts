import { readFileSync } from "fs";
import { join } from "path";
import { MedusaContainer } from "@medusajs/framework";
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows";

// Dev/test fixture photos only - not the real production catalog images,
// which admins will upload themselves through the admin dashboard.
const SEED_IMAGES_DIR = join(__dirname, "..", "seed-images");

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  png: "image/png",
};

export async function uploadSeedImages(
  container: MedusaContainer,
  filenames: string[]
) {
  const { result } = await uploadFilesWorkflow(container).run({
    input: {
      files: filenames.map((filename) => ({
        filename,
        mimeType: MIME_TYPES_BY_EXTENSION[filename.split(".").pop()!],
        content: readFileSync(join(SEED_IMAGES_DIR, filename)).toString(
          "base64"
        ),
        access: "public",
      })),
    },
  });
  return result;
}
