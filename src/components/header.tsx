/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { Button, Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { signIn, signOut, useSession } from "next-auth/react";

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Submit', href: '/submit' },
  { name: 'Leaderboard', href: '/leaderboard' },
]

function Profile() {
  const { data: sessionData, status } = useSession();

  if (status === "loading") {
    return (
      <div className="text-sm font-semibold leading-6 text-gray-900">
        Loading...
      </div>
    )
  }

  if (!sessionData) {
    return (
      <Button
        onClick={() => void signIn()}
        className="text-sm font-semibold leading-6 text-gray-900">
        Log in
      </Button>
    )
  }

  return (
    <a href="#" className="group block flex-shrink-0">
      <div className="flex items-center">
        <div>
          <img
            className="inline-block h-9 w-9 rounded-full"
            src={`https://source.boringavatars.com/beam/120/${sessionData.user.email}`}
            alt=""
          />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{sessionData.user.name}</p>
          <Button onClick={() => void signOut()} className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Log Out</Button>
        </div>
      </div>
    </a>
  )
}

export default function Header() {

  return (

    <header className="bg-white">
      <nav className="mx-auto flex items-center justify-between p-6 px-8  bg-slate-100" aria-label="Global">
      

        <div className="flex flex-1">
          <div className="flex gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-900">
                {item.name}
              </a>
            ))}
          </div>
          
        </div>

        <div className="flex flex-1 justify-end">

          <Profile />

        </div>
      </nav>

    </header>
  )
}
