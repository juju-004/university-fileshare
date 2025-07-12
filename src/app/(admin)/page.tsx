"use client";

import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import FileList from "./components/FileList";
import axios from "axios";
import { useSession } from "@/context/SessionContext";
import { toast } from "sonner";
import { bytesToSize, filterError } from "@/lib/helpers";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function Files() {
  const [series, setSeries] = useState<number[]>([0]);
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  const session = useSession();
  const [stats, setStats] = useState<{
    sentCount: number;
    receivedCount: number;
    totalSize: number;
  } | null>(null);

  const getStats = async () => {
    try {
      const res = await axios.get(`/api/user/${session?.shortcode}`);
      setStats(res.data); // { sentCount: 5, receivedCount: 10 }

      const percentage =
        ((res.data?.totalSize || 0) / (20 * 1024 * 1024)) * 100;

      const percentUsed = Math.min(parseFloat(percentage.toFixed(2)), 100); // clamp to 100%
      setSeries([percentUsed]);
    } catch (error) {
      toast.error(filterError(error));
    }
  };
  useEffect(() => {
    getStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="px-5 flex justify-center items-center pt-5 border border-gray-200 bg-white dark:border-gray-800 shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div>
          <h3 className="text-base w-full text-center font-normal text-gray-800 dark:text-white/90">
            File Storage <span className="opacity-50 text-sm">(max 20mb)</span>
          </h3>

          <div className="relative ">
            <div className="max-h-[330px]">
              <ReactApexChart
                options={options}
                series={series}
                type="radialBar"
                height={330}
              />
            </div>

            <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
              {!stats ? "..." : bytesToSize(stats.totalSize)}
            </span>
          </div>
        </div>
        <div className=" dark:text-white hidden text-black sm:flex flex-col gap-5">
          <div className="flex dark:text-white flex-col gap-1 text-black">
            <span className="text-sm text-gray-300">Files Sent</span>
            <span className=" font-bold text-xl">
              {!stats ? "..." : stats.sentCount}
            </span>
          </div>
          <div className="flex dark:text-white flex-col gap-1 text-black">
            <span className="text-sm text-gray-300">Files Received</span>

            <span className=" font-bold text-xl">
              {" "}
              {!stats ? "..." : stats.receivedCount}
            </span>
          </div>
        </div>
      </div>

      <FileList getStats={getStats} />
    </div>
  );
}
