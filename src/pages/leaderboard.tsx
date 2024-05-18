import type { Experiment } from "@prisma/client";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DropDownBox from "~/components/listbox";
import SlideOver from "~/components/slideover";
import { api } from "~/utils/api";
type Dataset = Record<string, Experiment[]>;

function ExperimentsTable({ experiments }: { experiments: Experiment[] }) {
  return (
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
                  Submission Date
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {experiments.map((exp) => (
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
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-bold">
                    {exp.ms.toFixed(2)}/{exp.ma.toFixed(2)}/{exp.mr.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(exp.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { data: submissions } = api.post.getPublicSubmissions.useQuery();
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    if (!submissions) {
      return;
    }
    setExperiments(submissions.submissions);
  }, [submissions]);

  // separate experiments by dataset
  // dataset type

  const datasets = experiments?.reduce((acc: Dataset, exp) => {
    if (!acc[exp.dataset]) {
      acc[exp.dataset] = [];
    }
    acc[exp.dataset]!.push(exp);
    return acc;
  }, {});

  return (
    <>
      <div className="px-20">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="my-10 text-base font-semibold leading-6 text-gray-900">
              Submissions
            </h1>
          </div>
        </div>

        {datasets &&
          Object.keys(datasets).map((dataset) => (
            <div key={dataset} className="mt-8">
              <h2 className="text-lg font-semibold leading-6 text-gray-900">
                {dataset}
              </h2>
              <ExperimentsTable experiments={datasets[dataset]!} />
            </div>
          ))}
      </div>
    </>
  );
}