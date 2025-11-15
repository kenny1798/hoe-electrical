import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import countries from "../../components/country";
import { msmartAxios } from "../../api/axios";
import toast from "react-hot-toast";

export default function PublicLeadForm({ setNavbar }) {
  const { customUrl } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [countryCode, setCountryCode] = useState("60");
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);


  const options = countries.map((country) => ({
    value: country.dialCode,
    label: (
      <div style={{ display: "flex", alignItems: "center", fontSize: "0.8rem" }}>
        <img src={country.flag} alt={country.name} style={{ width: 20, marginRight: 5 }} />
        {country.isoCode} (+{country.dialCode})
      </div>
    ),
    isoCode: country.isoCode,
  }));

  const buildUserDesc = () => {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };
  };

  useEffect(() => {
    if (submitted && form?.enabledRedirect && form?.isAutoRedirect && form?.redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = form.redirectUrl;
      }, 5000); // 3 seconds
  
      return () => clearTimeout(timer); // clear timeout kalau unmount
    }
  }, [submitted, form]);

  useEffect(() => {
    if (
      submitted &&
      form?.enabledRedirect &&
      form?.redirectUrl &&
      form?.isAutoRedirect
    ) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = form.redirectUrl;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [submitted, form]);
  
  
  

      useEffect(() => {
          setNavbar(false);
      })

      useEffect(() => {
        msmartAxios.get(`/api/msmart/lead-form/${customUrl}`)
          .then((res) => {
            const fetchedForm = res.data;
      
            // Detect if 'phone' field exists
            const hasPhone = fetchedForm.formConfig.some(f => f.field === "phone");
      
            // Setup initial answers
            const initialAnswers = {};
            if (hasPhone) {
              initialAnswers.phone = "";
              initialAnswers.countryCode = "60";
            }
      
            // Loop semua field
            fetchedForm.formConfig.forEach(f => {
              if (f.field === "extra") {
                initialAnswers[f.label] = "";
              }
              if (f.field === "name") {
                initialAnswers["name"] = ""; // force lowercase key
              }
            });
      
            setForm(fetchedForm);
            setAnswers(initialAnswers);
          })
          .catch((err) => console.error(err));
      }, [customUrl]);
      
      

      const handleChange = (field, value, e) => {
        let key = field;
      
        // Force key lowercase untuk name
        if (field.toLowerCase() === "name") key = "name";
      
        if (key === "phone") {
          let inputValue = e?.target?.value || "";
          let newValue = inputValue.replace(/[^0-9]/g, '');
          if (newValue.startsWith("0")) newValue = newValue.slice(1);
          setAnswers((prev) => ({ ...prev, [key]: newValue }));
        } else if (key === "countryCode") {
          setCountryCode(value);
          setAnswers((prev) => ({ ...prev, [key]: value }));
        } else {
          setAnswers((prev) => ({ ...prev, [key]: value }));
        }
      };
      
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const extraFields = {};
    form.formConfig.forEach(f => {
      if (f.field === "extra") {
        extraFields[f.label] = answers[f.label] || "";
      }
    });
  
    const payload = {
      customUrl: form.customUrl,
      data: {
        countryCode: answers.countryCode,
        phone: answers.phone,
        name: answers.name || `${customUrl} Lead`,
        extra: extraFields,
        desc: buildUserDesc() // ✅ Send this
      }
    };
  
    try {
      await msmartAxios.post("/api/msmart/lead-form/submit", payload);
      toast.success("Thank you! Form submitted.");
      setSubmitted(true);
    } catch (err) {
      console.error(err?.response?.data || err.message);
      toast.error("Failed to submit form.");
    }
  };

  function getContrastYIQ(hexcolor) {
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white"; // YIQ ≥128 = terang, else gelap
  }

  console.log(answers)
  
  if (!form) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }  


  return (
    <div className="container">
        <div className="row justify-content-center">
        <div className="col-md-6">
        <div className="card">
          <div className="card-body">
          {submitted ? (
  <>
    {form.enabledThankYouPage && (
      <div className="text-center py-5">
        <h3 className="mb-4">
          {form.thankYouPageMessage === "" ? "Thank you!" : form.thankYouPageMessage}
        </h3>

        {/* Manual Redirect */}
        {form.enabledRedirect && form.redirectUrl && !form.isAutoRedirect && (
          <a
            href={form.redirectUrl}
            className="btn"
            style={{
              backgroundColor: form.formTheme || "#0d6efd",
              color: getContrastYIQ(form.formTheme || "#0d6efd"),
            }}
          >
            Go to Page
          </a>
        )}

        {/* Auto Redirect */}
        {form.enabledRedirect && form.redirectUrl && form.isAutoRedirect && (
          <p className="mt-3 text-muted">
            Redirecting in {countdown} second{countdown > 1 ? "s" : ""}...
          </p>
        )}
      </div>
    )}
  </>
          ) : (
            <>
            <div className="text-center">
              {form.formImage && (
                <img
                  src={`${process.env.REACT_APP_MSMART}${form.formImage}`}
                  alt="form"
                  className="img-fluid mb-3"
                />
              )}
              <h3 className="my-4" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {form.formTitle}
              </h3>
              <p>{form.formDescription}</p>
            </div>
            <form onSubmit={handleSubmit}>
              {form.formConfig.map((field, index) => (
                <div className="mb-3" key={index}>
                  {field.field === "phone" ? (
                    <>
                      <label className="text-muted">{field.label}</label>
                      <div className="input-group">
                        <div className="input-group-text p-0" style={{ zIndex: 9999 }}>
                          <Select
                            options={options}
                            value={options.find((o) => o.value === countryCode)}
                            styles={{
                              control: (base) => ({
                                ...base,
                                border: "none",
                                boxShadow: "none",
                              }),
                            }}
                            onChange={(e) => handleChange("countryCode", e.value)}
                            defaultValue={options.find((o) => o.value === "60")}
                          />
                        </div>
                        <input
                          type="number"
                          className="form-control shadow-none"
                          value={answers.phone || ""}
                          onChange={(e) => handleChange("phone", "", e)}
                        />
                      </div>
                    </>
                  ) : field.field === "name" ? (<>
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control shadow-none"
                        placeholder={field.label}
                        required={field.required}
                        onChange={(e) => handleChange(field.field, e.target.value)}
                      />
                      <label>{field.label}</label>
                    </div>
                  </>) : (
                    <>
                      {field.type === "select" && field.options ? (
                        <div className="form-floating">
                          <select
                            className="form-select"
                            required={field.required}
                            onChange={(e) => handleChange(field.label, e.target.value)}
                          >
                            <option value="" disabled selected hidden>
                              -- Select Answer --
                            </option>
                            {field.options.map((opt, i) => (
                              <option
                                key={i}
                                value={typeof opt === "string" ? opt : opt.label}
                              >
                                {typeof opt === "string" ? opt : opt.label}
                              </option>
                            ))}
                          </select>
                          <label>{field.label}</label>
                        </div>
                      ) : (
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control"
                            placeholder={field.label}
                            required={field.required}
                            onChange={(e) => handleChange(field.label, e.target.value, e)}
                          />
                          <label>{field.label}</label>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              <div className="d-grid">
                <button
                  type="submit"
                  className="btn mt-3"
                  style={{
                    backgroundColor: form.formTheme || "#0d6efd",
                    borderColor: form.formTheme || "#0d6efd",
                    color: getContrastYIQ(form.formTheme || "#0d6efd"),
                  }}
                >
                  Submit
                </button>
              </div>
            </form>
          </>
          )}

          </div>
            </div>
            </div>
        </div>

    </div>
  );
}
