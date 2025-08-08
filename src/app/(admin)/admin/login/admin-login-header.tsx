"use client";

import Image from "next/image";
import Link from "next/link";

export const AdminLoginHeader = () => {
  return (
    <header className="w-full border-b border-gray-200 p-2 flex justify-between items-center">
      <Link href={"/"}>
        <Image
          src={"/logo.jpg"}
          alt="Zainy Water Logo"
          width={120}
          height={120}
        />
      </Link>
    </header>
  );
};
