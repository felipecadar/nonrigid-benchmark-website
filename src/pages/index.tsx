/* eslint-disable @next/next/no-img-element */


export default function Home() {

  return (
    <>
      <div className="flex flex-col items-center mx-auto max-w-7xl  py-10 px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Nonrigid Matching Benchmark
        </h1>

        <img
          src="/images/teaser.png"
          alt="Nonrigid Matching Benchmark Teaser"
          // resize to 50% of the original size
          className="mt-8 w-5/6"
        />

        <div className="mt-10 flex items-center gap-x-6">
          <a
            href="#"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get started
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

    </>
  );
}

