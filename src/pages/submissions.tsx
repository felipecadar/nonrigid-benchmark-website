import type { Experiment } from "@prisma/client";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "react-toastify";
import DropDownBox from "~/components/listbox";
import SlideOver from "~/components/slideover";
import { api } from "~/utils/api";

function EditPanel(props: { experiment: Experiment | null }) {
  const [name, setName] = useState(props.experiment?.name ?? "");
  const [isPublic, setIsPublic] = useState(props.experiment?.public ?? false);

  const utils = api.useUtils();
  const { mutate: updateExperiment } = api.post.editSubmission.useMutation({
    onSuccess: () => {
      console.log("Experiment updated successfully");
      void utils.post.invalidate();
      toast.success("Experiment updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update the experiment. Please try again later.");
    },
  });

  function handleUpdate() {
    if (!props.experiment) {
      return;
    }

    updateExperiment({
      id: props.experiment.id,
      name,
      public: isPublic,
    });
  }

  if (!props.experiment) {
    return null;
  }

  return (
    <div className="mt-10 grid grid-cols-6 gap-x-6 gap-y-8">
      <div className="col-span-6">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Name
        </label>
        <div className="mt-2">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
            <input
              type="text"
              className="border- block flex-1 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* visibility dropdown (public vs private) */}

      <div className="col-span-6">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Visibility
        </label>
        <div className="mt-2">
            <DropDownBox 
              options={[
                {key: "public", value: "Public"},
                {key: "private", value: "Private"}
              ]}
              selected={isPublic ? "Public" : "Private"}
              setSelected={(selected) => setIsPublic(selected === "Public")}
            />
        </div>
      </div>

      {/* Non editable dataset and split */}
      <div className="col-span-6">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Dataset
        </label>
        <div className="mt-2">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300  sm:max-w-md">
            <input
              disabled
              type="text"
              className="block flex-1 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              value={props.experiment?.dataset}
              />
          </div>
        </div>
      </div>

      <div className="col-span-6">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Split
        </label>
        <div className="mt-2">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300  sm:max-w-md">
            <input
              disabled
              type="text"
              className="block flex-1 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              value={props.experiment?.split}
            />
          </div>
        </div>
      </div>

      {/* save button */}

      <div className="col-span-6">
        <button
          onClick={handleUpdate}
          className="rounded-md w-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>

    </div>
  );
}

export default function Page() {
  const { data: experiments } = api.post.getSubmissions.useQuery();
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedExperiment, setSelectedExperiment] =
    useState<Experiment | null>(null);

  return (
    <>
      <SlideOver
        open={openEdit}
        setOpen={setOpenEdit}
        title="Edit Submission"
      >
        {selectedExperiment && <EditPanel experiment={selectedExperiment} />}
      </SlideOver>
      <div className="px-20">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="my-10 text-base font-semibold leading-6 text-gray-900">
              Submissions
            </h1>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Dataset
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Split
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Results (MS/MA/MR)
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Visibility
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Submission Date
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {experiments?.submissions.map((exp) => (
                    <tr key={exp.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {exp.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {exp.dataset}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {exp.split}
                      </td>
                      {exp.status == "COMPLETED" ? (
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-bold">
                          {exp.ms.toFixed(2)}/{exp.ma.toFixed(2)}/
                          {exp.mr.toFixed(2)}
                        </td>
                      ) : (
                        // COMPLETED PENDING FAILED PROCESSING
                        <td
                          className={clsx(
                            "whitespace-nowrap px-3 py-4 text-sm text-gray-500",
                            exp.status == "PENDING" && "text-yellow-500",
                            exp.status == "FAILED" && "text-red-500",
                            exp.status == "PROCESSING" && "text-blue-500",
                          )}
                        >
                          {exp.status}
                        </td>
                      )}

                      {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {exp.public ? "Public" : "Private"}
                      </td> */}
                      <td className={clsx("whitespace-nowrap px-3 py-4 text-sm", exp.public ? "text-green-500" : "text-blue-500")}>
                        {exp.public ? "Public" : "Private"}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(exp.createdAt).toLocaleString()}
                      </td>

                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button
                          onClick={() => {
                            setSelectedExperiment(exp);
                            setOpenEdit(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit<span className="sr-only">, {exp.name}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
