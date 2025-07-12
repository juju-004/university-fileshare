import {
  File,
  FileText,
  FolderArchiveIcon,
  Image,
  PlayCircle,
} from "lucide-react";
const GetIcon = ({ filename, size }: { filename: string; size: number }) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return <File size={size} className="w-4 h-4" />;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
    return <Image size={size} className="w-4 h-4 text-green-600" />;
  if (["mp4", "avi", "mkv", "mov"].includes(ext))
    return <PlayCircle size={size} className="w-4 h-4 text-blue-700" />;
  if (["zip", "rar", "7z"].includes(ext))
    return (
      <FolderArchiveIcon size={size} className="w-4 h-4 text-orange-400" />
    );
  if (["pdf", "doc", "docx", "txt"].includes(ext))
    return <FileText size={size} className="w-4 h-4 text-blue-500" />;
  return <File size={size} className="w-4 h-4" />;
};

export default GetIcon;
