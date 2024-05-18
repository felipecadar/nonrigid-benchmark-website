/* eslint-disable @next/next/no-img-element */

import { Button } from "@headlessui/react";
import { DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useState } from "react";
import DropDownBox from "~/components/listbox";
import { upload } from '@vercel/blob/client';
import { api } from "~/utils/api";
import clsx from "clsx";
import { toast } from "react-toastify";
const datasets = [
  { key: "single_object", value: "Single Object" },
  { key: "multi_object", value: "Multi Object" },
  { key: "scale", value: "Scale" },
];

const possibleSplits = [
  "deformation_1", "deformation_2", "deformation_3",
  "illumination", "viewpoint",
  "scale_0", "scale_1", "scale_2", "scale_3",
];

function validateSplit(fname: string) {
  const splits = fname.split(".")[0]?.split("-")
  if (!splits) {
    return false;
  }
  // make sure all splits are present in the possible splits
  return splits.every((split) => possibleSplits.includes(split))
}


export default function Page() {
  const { data: sessionData, status } = useSession();
  const [dataset, setDataset] = useState(datasets[0]!.value);
  const [files, setFiles] = useState<File[] | null>(null);
  const [identifier, setIdentifier] = useState<string>("");
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { mutate:submitExperiment } = api.post.submission.useMutation({
    onSuccess: () => {
      setFiles([]);
      setIdentifier("");
      setSubmitting(false);
      setProgress({});
      toast.success("Experiment submitted successfully.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to submit the experiment. Please try again later.");
      setSubmitting(false);
    }
  });

  async function handleFilesSubmission() {
    if (!files) {
      return;
    }

    if (!sessionData) {
      return;
    }

    setSubmitting(true);

    const promises = files.map(async (file) => {
      if (!validateSplit(file.name)) {
        return;
      }
      
      const splits = file.name.split(".")[0]?.split("-")
      
      // sort and join splits
      const split = splits!.sort().join("-")

      const file_route = `${sessionData.user.id}/${dataset}/${identifier.replaceAll("/", "-")}/${file.name}`

      const newBlob = await upload(file_route, file, {
        access: 'public',
        handleUploadUrl: '/api/matchfile/upload',
      });

      setProgress((prev) => ({ ...prev, [file.name]: newBlob.url }));

      return {
        split,
        url: newBlob.url,
      };

    });

    const split_urls = (await Promise.all(promises)).filter((x) => x !== undefined);
  

    submitExperiment({
      dataset,
      files: split_urls,
      identifier,
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
                splits.
                All results are private by default. You can make them public later.
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
                        accept=".txt,.csv"
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
                          <li key={index} className={clsx(`flex items-center gap-x-3 py-2`,
                            validateSplit(file.name) ? "" : "bg-red-200"
                          )}>
                            <DocumentIcon className="w-5 h-5 text-gray-900" />
                            <span className="text-sm font-semibold leading-6 text-gray-900">
                              {file.name}
                              {validateSplit(file.name) ? "" : " - Invalid Split"}
                            </span>
                            {/* remove from list */}
                            <Button
                              onClick={() => {
                                const newFiles = [...files];
                                newFiles.splice(index, 1);
                                setFiles(newFiles.length ? newFiles : null);
                              }}
                            >
                                <XMarkIcon className="w-5 h-5 text-gray-900" />
                            </Button>

                          </li>
                        ))}
                      </ul>
                    )}

                    {/* show progress */}

                    <div className="w-full bg-gray-200 rounded-full h-2.5 ">
                      <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: 
                        Object.keys(progress).length
                          ? `${(Object.keys(progress).length / files!.length) * 100}%`
                          : `0%`
                      }}></div>
                    </div>

                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                <button
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    e.preventDefault();
                    void handleFilesSubmission();
                  }}
                  disabled={submitting || !files || files.map((file) => validateSplit(file.name)).includes(false) || !identifier}
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
