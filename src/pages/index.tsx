/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

const authors = [
  { name: "Felipe Cadar Chamone", href: "#", uni_sup: "1,2" },
  { name: "Renato Martins", href: "#", uni_sup: "2" },
  { name: "Guilherme Potje", href: "#", uni_sup: "1" },
  { name: "Cédric Demonceaux", href: "#", uni_sup: "2" },
  { name: "Erickson R. Nascimento", href: "#", uni_sup: "1,3" },
];

const uni_sup = [
  { name: "Universidade Federal de Minas Gerais", href: "#", uni_sup: "1" },
  { name: "Université de Bourgogne", href: "#" , uni_sup: "2" },
  { name: "Microsoft", href: "#", uni_sup: "3"},
];

export default function Home() {
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
              className="text-lg  leading-6 text-gray-900"
            >
              {author.name}
              <sup className="text-xs text-gray-500">{author.uni_sup}</sup>
            </a>
          ))}
        </div>

        <div className="flex flex-col items-center gap-x-2 mt-5">
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
        <img
          src="/images/teaser.png"
          alt="Nonrigid Image Matching Benchmark Teaser"
          // resize to 50% of the original size
          className="mt-8 w-5/6"
        />
        <div className="mt-10 flex items-center gap-x-6">
          <Link
            href="/leaderboard"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Check Learderboard
          </Link>
          <Link
            href="https://github.com/verlab/nonrigid-benchmark"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get started with the dataset
          </Link>
          {/* <a href="#" className="text-sm font-semibold leading-6 text-gray-900"> */}
            {/* Learn more <span aria-hidden="true">→</span> */}
          {/* </a> */}
        </div>
      </div>
    </>
  );
}
