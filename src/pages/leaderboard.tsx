import { ArrowDownIcon, CloudArrowDownIcon } from "@heroicons/react/24/outline";
import type { Experiment } from "@prisma/client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DropDownBox from "~/components/listbox";
import { api } from "~/utils/api";

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 ">
      <CloudArrowDownIcon className="h-16 w-16 opacity-100  animate-bounce " />
    </div>
  );
}

const ExperimentsDefinition = {
  "Single Object": {
    Deformation: ["deformation_1", "deformation_2", "deformation_3"],
    "Deformation-Illumination": [
      "deformation_1-illumination",
      "deformation_2-illumination",
      "deformation_3-illumination",
    ],
    "Deformation-Viewpoint": [
      "deformation_1-viewpoint",
      "deformation_2-viewpoint",
      "deformation_3-viewpoint",
    ],
    "Deformation-Illumination-Viewpoint": [
      "deformation_1-illumination-viewpoint",
      "deformation_2-illumination-viewpoint",
      "deformation_3-illumination-viewpoint",
    ],
    Illumination: ["illumination"],
    Viewpoint: ["viewpoint"],
    "Illumination-Viewpoint": ["illumination-viewpoint"],
  },
  "Multiple Object": {
    Deformation: ["deformation_1", "deformation_2", "deformation_3"],
    "Deformation-Illumination": [
      "deformation_1-illumination",
      "deformation_2-illumination",
      "deformation_3-illumination",
    ],
    "Deformation-Viewpoint": [
      "deformation_1-viewpoint",
      "deformation_2-viewpoint",
      "deformation_3-viewpoint",
    ],
    "Deformation-Illumination-Viewpoint": [
      "deformation_1-illumination-viewpoint",
      "deformation_2-illumination-viewpoint",
      "deformation_3-illumination-viewpoint",
    ],
    Illumination: ["illumination"],
    Viewpoint: ["viewpoint"],
    "Illumination-Viewpoint": ["illumination-viewpoint"],
  },
  Scale: {
    Deformation: ["deformation_1", "deformation_2", "deformation_3"],
    Scale: ["scale_1", "scale_2", "scale_3", "scale_4"],
    "Deformation-Scale": [
      "deformation_1-scale_1",
      "deformation_2-scale_1",
      "deformation_3-scale_1",
      "deformation_1-scale_2",
      "deformation_2-scale_2",
      "deformation_3-scale_2",
      "deformation_1-scale_3",
      "deformation_2-scale_3",
      "deformation_3-scale_3",
      "deformation_1-scale_4",
      "deformation_2-scale_4",
      "deformation_3-scale_4",
    ],
  },
} as Record<string, Record<string, string[]>>;

type TypeExperimentTable = {
  experiments: Record<string, Experiment[]>;
  splits: string[];
  includeMS: boolean;
  includeMA: boolean;
  includeMR: boolean;
};

function SplitCollums({ splits }: { splits: string[] | undefined }) {
  return (
    <>
      {splits?.map((split) => {
        return (
          <td key={split} className="px-3 py-4 text-sm text-gray-500">
            @{split}
          </td>
        );
      })}
    </>
  );
}

