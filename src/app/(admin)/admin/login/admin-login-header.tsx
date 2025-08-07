"use client";

import Image from "next/image";

export const AdminLoginHeader = () => {
  return (
    <header className="w-full border-b border-gray-200 p-2 flex justify-between items-center">
      <div>
        <Image
          src={"/logo.jpg"}
          alt="Zainy Water Logo"
          width={120}
          height={120}
        />
      </div>
    </header>
  );
};
