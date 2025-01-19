import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'

export default function Page() {
  return (
  <div>
  <div className="flex w-full flex-1 justify-center gap-2 px-8 sm:max-w-md">
    <SignIn />
  </div>

  </div>
  )
}