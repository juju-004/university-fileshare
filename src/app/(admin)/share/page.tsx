"use client";
import ComponentCard from "@/components/common/ComponentCard";
import MultiSelect from "@/components/form/MultiSelect";
import GetIcon from "@/components/GetIcon";
import Button from "@/components/ui/button/Button";
import { useSession } from "@/context/SessionContext";
import { bytesToSize, filterError } from "@/lib/helpers";
import axios from "axios";
import { UploadIcon } from "lucide-react";
import React, { useEffect, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const Upload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const session = useSession();
  const [universities, setUniversities] = useState<string[]>([]);

  const handleUpload = async () => {
    if (files.length === 0) return toast.error("No files selected");

    startTransition(async () => {
      const sender = session?.shortcode ?? "";
      const receivers = selectedValues.join(",");

      // your state update or logic
      const formData = new FormData();
      console.log(files);

      formData.append("sender", sender);
      formData.append("receivers", receivers);
      files.forEach((file) => formData.append("files", file));

      try {
        await axios.post("/api/upload", formData);

        toast.success(`File(s) sent successfully`);
        setFiles([]);
      } catch (error) {
        toast.error(filterError(error));
        return;
      }
    });
  };
  const fetchUnis = async () => {
    try {
      const res = await axios.get("/api/universities");

      const otherShortcodes = res.data.shortcodes.filter(
        (code: string) => code !== session?.shortcode
      );
      setUniversities(otherShortcodes);
    } catch (error) {
      toast.error(filterError(error));
    }
  };

  useEffect(() => {
    fetchUnis();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files: File[]) => setFiles((prev: File[]) => [...files, ...prev]),
  });
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
          <form
            {...getRootProps()}
            className={`dropzone rounded-xl   border-dashed border-gray-300 p-7 lg:p-10
        ${
          isDragActive
            ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
            : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
        }
      `}
            id="demo-upload"
          >
            {/* Hidden Input */}
            <input {...getInputProps()} />

            <div className="dz-message flex flex-col items-center m-0!">
              {/* Icon Container */}
              <div className="mb-[22px] flex justify-center">
                <div className="flex h-[68px] w-[68px]  items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <UploadIcon />
                </div>
              </div>

              {/* Text Content */}
              <h4 className="mb-3 text-gray-800 text-theme-xl dark:text-white/90">
                {isDragActive
                  ? "Drop Files Here"
                  : "Drag & Drop Files Here or Click to select files"}
              </h4>
            </div>
          </form>
        </div>

        <ComponentCard title="Receiver(s)">
          <div className="relative">
            <MultiSelect
              options={universities}
              disabled={universities.length === 0}
              onChange={(values) => setSelectedValues(values)}
            />
          </div>
        </ComponentCard>
      </div>
      <div className="xl:col-span-1 space-y-6 ">
        <ComponentCard
          title={
            <div className="flex items-center justify-between">
              <span>File(s) Chosen</span>
              <button
                className="border border-gray-700 active:opacity-55 duration-150 px-5 py-1 rounded-lg"
                onClick={() => setFiles([])}
              >
                Clear
              </button>
            </div>
          }
        >
          {files.length ? (
            <ul className="space-y-1 text-sm ">
              {files.map((file) => (
                <li
                  key={file.name}
                  className="flex overflow-hidden text-black dark:text-white border-b border-gray-100 px-2 py-3 dark:border-gray-800 items-center gap-2"
                >
                  <GetIcon filename={file.name} size={20} />
                  <span className="whitespace-nowrap flex-1 overflow-hidden text-ellipsis">
                    {file.name}
                  </span>
                  <span className="whitespace-nowrap">
                    {bytesToSize(file.size)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="dark:text-gray-500">No files selected</span>
          )}
        </ComponentCard>
        <Button
          disabled={
            files.length < 1 || isPending || selectedValues.length < 1
              ? true
              : false
          }
          className="w-full"
          onClick={handleUpload}
        >
          {isPending ? "Sharing..." : "Share"}
        </Button>
      </div>
    </div>
  );
};

export default Upload;