function ExperimentsTable({
  experiments,
  splits,
  includeMA,
  includeMR,
  includeMS,
}: TypeExperimentTable) {
  function makeValue(_experiment: Experiment) {
    const vals = [] as string[];
    if (includeMS) {
      vals.push(_experiment.ms.toFixed(2));
    }
    if (includeMA) {
      vals.push(_experiment.ma.toFixed(2));
    }
    if (includeMR) {
      vals.push(_experiment.mr.toFixed(2));
    }
    return vals.join("/");
  }

  const [sortedBy, setSortedBy] = useState<"ms" | "ma" | "mr">("ms");

  // get the mean of each metric for each method
  const method_mean_map_ms = Object.keys(experiments).map((name) => {
    const exps = experiments[name] ?? [];
    const mean_ms = exps.reduce((acc, exp) => acc + exp.ms, 0) / exps.length;
    return { name, mean_ms };
  });
  const method_mean_map_ma = Object.keys(experiments).map((name) => {
    const exps = experiments[name] ?? [];
    const mean_ma = exps.reduce((acc, exp) => acc + exp.ma, 0) / exps.length;
    return { name, mean_ma };
  });
  const method_mean_map_mr = Object.keys(experiments).map((name) => {
    const exps = experiments[name] ?? [];
    const mean_mr = exps.reduce((acc, exp) => acc + exp.mr, 0) / exps.length;
    return { name, mean_mr };
  });

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
                {includeMS && (
                  <th
                    onClick={() => {
                      setSortedBy("ms");
                    }}
                    scope="col"
                    className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    <div className="flex">
                      Av. MS
                      {sortedBy === "ms" ? (
                        <ArrowDownIcon className="h-4" />
                      ) : (
                        // fill the space
                        <div className="h-4 w-4"></div>
                      )}
                    </div>
                  </th>
                )}
                {includeMA && (
                  <th
                    onClick={() => {
                      setSortedBy("ma");
                    }}
                    scope="col"
                    className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    <div className="flex">
                      Av. MA
                      {sortedBy === "ma" ? (
                        <ArrowDownIcon className="h-4" />
                      ) : (
                        // fill the space
                        <div className="h-4 w-4"></div>
                      )}
                    </div>
                  </th>
                )}
                {includeMR && (
                  <th
                    onClick={() => {
                      setSortedBy("mr");
                    }}
                    scope="col"
                    className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    <div className="flex">
                      Av. RR
                      {sortedBy === "mr" ? (
                        <ArrowDownIcon className="h-4" />
                      ) : (
                        // fill the space
                        <div className="h-4 w-4"></div>
                      )}
                    </div>
                  </th>
                )}
                <SplitCollums splits={splits} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.keys(experiments)
                .sort((a, b) => {
                  if (sortedBy === "ms") {
                    const mean_a =
                      method_mean_map_ms.find((x) => x.name === a)?.mean_ms ??
                      0;
                    const mean_b =
                      method_mean_map_ms.find((x) => x.name === b)?.mean_ms ??
                      0;
                    return mean_b - mean_a;
                  }
                  if (sortedBy === "ma") {
                    const mean_a =
                      method_mean_map_ma.find((x) => x.name === a)?.mean_ma ??
                      0;
                    const mean_b =
                      method_mean_map_ma.find((x) => x.name === b)?.mean_ma ??
                      0;
                    return mean_b - mean_a;
                  }
                  if (sortedBy === "mr") {
                    const mean_a =
                      method_mean_map_mr.find((x) => x.name === a)?.mean_mr ??
                      0;
                    const mean_b =
                      method_mean_map_mr.find((x) => x.name === b)?.mean_mr ??
                      0;
                    return mean_b - mean_a;
                  }
                  return 0;
                })
                .map((name, idx) => {
                  const exps = experiments[name] ?? [];
                  const mean_ms =
                    exps.reduce((acc, exp) => acc + exp.ms, 0) / exps.length;
                  const mean_ma =
                    exps.reduce((acc, exp) => acc + exp.ma, 0) / exps.length;
                  const mean_mr =
                    exps.reduce((acc, exp) => acc + exp.mr, 0) / exps.length;

                  const by_split = exps.reduce(
                    (acc, exp) => {
                      acc[exp.split] = exp;
                      return acc;
                    },
                    {} as Record<string, Experiment>,
                  );

                  return (
                    <tr key={name}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {/* #{idx+1} {name} */}
                        {/* bettwe index */}
                        <span className="text-gray-500">#{idx + 1}</span> {name}
                      </td>
                      {includeMS && (
                        <td className="px-3 py-4 text-sm font-bold">
                          {mean_ms.toFixed(2)}
                        </td>
                      )}
                      {includeMA && (
                        <td className="px-3 py-4 text-sm font-bold">
                          {mean_ma.toFixed(2)}
                        </td>
                      )}
                      {includeMR && (
                        <td className="px-3 py-4 text-sm font-bold">
                          {mean_mr.toFixed(2)}
                        </td>
                      )}

                      {splits.map((split) => {
                        const exp = by_split[split];
                        return (
                          <td
                            key={split}
                            className="px-3 py-4 text-sm font-bold"
                          >
                            {exp ? makeValue(exp) : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  // const { data: submissions } = api.bench.getPublicSubmissions.useQuery();
  // const [experiments, setExperiments] = useState<Experiment[]>([]);
  // experiments are name: Experiment[]
  const utils = api.useUtils();
  const [experiments, setExperiments] = useState<Record<string, Experiment[]>>(
    {},
  );
  const [selectedDataset, setSelectedDataset] =
    useState<string>("Single Object");
  const [selectedSplit, setSelectedSplit] = useState<string>("Deformation");
  const [showMA, setShowMA] = useState<boolean>(true);
  const [showMR, setShowMR] = useState<boolean>(true);
  const [showMS, setShowMS] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedDataset || !selectedSplit) {
      return;
    }

    // when changing the dataset, we need to make sure that the split is valid
    if (
      ExperimentsDefinition[selectedDataset] &&
      !ExperimentsDefinition[selectedDataset][selectedSplit]
    ) {
      setSelectedSplit(
        Object.keys(ExperimentsDefinition[selectedDataset])[0] ?? "",
      );
    }
    // fetch experiments

    if (!ExperimentsDefinition[selectedDataset]) {
      return;
    }

    if (!ExperimentsDefinition[selectedDataset][selectedSplit]) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    setLoading(true);
    utils.bench.getSplits
      .fetch({
        dataset: selectedDataset,
        splits: ExperimentsDefinition[selectedDataset][selectedSplit],
      })
      .then((data) => {
        setExperiments(data);
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Something went wrong while fetching the experiments");
        console.error(error);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataset, selectedSplit]);

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

        <div className="grid grid-cols-6 gap-x-6 gap-y-8">
          <div className="col-span-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Dataset
            </label>
            <div className="mt-2">
              <DropDownBox
                options={Object.keys(ExperimentsDefinition).map((dataset) => ({
                  key: dataset,
                  value: dataset,
                }))}
                selected={selectedDataset}
                setSelected={setSelectedDataset}
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Split
            </label>
            <div className="mt-2">
              <DropDownBox
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                options={Object.keys(
                  ExperimentsDefinition[selectedDataset]
                    ? ExperimentsDefinition[selectedDataset]
                    : {},
                ).map((split) => ({ key: split, value: split }))}
                selected={selectedSplit}
                setSelected={setSelectedSplit}
              />
            </div>
          </div>

          <div className="col-span-2">
            {/* make the metrics selection boxes */}
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Metrics
            </label>
            <div className="mt-2">
              <div className="flex items-center">
                <input
                  id="ms"
                  name="ms"
                  type="checkbox"
                  checked={showMS}
                  onChange={() => setShowMS(!showMS)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="ms"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Matching Score
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="ma"
                  name="ma"
                  type="checkbox"
                  checked={showMA}
                  onChange={() => setShowMA(!showMA)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="ma"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Matching Accuracy
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="mr"
                  name="mr"
                  type="checkbox"
                  checked={showMR}
                  onChange={() => setShowMR(!showMR)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="mr"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Repeatibility Rate
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold leading-6 text-gray-900">
            {selectedDataset}
          </h2>
          {loading && <LoadingOverlay />}
          <ExperimentsTable
            experiments={experiments}
            splits={ExperimentsDefinition[selectedDataset]![selectedSplit]!}
            includeMS={showMS}
            includeMA={showMA}
            includeMR={showMR}
          />
        </div>
      </div>
    </>
  );
}
