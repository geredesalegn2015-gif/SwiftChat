// client/src/services/apiUpload.js
export const handleFileUpload = async (files) => {
  const formData = new FormData();
  for (const file of files) {
    formData.append("mediaFiles", file);
  }

  const res = await fetch("http://localhost:8000/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.uploaded; // must match { url, type, name, size }
};
