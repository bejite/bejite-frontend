import { Route } from "react-router-dom";
import {
  IndividualBasicDetails,
  ProfileSetup,
  Location,
  Verify,
  SelectId,
  UploadDoc,
  InReview,
  CoperateBasicDetails,
  CoperateProfileSetup,
  CompanyDetails,
  CoperateLocation,
  CoperateVerify,
  CoperateUploadDoc,
  CoperateInReview,
  IndividualVerificationLayout,
  CoperateVerificationLayout,
} from "../lazyPages.js";

export const verificationRoutes = (
  <>
      <Route element={<IndividualVerificationLayout />}>
        <Route path="/individual/basic-details" element={<IndividualBasicDetails />} />
        <Route path="/individual/profile-setup" element={<ProfileSetup />} />
        <Route path="/individual/location" element={<Location />} />
        <Route path="/individual/verify" element={<Verify />} />
        <Route path="/individual/selectid" element={<SelectId />} />
        <Route path="/individual/upload" element={<UploadDoc />} />
        <Route path="/individual/inreview" element={<InReview />} />
        <Route
          path="/edit-profile/individual/basic-details"
          element={<IndividualBasicDetails />}
        />
        <Route
          path="/edit-profile/individual/profile-setup"
          element={<ProfileSetup />}
        />
        <Route path="/edit-profile/individual/location" element={<Location />} />
        <Route path="/edit-profile/individual/verify" element={<Verify />} />
        <Route path="/edit-profile/individual/selectid" element={<SelectId />} />
        <Route path="/edit-profile/individual/upload" element={<UploadDoc />} />
      </Route>

      <Route element={<CoperateVerificationLayout />}>
        <Route path="/corporate/basic-details" element={<CoperateBasicDetails />} />
        <Route path="/corporate/profile-setup" element={<CoperateProfileSetup />} />
        <Route path="/corporate/company-details" element={<CompanyDetails />} />
        <Route path="/corporate/location" element={<CoperateLocation />} />
        <Route path="/corporate/verify" element={<CoperateVerify />} />
        <Route path="/corporate/upload" element={<CoperateUploadDoc />} />
        <Route path="/corporate/inreview" element={<CoperateInReview />} />
        <Route
          path="/edit-profile/recruiter/basic-details"
          element={<CoperateBasicDetails />}
        />
        <Route
          path="/edit-profile/recruiter/profile-setup"
          element={<CoperateProfileSetup />}
        />
        <Route
          path="/edit-profile/recruiter/company-details"
          element={<CompanyDetails />}
        />
        <Route path="/edit-profile/recruiter/location" element={<CoperateLocation />} />
        <Route path="/edit-profile/recruiter/verify" element={<CoperateVerify />} />
        <Route
          path="/edit-profile/recruiter/upload-doc"
          element={<CoperateUploadDoc />}
        />
      </Route>
  </>
);
