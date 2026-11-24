import React from "react";
import Loader from "./ui/Loader";

export default function PageLoader({
  description,
  minHeight = "min-h-[50vh]",
  fullscreen = false,
}) {
  if (fullscreen) {
    return <Loader fullscreen={true} description={description} />;
  }

  return (
    <div
      className={`w-full ${minHeight} flex items-center justify-center p-4`}
    >
      <Loader fullscreen={false} description={description} />
    </div>
  );
}
