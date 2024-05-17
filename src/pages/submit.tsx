/* eslint-disable @next/next/no-img-element */

import { DocumentArrowUpIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useState } from "react";
import DropDownBox from "~/components/listbox";

const datasets = [
    { key: "single_object", value: "Single Object" },
    { key: "multi_object", value: "Multi Object" },
    { key: "scale", value: "Scale" },
]

export default function Page() {
  const { data: sessionData, status } = useSession();
  const [dataset, setDataset] = useState(datasets[0]!.value);

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
                Select the dataset and upload the matching files of the desired splits.
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
                      <DropDownBox options={datasets} selected={dataset} setSelected={setDataset} />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="cover-photo"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Matching Files
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                      <div className="text-center">
                        <DocumentArrowUpIcon
                          className="mx-auto h-12 w-12 text-gray-300"
                          aria-hidden="true"
                        />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
                            <span>Upload files</span>
                            {/* multi files */}
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                                multiple    
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">
                          CSV or TXT up to 20MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
