import axiosInstance from "../utils/axiosInstance";

export async function getProfileVisibilitySetting() {
  const { data } = await axiosInstance.get("/auth/user/profile/visibility");
  return {
    visibility: data?.visibility || "public",
    label: data?.label || "Public",
  };
}

export async function updateProfileVisibilitySetting(labelOrVisibility) {
  const body =
    typeof labelOrVisibility === "string" &&
    ["Public", "Friends Only", "Private"].includes(labelOrVisibility)
      ? { label: labelOrVisibility }
      : { visibility: labelOrVisibility };

  const { data } = await axiosInstance.patch(
    "/auth/user/profile/visibility",
    body,
  );
  return {
    visibility: data?.visibility || "public",
    label: data?.label || "Public",
  };
}
