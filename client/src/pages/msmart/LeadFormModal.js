import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Select from "react-select";
import countries from "../../components/country";
import toast from "react-hot-toast";

function LeadFormModal({ show, onHide, onSubmit }) {
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTheme, setFormTheme] = useState("#000000");
  const [customUrl, setCustomUrl] = useState("");
  const [formImageFile, setFormImageFile] = useState(null);
  const [enabledThankYouPage, setEnabledThankYouPage] = useState(false);
  const [thankYouPageMessage, setThankYouPageMessage] = useState("");
  const [enabledRedirect, setEnabledRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isAutoRedirect, setIsAutoRedirect] = useState(false);
  const [enablePixel, setEnablePixel] = useState(false);
  const [faceBookPixel, setFaceBookPixel] = useState("");
  const [tikTokPixel, setTikTokPixel] = useState("");
  const [googlePixel, setGooglePixel] = useState("");
  const [selectedFields, setSelectedFields] = useState([
    { field: "phone", label: "Phone Number", required: true, type: "input" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const options = countries.map((country) => ({
    value: country.dialCode,
    label: (
      <div style={{ display: "flex", alignItems: "center", fontSize: "0.8rem" }}>
        <img src={country.flag} alt={country.name} style={{ width: "20px", marginRight: "5px" }} />
        {country.isoCode} (+{country.dialCode})
      </div>
    ),
    name: country.name,
    isoCode: country.isoCode,
  }));

  const handleAddExtra = () => {
    const count = selectedFields.filter((f) => f.field === "extra").length + 1;
    setSelectedFields((prev) => [
      ...prev,
      { field: "extra", label: `Extra Option ${count}`, required: false, type: "input", options: [] },
    ]);
  };

  const handleAddName = () => {
    const alreadyHasName = selectedFields.some((f) => f.field === "name");
    if (!alreadyHasName) {
      setSelectedFields((prev) => [
        ...prev,
        { field: "name", label: "Name", required: false, type: "input" },
      ]);
    } else {
      toast.error("Name field already added");
    }
  };

  const handleDeleteField = (index) => {
    const updated = [...selectedFields];
    updated.splice(index, 1);
    setSelectedFields(updated);
  };

  const moveUp = (index) => {
    const updated = [...selectedFields];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    setSelectedFields(updated);
  };

  const moveDown = (index) => {
    const updated = [...selectedFields];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setSelectedFields(updated);
  };

  const updateField = (index, key, value) => {
    const updated = [...selectedFields];
    updated[index][key] = value;
    setSelectedFields(updated);
  };

  const handleSubmit = async () => {
    if (!formTitle || !customUrl || selectedFields.length === 0) {
      return toast.error("Please complete all fields.");
    }

    if (formImageFile?.size > 2 * 1024 * 1024) {
      return toast.error("Image file size too large. Max size is 2MB.");
    }

    // ✅ check type hanya bila ada file
    if (
      formImageFile &&
      formImageFile.type !== "image/jpeg" &&
      formImageFile.type !== "image/png" &&
      formImageFile.type !== "image/webp"
    ) {
      return toast.error("Image file type must be JPEG, PNG, or WebP.");
    }

    setSubmitting(true);
    try {
      await onSubmit({
        formTitle,
        formDescription,
        formTheme,
        customUrl,
        formImageFile,
        selectedFields,
        enabledThankYouPage,
        thankYouPageMessage,
        enabledRedirect,
        redirectUrl,
        isAutoRedirect,
        faceBookPixel,
        tikTokPixel,
        googlePixel,
      });
      onHide();
    } catch (err) {
      console.error(err);
      toast.error("Error saving form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomUrlChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\s+/g, "-");
    value = value.replace(/[^a-zA-Z0-9\-]/g, "");
    value = value.toLowerCase();
    setCustomUrl(value);
  };

  const sanitizeUrl = (input) => {
    if (!input) return "";
    const trimmed = input.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Create Custom Form</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="row">
          {/* LEFT */}
          <div className="col-lg-6 mb-3">
            <div className="form-floating mb-3">
              <input type="text" className="form-control" placeholder="Custom URL"
                value={customUrl} onChange={handleCustomUrlChange} />
              <label>Custom URL</label>
            </div>

            <div className="form-floating mb-3">
              <input type="text" className="form-control" placeholder="Form Title"
                value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              <label>Form Title</label>
            </div>

            <div className="form-floating mb-3">
              <textarea className="form-control" placeholder="Form Description"
                style={{ height: "100px" }} value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)} />
              <label>Form Description</label>
            </div>

            <div className="mb-3">
              <label className="form-label">Form Image</label>
              <input type="file" className="form-control" onChange={(e) => setFormImageFile(e.target.files[0] || null)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Theme Color</label>
              <input type="color" className="form-control form-control-color"
                value={formTheme} onChange={(e) => setFormTheme(e.target.value)} />
            </div>

            <hr />

            <h5 className="text-muted">Form Fields</h5>
            <div className="card">
              <div className="card-body">
                {selectedFields.map((field, index) => (
                  <div key={index} className="border rounded p-3 mb-3">
                    <div className="d-flex align-items-start mb-2">
                      <div className="flex-grow-1 me-2" style={{ minWidth: 0 }}>
                        <strong
                          className="d-block text-truncate"
                          style={{ maxWidth: "100%", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
                        >
                          {field.label}
                        </strong>
                      </div>

                      <div className="btn-group btn-group-sm ms-auto" role="group" style={{ whiteSpace: "nowrap" }}>
                        {index > 0 && (
                          <button type="button" className="btn btn-outline-secondary" onClick={() => moveUp(index)}>
                            <i className="bi bi-arrow-up"></i>
                          </button>
                        )}
                        {index < selectedFields.length - 1 && (
                          <button type="button" className="btn btn-outline-secondary" onClick={() => moveDown(index)}>
                            <i className="bi bi-arrow-down"></i>
                          </button>
                        )}
                        {field.field !== "phone" && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteField(index)}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="form-floating mb-2">
                      <input type="text" className="form-control" placeholder="Label"
                        value={field.label} onChange={(e) => updateField(index, "label", e.target.value)} />
                      <label>Custom Label</label>
                    </div>

                    {field.field === "phone" || field.field === "name" ? (
                      <></>
                    ) : (
                      <>
                        <div className="form-floating mb-2">
                          <select className="form-select" value={field.type || "input"} onChange={(e) => updateField(index, "type", e.target.value)}>
                            <option value="input">Input Field</option>
                            <option value="select">Dropdown</option>
                          </select>
                          <label>Field Type</label>
                        </div>

                        {field.type === "select" && (
                          <>
                            {(field.options || []).map((opt, i) => (
                              <div key={i} className="d-flex align-items-center mb-1">
                                <input
                                  type="text"
                                  className="form-control me-2"
                                  value={typeof opt === "string" ? opt : opt.label}
                                  onChange={(e) => {
                                    const updated = [...selectedFields];
                                    if (!updated[index].options) updated[index].options = [];
                                    // normalize to string label (kekalkan ringan)
                                    updated[index].options[i] = e.target.value;
                                    setSelectedFields(updated);
                                  }}
                                />
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => {
                                    const updated = [...selectedFields];
                                    updated[index].options.splice(i, 1);
                                    setSelectedFields(updated);
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}

                            <button
                              className="btn btn-sm btn-outline-primary my-2"
                              onClick={() => {
                                const updated = [...selectedFields];
                                if (!updated[index].options) updated[index].options = [];
                                updated[index].options.push(`Option ${updated[index].options.length + 1}`);
                                setSelectedFields(updated);
                              }}
                            >
                              + Add Option
                            </button>
                          </>
                        )}
                      </>
                    )}

                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id={`required-${index}`}
                        checked={field.required} onChange={(e) => updateField(index, "required", e.target.checked)}
                        disabled={field.field === "phone"} />
                      <label className="form-check-label" htmlFor={`required-${index}`}>
                        Required {field.field === "phone" && "(locked)"}
                      </label>
                    </div>
                  </div>
                ))}

                <div className="d-flex gap-2">
                  <button className="btn btn-dark" onClick={handleAddExtra}>+ Add Extra Field</button>
                  <button className="btn btn-outline-primary" onClick={handleAddName}>+ Add Name Field</button>
                </div>
              </div>
            </div>

            <hr />

            <h5 className="text-muted">After Submission</h5>
            <div className="card">
              <div className="card-body">
                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="enableThankYou"
                    checked={enabledThankYouPage}
                    onChange={(e) => setEnabledThankYouPage(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableThankYou">
                    Show Thank You Message
                  </label>
                </div>

                {enabledThankYouPage && (
                  <>
                    <div className="form-floating mb-3">
                      <textarea
                        className="form-control"
                        style={{ height: "80px" }}
                        value={thankYouPageMessage}
                        onChange={(e) => setThankYouPageMessage(e.target.value)}
                        placeholder="Your thank you message"
                      />
                      <label>Thank You Message</label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="enableRedirect"
                        checked={enabledRedirect}
                        onChange={(e) => setEnabledRedirect(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="enableRedirect">
                        Redirect to URL after submit
                      </label>
                    </div>

                    {enabledRedirect && (
                      <>
                        <div className="form-floating mb-3">
                          <input
                            type="url"
                            className="form-control"
                            value={redirectUrl}
                            onChange={(e) => setRedirectUrl(sanitizeUrl(e.target.value))}
                            placeholder="https://example.com"
                          />
                          <label>Redirect URL</label>
                        </div>

                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="isAutoRedirect"
                            checked={isAutoRedirect}
                            onChange={(e) => setIsAutoRedirect(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="isAutoRedirect">
                            Auto Redirect?
                          </label>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <h5 className="text-muted">Form Tracking</h5>
            <div className="card">
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={enablePixel}
                    onChange={(e) => setEnablePixel(e.target.checked)}
                    id="enablePixel"
                  />
                  <label className="form-check-label" htmlFor="enablePixel">
                    Enable Tracking Pixels (Meta, TikTok, Google Ads)
                  </label>
                </div>

                {enablePixel && (
                  <>
                    <div className="form-floating mb-3">
                      <textarea
                        type="text"
                        className="form-control"
                        placeholder="Meta Pixel ID"
                        onChange={(e) => setFaceBookPixel(e.target.value)}
                        rows={3}
                      />
                      <label>Meta Pixel ID</label>
                    </div>

                    <div className="form-floating mb-3">
                      <textarea
                        type="text"
                        className="form-control"
                        placeholder="TikTok Pixel ID"
                        onChange={(e) => setTikTokPixel(e.target.value)}
                        rows={3}
                      />
                      <label>TikTok Pixel ID</label>
                    </div>

                    <div className="form-floating mb-3">
                      <textarea
                        type="text"
                        className="form-control"
                        placeholder="Google Ads Conversion ID"
                        onChange={(e) => setGooglePixel(e.target.value)}
                        rows={3}
                      />
                      <label>Google Ads Conversion ID</label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-lg-6">
            <div className="border rounded p-4 bg-light">
              <h5 className="text-muted mb-4">
                Form Preview - <span><small>{(process.env.REACT_APP_EASYBORANG || "").slice(8)}{customUrl}</small></span>
              </h5>

              <div className="text-center">
                {formImageFile && (
                  <img src={URL.createObjectURL(formImageFile)} alt="preview" className="img-fluid mb-3" />
                )}
                <h4>{formTitle || "Form Title Preview"}</h4>
                <p>{formDescription || "Form description will appear here."}</p>
              </div>

              <form>
                {selectedFields.map((field, idx) => (
                  <div key={idx} className="card mb-3 border-0 shadow-sm" style={{ background: "#f8f9fa" }}>
                    <div className="card-body py-3 px-2">
                      {field.field === "phone" ? (
                        <>
                          <label className="form-label mb-1" style={{ fontSize: "0.95rem", fontWeight: 500, color: "#343a40" }}>
                            {field.label}
                          </label>
                          <div className="input-group">
                            <div className="input-group-text p-0" style={{ zIndex: 9999 }}>
                              <Select
                                options={options}
                                styles={{ control: (base) => ({ ...base, border: "none", boxShadow: "none" }) }}
                                className="border-0"
                              />
                            </div>
                            <input type="number" className="form-control shadow-none" placeholder={field.label} />
                          </div>
                        </>
                      ) : field.type === "select" ? (
                        <>
                          <label className="form-label mb-1" style={{ fontSize: "0.95rem", fontWeight: 500, color: "#343a40" }}>
                            {field.label}
                          </label>
                          <select className="form-select shadow-none" defaultValue="">
                            <option value="" disabled hidden>
                              -- Select Answer --
                            </option>
                            {(field.options || []).map((opt, i) => (
                              <option key={i}>
                                {typeof opt === "string" ? opt : opt.label}
                              </option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <>
                          <label className="form-label mb-1" style={{ fontSize: "0.95rem", fontWeight: 500, color: "#343a40" }}>
                            {field.label}
                          </label>
                          <input type="text" className="form-control shadow-none" />
                        </>
                      )}
                    </div>
                  </div>
                ))}

                <button type="button" className="btn w-100 text-white" style={{ backgroundColor: formTheme }}>
                  Submit Form
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save Form"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LeadFormModal;
