/* eslint-disable @next/next/no-img-element */

import { Button } from "@headlessui/react";
import { DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import DropDownBox from "~/components/listbox";
import { api } from "~/utils/api";
import clsx from "clsx";
import { toast } from "react-toastify";
import axios from "axios";
// import { createClient } from "~/utils/supabase/client";
const datasets = [
  { key: "single_object", value: "Single Object" },
  { key: "multi_object", value: "Multiple Object" },
  { key: "scale", value: "Scale" },
];

const possibleSplits = [
  "deformation_1",
  "deformation_2",
  "deformation_3",
  "illumination",
  "viewpoint",
  "scale_0",
  "scale_1",
  "scale_2",
  "scale_3",
  "scale_4",
];

function validateSplit(fname: string) {
  const splits = fname.split(".")[0]?.split("-");
  if (!splits) {
    return false;
  }
  // make sure all splits are present in the possible splits
  return splits.every((split) => possibleSplits.includes(split));
}

export default function Page() {
  // const supabase = createClient();

  const { data: sessionData, status } = useSession();
  const [dataset, setDataset] = useState(datasets[0]!.value);
  const [files, setFiles] = useState<File[] | null>(null);
  const [identifier, setIdentifier] = useState<string>("");
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [totalProgres, setTotalProgress] = useState<number>(0);

  const utils = api.useUtils();

  const {mutate: submission} = api.bench.submission.useMutation({
    onSuccess: () => {
      toast.success("Files submitted successfully");
      setFiles(null);
      setProgress({});
      setSubmitting(false);
    },
    onError: (error) => {
      console.error("Error submitting files:", error);
      toast.error("Error submitting files");
      setSubmitting(false);
    },
  })

  // update total progress based on progress
  useEffect(()=> {
    if (files == null) {
      return;
    }

    const total_size = files.reduce((acc, file) => acc + file.size, 0);
    const total_uploaded = Object.values(progress).reduce(
      (acc, file) => acc + file,
      0,
    );
    const percentComplete = (total_uploaded * 100) / total_size;
    setTotalProgress(percentComplete);
  }, [progress, files]);

  async function handleFilesSubmission() {
    if (!files) {
      return;
    }

    if (!sessionData) {
      return;
    }
    setSubmitting(true);

    // Helper to process files in batches of 5
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const uploadPromises = batch.map(async (file) => {
      const { signedUrl } = await utils.client.r2.getSignedUrlForUpload.mutate({
        expName: identifier,
        splitName: dataset,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      return axios
        .put(signedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
          setProgress((prev) => ({ ...prev, [file.name]: progressEvent.loaded }));
          }
        }
        })
        .then(() => {
        setProgress((prev) => ({ ...prev, [file.name]: file.size }));
        })
        .catch((error) => {
        console.error("Error uploading file:", error);
        setSubmitting(false);
        });
      });
      await Promise.all(uploadPromises);
    }

    void submission({
      dataset: dataset,
      files: files.map((file) => ({
        split: file.name.split(".")[0]!,
        url: sessionData.user.id + "/" + identifier + "/" + dataset + "/" + file.name,
      })),
      identifier: identifier,
    });
  }

  if (status === "loading") {
    return (
      <div className="text-sm font-semibold leading-6 text-gray-900">
        Loading...
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="text-sm font-semibold leading-6 text-gray-900">
        You need to be logged in to submit a result.
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-col items-center  px-8 py-10">
        <div className="space-y-10 divide-y divide-gray-900/10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
            <div className="px-4 sm:px-0">
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Submit your preductions to the Nonrigid Matching Benchmark.
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Select the dataset and upload the matching files of the desired
                splits. All results are private by default. You can make them
                public later.
              </p>
            </div>

            <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
              <div className="px-4 py-6 sm:p-8">
                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Identifier
                    </label>
                    <div className="mt-2">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                        <input
                          type="text"
                          name="website"
                          id="website"
                          className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder="SIFT-1024-Ratio0.7"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="about"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Dataset
                    </label>
                    <div className="mt-2">
                      <DropDownBox
                        options={datasets}
                        selected={dataset}
                        setSelected={setDataset}
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      // htmlFor="cover-photo"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Matching Files
                    </label>
                    <Button
                      className="my-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={() => {
                        document.getElementById("matchfile-input")?.click();
                      }}
                    >
                      <input
                        type="file"
                        id="matchfile-input"
                        name="matchfile-input"
                        className="sr-only"
                        multiple
                        accept=".json"
                        onChange={(e) => {
                          if (e.target.files)
                            setFiles(Array.from(e.target.files));
                        }}
                      />
                      Click to select files
                    </Button>

                    {/* iterate through files */}
                    {files && (
                      <ul className="divide-y divide-gray-900/10">
                        {[...files].map((file, index) => (
                          <li
                            key={index}
                            className={clsx(
                              `flex items-center gap-x-3 py-2`,
                              validateSplit(file.name) ? "" : "bg-red-200",
                            )}
                          >
                            <DocumentIcon className="h-5 w-5 text-gray-900" />
                            <span className="text-sm font-semibold leading-6 text-gray-900">
                              {file.name}
                              {validateSplit(file.name)
                                ? ""
                                : " - Invalid Split"}
                            </span>
                            
                            {/* fill space */}
                            <div className="flex-1" />

                            {/* progress tracker -> x/X Mb  */}
                            <span className="text-sm font-semibold leading-6 text-gray-900">
                              {progress[file.name]
                                ? `${(progress[file.name]! / 1000000).toFixed(
                                    2,
                                  )} / ${(file.size / 1000000).toFixed(2)} Mb`
                                : `0 / ${(file.size / 1000000).toFixed(2)} Mb`}
                            </span>


                            {/* remove from list */}
                            <Button
                              onClick={() => {
                                const newFiles = [...files];
                                newFiles.splice(index, 1);
                                setFiles(newFiles.length ? newFiles : null);
                              }}
                            >
                              <XMarkIcon className="h-5 w-5 text-gray-900" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* show progress */}

                    <div className="h-2.5 w-full rounded-full bg-gray-200 ">
                      <div
                        className="h-2.5 rounded-full bg-indigo-600"
                        style={{
                          width: Object.keys(progress).length
                            ? `${totalProgres}%`
                            : `0%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                <button
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={(e) => {
                    e.preventDefault();
                    void handleFilesSubmission();
                  }}
                  disabled={
                    submitting ||
                    !files ||
                    files
                      .map((file) => validateSplit(file.name))
                      .includes(false) ||
                    !identifier
                  }
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
