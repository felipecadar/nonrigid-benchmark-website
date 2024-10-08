/* eslint-disable @next/next/no-img-element */

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";

const authors = [
  { name: "Felipe Cadar", href: "http://eucadar.com", uni_sup: "1,2" },
  {
    name: "Renato Martins",
    href: "https://renatojmsdh.github.io",
    uni_sup: "2",
  },
  { name: "Guilherme Potje", href: "https://guipotje.github.io", uni_sup: "1" },
  {
    name: "Cédric Demonceaux",
    href: "https://sites.google.com/view/cedricdemonceaux/home",
    uni_sup: "2",
  },
  {
    name: "Erickson R. Nascimento",
    href: "https://homepages.dcc.ufmg.br/~erickson/",
    uni_sup: "1,3",
  },
];

const uni_sup = [
  { name: "Universidade Federal de Minas Gerais", href: "#", uni_sup: "1" },
  { name: "Université de Bourgogne", href: "#", uni_sup: "2" },
  { name: "Microsoft", href: "#", uni_sup: "3" },
];

const methods = [
  { name: "DALF", key: "dalf", href: "#" },
  { name: "LightGlue", key: "lightglue", href: "#" },
  { name: "XFeat", key: "xfeat", href: "#" },
];

export default function Home() {
  const [viewpoint, setViewpoint] = useState(false);
  const [illumination, setIllumination] = useState(false);
  const [experimentKey, setExperimentKey] = useState("deformation");
  const [methodKey, setmethodKey] = useState("dalf");

  const [showGif, setShowGif] = useState(1);

  const gifs = Array.from({ length: 8 }, (_, i) => i + 1);


  const toggleViewpoint = () => {
    setViewpoint(!viewpoint);
  };

  const toggleIllumination = () => {
    setIllumination(!illumination);
  };

  useEffect(() => {
    if (viewpoint && illumination) {
      setExperimentKey("both");
    } else if (viewpoint) {
      setExperimentKey("viewpoint");
    } else if (illumination) {
      setExperimentKey("illumination");
    } else {
      setExperimentKey("deformation");
    }
  }, [viewpoint, illumination]);

  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-col items-center  px-8 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Nonrigid Image Matching Benchmark
        </h1>

        {/* authors */}
        <div className="mt-6 flex items-center gap-x-4">
          {authors.map((author) => (
            <a
              key={author.name}
              href={author.href}
              target="_blank"
              className="text-lg  leading-6 text-gray-900"
            >
              {author.name}
              <sup className="text-xs text-gray-500">{author.uni_sup}</sup>
            </a>
          ))}
        </div>

        <div className="mt-5 flex flex-col items-center gap-x-2">
          {uni_sup.map((uni) => (
            <a
              key={uni.name}
              href={uni.href}
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              {uni.name}
              <sup className="text-xs text-gray-500">{uni.uni_sup}</sup>
            </a>
          ))}
        </div>

        <img
          src="/images/teaser.png"
          alt="Nonrigid Image Matching Benchmark Teaser"
          // resize to 50% of the original size
          className="mt-8 w-5/6"
        />

        {/* abstract */}
        <div className="mt-10 text-justify text-lg text-gray-900">
          <p>
            Gathering accurate and diverse data for nonrigid visual
            correspondence poses a significant challenge because of the
            time-consuming annotation process and the inherent difficulty in
            manually controlling surface deformations. The scarcity of
            high-quality visual data with deformations hinders the evaluation
            and training of visual correspondence methods. To overcome these
            problems, we introduce a novel photorealistic simulated dataset
            designed for training and evaluating image matching methods in
            nonrigid scenes. The proposed dataset contains temporally consistent
            deformations on real scanned objects, ensuring both photorealism and
            semantic diversity. Unlike existing datasets, our approach enables
            the extraction of accurate and dense multimodal ground truth
            annotations while maintaining full control over the scenarios and
            object deformations. Our experiments demonstrate that current
            nonrigid methods still have room for improvement in deformation
            invariance, highlighting the importance of data containing
            representative deformations. In addition to releasing a training
            dataset with 2M pairs (including 830 unique objects with 4 levels of
            deformations) and fine-tuned weights for popular learned-based
            feature description methods, we also provide a private evaluation
            set with 6000 pairs through an online benchmarking system to promote
            a standard and reproducible evaluation for future works.
          </p>
        </div>

        <div className="mt-10 flex items-center gap-x-6">
          <Link
            href="/leaderboard"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Check Learderboard
          </Link>

          <Link
            href="https://github.com/verlab/nonrigid-benchmark"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Get started with the dataset <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* lets show some exemples of matching */}
        <div className="mt-10 flex flex-col items-center gap-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Visualizing Matches Across Deformations
          </h2>
          {/* small observations "Using DALF (CVPR23)" */}
          {/* <p className="text-sm text-gray-900">
            <Link
              href="https://openaccess.thecvf.com/content/CVPR2023/html/Potje_Enhancing_Deformable_Local_Features_by_Jointly_Learning_To_Detect_and_CVPR_2023_paper.html"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Using DALF [CVPR23]
            </Link>
          </p> */}

          {/* create one button to each method */}
          <div className="flex items-center gap-x-4">
            {methods.map((method) => (
              <button
                key={method.key}
                className={clsx(
                  "rounded-md  px-3.5 py-2.5 text-sm font-semibold  shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                  method.key === methodKey
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "bg-gray-300 text-gray-900 hover:bg-gray-200",
                )}
                onClick={() => setmethodKey(method.key)}
              >
                {method.name}
              </button>
            ))}
          </div>

          {/* create tree toggle buttons with the labels "+Viewpoint" "+Illumination" */}
          <div className="flex items-center gap-x-4">
            <button
              className={clsx(
                "rounded-md  px-3.5 py-2.5 text-sm font-semibold  shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                viewpoint
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "bg-gray-300 text-gray-900 hover:bg-gray-200",
              )}
              onClick={toggleViewpoint}
            >
              Add Viewpoint changes
            </button>

            <button
              className={clsx(
                "rounded-md  px-3.5 py-2.5 text-sm font-semibold  shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                illumination
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "bg-gray-300 text-gray-900 hover:bg-gray-200",
              )}
              onClick={toggleIllumination}
            >
              Add Illumination changes
            </button>
          </div>

          <p className="text-lg text-gray-900">
            Try to change the transformations!
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center gap-y-2">
              <img
                src={`/images/${methodKey}/${experimentKey}/1.png`}
                alt="Matching 1"
                className="w-6/6"
              />
              <p className="text-sm text-gray-900">Low</p>
            </div>

            <div className="flex flex-col items-center gap-y-2">
              <img
                src={`/images/${methodKey}/${experimentKey}/2.png`}
                alt="Matching 2"
                className="w-6/6"
              />
              <p className="text-sm text-gray-900">Medium</p>
            </div>

            <div className="flex flex-col items-center gap-y-2">
              <img
                src={`/images/${methodKey}/${experimentKey}/3.png`}
                alt="Matching 3"
                className="w-6/6"
              />
              <p className="text-sm text-gray-900">High</p>
            </div>
          </div>

          {/* More Examples of objects  */}
          {/* /gif/basket_deformed.gif */}

          <div className="mt-10 flex flex-col items-center gap-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Deformation Examples
            </h2>

            {/* buttons */}

            <div className="flex items-center gap-x-4">
              {gifs.map((gif) => (
                <button
                  key={gif}
                  className={clsx(
                    "rounded-md  px-3.5 py-2.5 text-sm font-semibold  shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                    showGif === gif
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "bg-gray-300 text-gray-900 hover:bg-gray-200",
                  )}
                  onClick={() => setShowGif(gif)}
                >
                  {gif}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1">
              <div className="flex flex-col items-center gap-y-2">
                <img
                  src={`/gif/0${showGif}_deformed.gif`}
                  alt="Deformation Example 1"
                  className="w-6/6"
                />
                <p className="text-xl text-gray-900">Deformation Example {showGif}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
