import MediaUploadForm from "@/components/MediaUploadForm";

export default function UploadVideoPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Upload video</h1>
      <MediaUploadForm kind="video" />
    </div>
  );
}
