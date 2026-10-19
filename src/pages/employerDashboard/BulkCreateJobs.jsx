import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUpload,
  FaDownload,
  FaFileExcel,
  FaChevronLeft,
  FaCheckCircle,
  FaSpinner,
  FaTrash,
  FaBriefcase,
  FaMapMarkerAlt,
  FaClock,
  FaFileCsv,
  FaExclamationCircle,
} from "react-icons/fa";
import NewsFeedLayout from "../../components/layout/NewsFeedLayout";
import { toast } from "react-toastify";
import { createEmployerJob } from "../../services/employerApi";
import {
  downloadBulkJobTemplate,
  parseBulkJobsFile,
} from "../../utils/parseBulkJobsCsv";

const BulkCreateJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [publishedCount, setPublishedCount] = useState(0);
  const [fileName, setFileName] = useState("");

  const validJobs = useMemo(
    () => jobs.filter((job) => job.isValid),
    [jobs],
  );
  const invalidJobs = useMemo(
    () => jobs.filter((job) => !job.isValid),
    [jobs],
  );

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const supportedFormats = ["csv", "txt", "xlsx", "xls"];

    if (!supportedFormats.includes(fileExtension)) {
      toast.error(
        "Unsupported file format. Upload CSV, TXT, or Excel (.xlsx/.xls).",
        { position: "top-right", autoClose: 4000 },
      );
      event.target.value = "";
      return;
    }

    setFileName(file.name);
    setJobs([]);
    setUploading(true);

    try {
      const parsedJobs = await parseBulkJobsFile(file);
      setJobs(parsedJobs);

      const validCount = parsedJobs.filter((job) => job.isValid).length;
      const invalidCount = parsedJobs.length - validCount;

      if (invalidCount > 0) {
        toast.warn(
          `Loaded ${parsedJobs.length} rows. ${validCount} valid, ${invalidCount} need fixes.`,
          { position: "top-right", autoClose: 4000 },
        );
      } else {
        toast.success(
          `Successfully loaded ${parsedJobs.length} jobs from ${file.name}`,
          { position: "top-right", autoClose: 3000 },
        );
      }
    } catch (error) {
      console.error("Bulk CSV parse error:", error);
      setJobs([]);
      toast.error(error.message || "Failed to parse CSV file", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveJob = (index) => {
    setJobs((current) => current.filter((_, i) => i !== index));
    toast.info("Job removed from list", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleSubmitAll = async () => {
    if (!validJobs.length) {
      toast.error("Fix validation errors before publishing.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setProcessing(true);

    const failures = [];
    let createdCount = 0;

    for (const job of validJobs) {
      try {
        const response = await createEmployerJob({
          title: job.payload.title.trim(),
          industry: job.payload.industry.trim(),
          about: job.payload.about?.trim() || undefined,
          roles: job.payload.roles.trim(),
          responsibilities: job.payload.responsibilities.trim(),
          workMode: job.payload.workMode,
          country: job.payload.country.trim(),
          state: job.payload.state.trim() || undefined,
          skills: job.payload.skills,
        });

        if (!response?.success) {
          throw new Error(response?.message || "Failed to publish job");
        }

        createdCount += 1;
      } catch (error) {
        failures.push({
          rowNumber: job.rowNumber,
          title: job.payload.title,
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to publish job",
        });
      }
    }

    setProcessing(false);

    if (createdCount > 0 && failures.length === 0) {
      setPublishedCount(createdCount);
      setSuccess(true);
      toast.success(`Successfully published ${createdCount} jobs!`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (createdCount > 0) {
      toast.warn(
        `Published ${createdCount} jobs, but ${failures.length} failed.`,
        { position: "top-right", autoClose: 5000 },
      );
      setPublishedCount(createdCount);
      setSuccess(true);
      return;
    }

    toast.error(
      failures[0]?.message || "Failed to publish jobs. Please try again.",
      { position: "top-right", autoClose: 5000 },
    );
  };

  if (success) {
    return (
      <NewsFeedLayout showSidebars={false}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-5xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Jobs Created Successfully!
            </h2>
            <p className="text-gray-500 mb-6">
              {publishedCount} job vacancies have been published.
            </p>
            <button
              onClick={() => navigate("/employer/dashboard")}
              className="px-6 py-3 bg-[#16730F] text-white rounded-xl font-semibold hover:bg-[#145A0C] transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </NewsFeedLayout>
    );
  }

  return (
    <NewsFeedLayout showSidebars={false}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/employer/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#16730F] mb-6 transition-colors group"
        >
          <FaChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-20 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Bulk Upload
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Upload a CSV or Excel file with your job rows. Preview shows only
                what was parsed from your file.
              </p>

              <button
                onClick={() => {
                  downloadBulkJobTemplate();
                  toast.success("Template downloaded successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                  });
                }}
                className="w-full mb-4 px-4 py-3 border-2 border-[#16730F] text-[#16730F] rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                <FaDownload />
                Download Template (CSV)
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.txt,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading || processing}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#16730F] transition-colors cursor-pointer">
                  {uploading ? (
                    <>
                      <FaSpinner className="text-4xl text-[#16730F] mx-auto mb-3 animate-spin" />
                      <p className="text-gray-600">Processing {fileName}...</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Parsing uploaded file
                      </p>
                    </>
                  ) : (
                    <>
                      {fileName ? (
                        <FaFileCsv className="text-4xl text-green-600 mx-auto mb-3" />
                      ) : (
                        <FaUpload className="text-4xl text-gray-400 mx-auto mb-3" />
                      )}
                      <p className="text-gray-600">
                        {fileName
                          ? fileName
                          : "Click or drag a CSV or Excel file here"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Supported: CSV, TXT, Excel (.xlsx, .xls)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {jobs.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900">
                      Ready to publish:
                    </span>
                    <span className="bg-[#16730F] text-white px-3 py-1 rounded-full text-sm font-bold">
                      {validJobs.length} jobs
                    </span>
                  </div>

                  {invalidJobs.length > 0 ? (
                    <div className="bg-amber-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-amber-800">
                        <FaExclamationCircle />
                        <span>
                          {invalidJobs.length} row
                          {invalidJobs.length !== 1 ? "s" : ""} need fixes
                          before publishing
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <FaCheckCircle />
                        <span>All rows validated successfully</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSubmitAll}
                    disabled={processing || validJobs.length === 0}
                    className="w-full bg-[#16730F] text-white py-3 rounded-xl font-semibold hover:bg-[#145A0C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Publishing {validJobs.length} jobs...
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        Publish {validJobs.length} Job
                        {validJobs.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FaBriefcase className="text-[#16730F]" />
                    Preview Jobs
                  </h3>
                  {jobs.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {jobs.length} row{jobs.length !== 1 ? "s" : ""} from{" "}
                      {fileName || "uploaded file"}
                    </span>
                  )}
                </div>
              </div>

              {jobs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFileExcel className="text-4xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No jobs uploaded yet
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Download the template, add your job rows, then upload the
                    file to preview them here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {jobs.map((job, index) => (
                    <div
                      key={job.id}
                      className={`p-5 transition-colors group ${
                        job.isValid ? "hover:bg-gray-50" : "bg-amber-50/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-bold text-gray-900 text-lg">
                              {job.payload.title || `Row ${job.rowNumber}`}
                            </h4>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                              {job.payload.workMode}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                              {job.payload.industry || "No industry"}
                            </span>
                            {!job.isValid && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium">
                                Row {job.rowNumber}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt className="text-xs" />
                              {[job.payload.state, job.payload.country]
                                .filter(Boolean)
                                .join(", ") || "No location"}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-xs" />
                              72 hours visibility
                            </span>
                          </div>

                          {job.payload.about?.trim() && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {job.payload.about}
                            </p>
                          )}

                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {job.payload.responsibilities ||
                              "No responsibilities provided"}
                          </p>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            <span className="font-medium text-gray-700">
                              Roles:
                            </span>{" "}
                            {job.payload.roles || "No roles provided"}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {job.payload.skills.slice(0, 4).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                              >
                                {skill.skill} • {skill.experience}y
                              </span>
                            ))}
                            {job.payload.skills.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">
                                +{job.payload.skills.length - 4} more
                              </span>
                            )}
                          </div>

                          {job.errors.length > 0 && (
                            <div className="mt-3 text-sm text-amber-800">
                              {job.errors.join(" • ")}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveJob(index)}
                          className="text-gray-400 hover:text-red-500 p-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                          title="Remove job"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {jobs.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Valid Jobs</span>
                    <span className="font-semibold text-gray-900">
                      {validJobs.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Rows Needing Fixes</span>
                    <span className="font-semibold text-amber-700">
                      {invalidJobs.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </NewsFeedLayout>
  );
};

export default BulkCreateJobs;
