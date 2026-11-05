import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in" };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <Image src="/art/bear-book.png" alt="" width={195} height={127} className="mx-auto h-28 w-auto" />
      <h1 className="mt-4 mb-6 text-center text-4xl">Welcome back!</h1>
      <LoginForm next={next} />
    </div>
  );
}
