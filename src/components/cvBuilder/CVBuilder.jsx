import React from "react";
import Bio from "./Bio";
import Skills from "./skills";
import Education from "./education";

const CVBuilder = () => {
  return (
    <div className="cv-builder">
      <h2>Build Your Resume</h2>
      <Bio />
      <Skills />
      <Education />
    </div>
  );
};

export default CVBuilder;
