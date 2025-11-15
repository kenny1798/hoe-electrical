import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { msmartAxios } from "../../api/axios";
import toast from "react-hot-toast";
import { useAuthContext } from "../../hooks/useAuthContext";
import LeadFormModal from "./LeadFormModal";
import ViewSubmissionsModal from "./ViewSubmissionsModal";
import EditLeadFormModal from "./EditLeadFormModal";


function LeadFormBuilder() {
  const { user } = useAuthContext();
  const { teamId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [forms, setForms] = useState([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);


  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await msmartAxios.get(`/api/msmart/lead-forms/${teamId}`, {
          headers: { accessToken: user.token }
        });
        setForms(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch forms");
      }
    };
  
    if (user?.token) fetchForms();
  }, [teamId, user]);
  
  const handleSubmit = async ({
    formTitle, formDescription, formTheme, customUrl, formImageFile, selectedFields, enabledThankYouPage, thankYouPageMessage, enabledRedirect, redirectUrl, isAutoRedirect, faceBookPixel, tikTokPixel, googlePixel}) => {
    if (!formTitle || !customUrl || selectedFields.length === 0) {
      return toast.error("Please complete all fields.");
    }
  
    const payload = new FormData();
    payload.append("teamId", teamId);
    payload.append("formTitle", formTitle);
    payload.append("formDescription", formDescription);
    payload.append("formTheme", formTheme);
    payload.append("customUrl", customUrl);
    payload.append("thankYouEnabled", enabledThankYouPage);
    payload.append("thankYouPageMessage", thankYouPageMessage);
    payload.append("redirectEnabled", enabledRedirect);
    payload.append("redirectUrl", redirectUrl);
    payload.append("autoRedirect", isAutoRedirect);
    payload.append("pixelMeta", faceBookPixel);
    payload.append("pixelTiktok", tikTokPixel);
    payload.append("pixelGoogleAds", googlePixel);
    payload.append("formConfig", JSON.stringify(selectedFields));
    if (formImageFile) {
      payload.append("formImage", formImageFile);
    }
  
    try {
      await msmartAxios.post("/api/msmart/lead-form", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          accessToken: user.token,
        },
      });
      toast.success("Form saved!");
      window.location.reload();
    } catch (err) {
      console.error("Upload error:", err);
    
      let message = "Upload failed";
    
      if (err?.response?.data?.error) {
        message = err.response.data.error;
      } else if (
        typeof err?.response?.data === "string" &&
        err.response.data.includes("MulterError: File too large")
      ) {
        message = "Image too large. Max size is 4MB.";
      } else if (err?.message) {
        message = err.message;
      }
    
      toast.error(message);
    }
  };

  const handleUpdateForm = async (id, updatedData) => {
    try {
      const payload = new FormData();
      for (const key in updatedData) {
        if (key === 'selectedFields') {
          payload.append("formConfig", JSON.stringify(updatedData[key]));
        } else if (key === 'formImageFile' && updatedData[key]) {
          payload.append("formImage", updatedData[key]);
        } else {
          payload.append(key, updatedData[key]);
        }
      }
  
      await msmartAxios.put(`/api/msmart/lead-form/${id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          accessToken: user.token,
        },
      });

      console.log(updatedData)
  
      toast.success("Form updated!");
      setShowEdit(false);
      
    } catch (err) {
      console.error("Upload error:", err);
    
      let message = "Upload failed";
    
      if (err?.response?.data?.error) {
        message = err.response.data.error;
      } else if (
        typeof err?.response?.data === "string" &&
        err.response.data.includes("MulterError: File too large")
      ) {
        message = "Image too large. Max size is 4MB.";
      }else if (
        typeof err?.response?.data === "string" &&
        err.response.data.includes("Only .jpg, .png, .webp allowed")
      ) {
        message = "Invalid file type. Only JPG, PNG, and WebP are allowed.";
    
      } else if (err?.message) {
        message = err.message;
      }
    
      toast.error(message);
    }
  };
  
  
  

  return (
    <div className="container py-4">

<div className="row text-center">
        <div className="col-lg-12">
          <h1 className="mt-4 header-title">M-SMART</h1>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item"><Link className="nav-link" to={`/msmart/db/manage/${teamId}`}>Manage</Link></li>
            <li className="nav-item"><Link className="nav-link" to={`/msmart/db/followup/${teamId}`}>Follow Up</Link></li>
            <li className="nav-item"><Link className="nav-link" to={`/msmart/db/summary/${teamId}`}>Summary</Link></li>
            <li className="nav-item"><Link className="nav-link active" to="#">Form</Link></li>
          </ul>
        </div>

        <div className="card-body">
          <div className="text-end">
          <button onClick={() => setShowModal(true)} className="btn btn-success">
          + Create Form
        </button>
          </div>

        {forms.length === 0 ? (
            <p className="text-muted mt-3">No forms created yet.</p>
          ) : (
            <div className="mt-3">
              {forms.map(form => (
                <div key={form.id} className="card mb-3">
                  <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="mb-0">{form.formTitle}</h5>
                      <small className="text-muted">
                        Created on: {new Date(form.createdAt).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Kuala_Lumpur"
                        })}
                      </small>
                    </div>
                      <div className="d-flex align-items-center py-2 rounded" style={{ fontSize: "0.95rem" }}>
                      <span
                        onClick={() => {
                          const fullUrl = `${process.env.REACT_APP_EASYBORANG}${form.customUrl}`;
                          navigator.clipboard.writeText(fullUrl);
                          toast.success("Link copied!");
                        }}
                        title="Click to copy"
                        style={{
                          cursor: "pointer",
                          color: "#6c757d",
                          marginRight: "0.5rem",
                          overflowWrap: "anywhere",
                          
                        }}
                      >
                        {process.env.REACT_APP_EASYBORANG}{form.customUrl} <i className="bi bi-clipboard" style={{ color: "#6c757d" }}></i>
                      </span>
                      
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                    <a href={process.env.REACT_APP_EASYBORANG + form.customUrl} className="btn btn-sm btn-outline-dark" target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-box-arrow-up-right"></i> View
                    </a>
                    <button
                    className="btn btn-sm btn-outline-dark ms-2"
                    onClick={() => {
                      setSelectedForm(form);
                      setShowEdit(true);
                    }}
                  >
                   <i className="bi bi-pencil"></i> Edit
                  </button>
                    <button
                    className="btn btn-sm btn-dark ms-2"
                    onClick={() => {
                      setSelectedFormId(form.id);
                      setShowSubmissions(true);
                    }}
                  >
                   <i className="bi bi-table"></i> Form Submissions
                  </button>
                  </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
    </div>

    <LeadFormModal
      show={showModal}
      onHide={() => setShowModal(false)}
      onSubmit={handleSubmit}
    />

    <ViewSubmissionsModal
      show={showSubmissions}
      onHide={() => setShowSubmissions(false)}
      formId={selectedFormId}
      token={user.token}
      teamId={teamId}
    />

<EditLeadFormModal
  show={showEdit}
  onHide={() => setShowEdit(false)}
  formData={selectedForm}
  onUpdate={handleUpdateForm}
/>


    </div>
  );
};

export default LeadFormBuilder;