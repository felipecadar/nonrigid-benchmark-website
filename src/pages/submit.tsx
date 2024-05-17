/* eslint-disable @next/next/no-img-element */

import { Button } from "@headlessui/react";
import { DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useState } from "react";
import DropDownBox from "~/components/listbox";
import { upload } from '@vercel/blob/client';

const datasets = [
  { key: "single_object", value: "Single Object" },
  { key: "multi_object", value: "Multi Object" },
  { key: "scale", value: "Scale" },
];

export default function Page() {
  const { data: sessionData, status } = useSession();
  const [dataset, setDataset] = useState(datasets[0]!.value);
  const [files, setFiles] = useState<File[] | null>(null);

  const [progress, setProgress] = useState<Record<string, string>>({});

  async function handleFilesSubmission() {
    if (!files) {
      return;
    }

    const promises = files.map(async (file) => {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/matchfile/upload',
      });
      setProgress((prev) => ({ ...prev, [file.name]: newBlob.url }));
      console.log(newBlob);
    });

    const urls = await Promise.all(promises);
    console.log(urls);
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
                      htmlFor="cover-photo"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Matching Files
                    </label>
                    <Button
                      className="my-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={() => {
                        document.getElementById("cover-photo")?.click();
                      }}
                    >
                      <input
                        type="file"
                        id="cover-photo"
                        name="cover-photo"
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
                          <li key={index} className="flex items-center gap-x-3 py-2">
                            <DocumentIcon className="w-5 h-5 text-gray-900" />
                            <span className="text-sm font-semibold leading-6 text-gray-900">
                              {file.name}
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


                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                <button
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={handleFilesSubmission}
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
