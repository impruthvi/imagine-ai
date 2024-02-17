import { UserButton } from "@clerk/nextjs";
import React from "react";

const HomePage = () => {
  return (
    <div className="">
      <p>HomePage</p>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};

export default HomePage;
