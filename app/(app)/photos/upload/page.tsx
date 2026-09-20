import MediaUploadForm from "@/components/MediaUploadForm";

export default function UploadPhotoPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Upload photo</h1>
      <MediaUploadForm kind="photo" />
    </div>
  );
}
