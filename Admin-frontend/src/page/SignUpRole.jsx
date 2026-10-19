// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import RoleCard from "../components/RoleCard";

// const SignUpRole = () => {
//   const navigate = useNavigate();
//     const location = useLocation();
//     const { email, firstName, lastName} = location.state || {};
//     const [role,setRole] = useState("");

//   return (
//     <div className="bg-white min-h-screen flex flex-col">
//       <div className="w-full px-4 py-6 flex items-center max-w-screen-xl mx-auto">
//         <img src="/assets/images/logo.png" alt="logo" className="h-10" />
//       </div>

//       <div className="flex flex-col items-center justify-center w-full px-4 py-10 sm:py-20 mt-[5%]">
//         <p className="text-3xl sm:text-5xl font-norican font-semibold text-[#16730F]  text-center">
//           Sign UP As
//         </p>

//         <div className="mt-20 flex flex-col sm:flex-row gap-10 flex-wrap justify-center items-center w-full max-w-5xl">
//           <RoleCard
//             imageSrc="/assets/images/user-octagon.svg"
//             title="JOBSEEKER"
//             description={
//               <>
//                 Looking for a job? Find your next <br />
//                 opportunity with Bejite's smart tools.
//               </>
//             }
//             buttonText="Sign up as a jobseeker"
//             onClick={() => {

//               if (role === "") {
//                 setRole("jobseeker");
//                 navigate("/jobseeker-option", {
//                   state: {
//                     email,
//                     firstName,
//                     lastName,
//                     role,
//                   },
//                 });

//               }

//             }}
//           />{" "}
//           <br />
//           <RoleCard
//             imageSrc="/assets/images/strongbox.svg"
//             title="EMPLOYER"
//             description={
//               <>
//                 Need talent? Connect with qualified <br />
//                 candidates using Bejite's smart tools.
//               </>
//             }
//             buttonText="Sign up as an employer"
//             onClick={() =>{
//               if (role === "") {
//                 setRole("employer");
//                 navigate("/employer-option", {
//                   state: {
//                     email,
//                     firstName,
//                     lastName,
//                     role,
//                   },
//                 });

//               }
//               }
//             }
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUpRole;

import { useLocation, useNavigate } from "react-router-dom";
import RoleCard from "../components/RoleCard";

const SignUpRole = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, firstName, lastName, password } = location.state || {};

  const handleRoleSelect = (selectedRole) => {
    navigate(
      selectedRole === "jobseeker" ? "/jobseeker-option" : "/employer-option",
      {
        state: {
          email,
          firstName,
          lastName,
          password,
          role: selectedRole,
        },
      },
    );
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="w-full px-4 py-6 flex items-center max-w-screen-xl mx-auto">
        <img src="/assets/images/logo.png" alt="logo" className="h-10" />
      </div>

      <div className="flex flex-col items-center justify-center w-full px-4 py-10 sm:py-20 mt-[5%]">
        <p className="text-3xl sm:text-5xl font-norican font-semibold text-[#16730F] text-center">
          Sign UP As
        </p>

        <div className="mt-20 flex flex-col sm:flex-row gap-10 flex-wrap justify-center items-center w-full max-w-5xl">
          <RoleCard
            imageSrc="/assets/images/user-octagon.svg"
            title="JOBSEEKER"
            description={
              <>
                Looking for a job? Find your next <br />
                opportunity with Bejite's smart tools.
              </>
            }
            buttonText="Sign up as a jobseeker"
            onClick={() => handleRoleSelect("jobseeker")}
          />
          <br />
          <RoleCard
            imageSrc="/assets/images/strongbox.svg"
            title="EMPLOYER"
            description={
              <>
                Need talent? Connect with qualified <br />
                candidates using Bejite's smart tools.
              </>
            }
            buttonText="Sign up as an employer"
            onClick={() => handleRoleSelect("recruiter")}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUpRole;
