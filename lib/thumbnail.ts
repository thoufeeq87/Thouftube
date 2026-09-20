import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { getDownloadUrl, uploadObject } from "@/lib/storage";

const execFileAsync = promisify(execFile);

/**
 * Extracts a frame from the video at `videoObjectKey` and uploads it as a
 * jpg thumbnail. Reads the video directly from a presigned R2 URL, so ffmpeg
 * never needs the full file on disk. Best-effort: callers should not fail
 * the whole request if this throws.
 */
export async function generateVideoThumbnail(videoObjectKey: string): Promise<string> {
  const sourceUrl = await getDownloadUrl(videoObjectKey);
  const workDir = await mkdtemp(path.join(tmpdir(), "thouftube-thumb-"));
  const outputPath = path.join(workDir, "thumb.jpg");

  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-ss",
      "1",
      "-i",
      sourceUrl,
      "-frames:v",
      "1",
      "-vf",
      "scale=480:-1",
      outputPath,
    ]);

    const thumbnailBuffer = await readFile(outputPath);
    const thumbnailKey = `thumbnails/${path.basename(videoObjectKey, path.extname(videoObjectKey))}.jpg`;
    await uploadObject(thumbnailKey, thumbnailBuffer, "image/jpeg");
    return thumbnailKey;
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
