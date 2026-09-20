import { NextRequest, NextResponse } from "next/server";
import { generateObjectKey, getUploadUrl } from "@/lib/storage";

const KIND_CONFIG = {
  video: { prefix: "videos", mimePrefix: "video/" },
  photo: { prefix: "photos", mimePrefix: "image/" },
} as const;

type Kind = keyof typeof KIND_CONFIG;

export async function POST(request: NextRequest) {
  const { filename, contentType, kind } = (await request.json()) as {
    filename?: string;
    contentType?: string;
    kind?: string;
  };

  if (!filename || !contentType || !kind || !(kind in KIND_CONFIG)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const config = KIND_CONFIG[kind as Kind];
  if (!contentType.startsWith(config.mimePrefix)) {
    return NextResponse.json(
      { error: `Expected a ${config.mimePrefix}* file` },
      { status: 400 }
    );
  }

  const key = generateObjectKey(config.prefix, filename);
  const url = await getUploadUrl(key, contentType);

  return NextResponse.json({ url, key });
}
