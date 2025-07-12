import { Download, Trash2 } from "lucide-react";
import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { bytesToSize, filterError, formatDate } from "@/lib/helpers";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { toast } from "sonner";
import axios from "axios";
import { useSession } from "@/context/SessionContext";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import GetIcon from "@/components/GetIcon";

// Define the TypeScript interface for the table rows
interface FileHistory {
  _id: string;
  url: string;
  public_id: string;
  originalName: string;
  sender: string;
  receivers: string;
  size: number;
  zippedFiles: string[];
  uploadedAt: Date;
}

function FileList({ getStats }: { getStats: () => void }) {
  const [selected, setSelected] = useState<
    "optionOne" | "optionTwo" | "optionThree"
  >("optionOne");
  const session = useSession();
  const errorModal = useModal();
  const [files, setFiles] = useState<FileHistory[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isPending2, startTransition2] = useTransition();
  const [deletingFile, setDeletingFile] = useState<{
    name: string;
    id: string;
  } | null>(null);

  const getFileHistory = () => {
    startTransition(async () => {
      try {
        const { data } = await axios.get(`/api/files/${session?.shortcode}`);
        setFiles(data as FileHistory[]);
      } catch (error: unknown) {
        toast.error(filterError(error));
      }
      return;
    });
  };

  const deleteFile = () => {
    startTransition2(async () => {
      if (!deletingFile) return;
      try {
        const res = await axios.delete("/api/files/delete", {
          data: { public_id: deletingFile.id },
        });

        if (res.data?.success) {
          errorModal.closeModal();
          toast.success("Deleted Successfully");
          getFileHistory();
          getStats();
        }
      } catch (error: unknown) {
        toast.error(filterError(error));
      }
      return;
    });
  };
  const getButtonClass = (option: "optionOne" | "optionTwo" | "optionThree") =>
    selected === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  const filteredFiles = files.filter((f) => {
    if (selected === "optionTwo") return f.sender === session?.shortcode;
    if (selected === "optionThree")
      return f.receivers.includes(session?.shortcode as string);
    return true;
  });

  useEffect(() => {
    getFileHistory();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex max-w-[400px] w-full mx-auto items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
        <button
          onClick={() => setSelected("optionOne")}
          className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass(
            "optionOne"
          )}`}
        >
          All
        </button>

        <button
          onClick={() => setSelected("optionTwo")}
          className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass(
            "optionTwo"
          )}`}
        >
          Sent
        </button>

        <button
          onClick={() => setSelected("optionThree")}
          className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass(
            "optionThree"
          )}`}
        >
          Received
        </button>
      </div>
      <div className="max-w-full overflow-x-auto mt-2">
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {/* Example notification items */}

          {files.length ? (
            filteredFiles.map((file) => (
              <li key={file._id}>
                <div className="flex dark:text-white text-black items-center gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5">
                  <div className="mr-5 text-gray-500">
                    {formatDate(file.uploadedAt)}
                  </div>
                  <GetIcon filename={file.originalName} size={26} />
                  <div className="flex-1 flex flex-col">
                    <span className="">{file.originalName}</span>
                    <span className="text-gray-500">
                      {file.zippedFiles.length} files
                    </span>
                  </div>

                  <Badge
                    size="sm"
                    color={
                      file.sender === session?.shortcode ? "warning" : "info"
                    }
                  >
                    {file.sender === session?.shortcode ? "sent" : "received"}
                  </Badge>
                  <div>{bytesToSize(file.size)}</div>
                  <div className="flex gap-3 ml-3">
                    <Link href={file.url}>
                      <Button size="sm" variant="outline">
                        <Download size={18} />
                      </Button>
                    </Link>

                    {file.sender === session?.shortcode && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDeletingFile({
                            name: file.originalName,
                            id: file.public_id,
                          });
                          errorModal.openModal();
                        }}
                      >
                        <Trash2 size={18} className="stroke-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))
          ) : isPending ? (
            <div className="animate-pulse w-full h-20 bg-black/20 dark:bg-black rounded-2xl"></div>
          ) : (
            <div className="mt-11 mb-11 w-full fx txt flex-col gap-3">
              <span className="opacity-50 text-lg">No files to show</span>
              <Link href={"/share"}>
                <Button className="" variant="outline">
                  Start Sharing
                </Button>
              </Link>
            </div>
          )}
        </ul>
      </div>
      <Modal
        isOpen={errorModal.isOpen}
        onClose={errorModal.closeModal}
        className="max-w-[400px] p-5 lg:p-7"
      >
        <div className="text-center">
          <div className="relative flex items-center justify-center z-1 mb-7">
            <svg
              className="fill-error-50 dark:fill-error-500/15"
              width="80"
              height="80"
              viewBox="0 0 90 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                fill=""
                fillOpacity=""
              />
            </svg>

            <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <svg
                className="fill-error-600 dark:fill-error-500"
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.62684 11.7496C9.04105 11.1638 9.04105 10.2141 9.62684 9.6283C10.2126 9.04252 11.1624 9.04252 11.7482 9.6283L18.9985 16.8786L26.2485 9.62851C26.8343 9.04273 27.7841 9.04273 28.3699 9.62851C28.9556 10.2143 28.9556 11.164 28.3699 11.7498L21.1198 18.9999L28.3699 26.25C28.9556 26.8358 28.9556 27.7855 28.3699 28.3713C27.7841 28.9571 26.8343 28.9571 26.2485 28.3713L18.9985 21.1212L11.7482 28.3715C11.1624 28.9573 10.2126 28.9573 9.62684 28.3715C9.04105 27.7857 9.04105 26.836 9.62684 26.2502L16.8771 18.9999L9.62684 11.7496Z"
                  fill=""
                />
              </svg>
            </span>
          </div>

          <p className="text-lg leading-6 text-gray-500 dark:text-gray-400">
            Delete <span className="font-bold">{deletingFile?.name}</span>?
          </p>

          <div className="flex items-center justify-center w-full gap-3 mt-7">
            <Button
              disabled={isPending2}
              variant="outline"
              className="!border-red-600"
              onClick={deleteFile}
            >
              {isPending2 ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default FileList;
