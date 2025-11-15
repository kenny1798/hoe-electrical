import React, { useEffect, useState } from "react";
import { Modal, Table, Button } from "react-bootstrap";
import { msmartAxios } from "../../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function ViewSubmissionsModal({ show, onHide, formId, token, teamId  }) {
  const [submissions, setSubmissions] = useState([]);
  const [expandedRowId, setExpandedRowId] = useState(null);

  useEffect(() => {
    if (show && formId) {
      msmartAxios
        .get(`/api/msmart/lead-form/${formId}/submissions`, {
          headers: { accessToken: token },
        })
        .then((res) => setSubmissions(res.data))
        .catch((err) => {
          console.error(err);
          toast.error("Failed to fetch submissions");
        });
    }
  }, [show, formId, token]);

    // --- CSV helpers ---
    const csvEscape = (val) => {
      if (val === null || val === undefined) return "";
      // tukar object -> JSON string
      const s = typeof val === "object" ? JSON.stringify(val) : String(val);
      // jika ada koma, petik, atau newline, bungkus guna petik dan escape petik berganda
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
  
    const handleExportCsv = () => {
      if (!submissions?.length) {
        toast.error("No submissions to export");
        return;
      }
  
      // kumpul semua key dari answers
      const answerObjs = submissions.map((s) => s.answers || {});
      const keySet = new Set();
      answerObjs.forEach((a) => Object.keys(a).forEach((k) => keySet.add(k)));
  
      // susun: letak key common depan, lain ikut abjad
      const preferred = ["countryCode", "phone", "name"];
      const others = [...keySet].filter((k) => !preferred.includes(k)).sort();
      const headers = [...preferred.filter((k) => keySet.has(k)), ...others];
  
      if (headers.length === 0) {
        toast.error("Submissions have no answer fields to export");
        return;
      }
  
      // bina rows ikut headers
      const rows = answerObjs.map((a) => headers.map((h) => csvEscape(a[h])));
  
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  
      // download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form-${formId || "unknown"}-submissions.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  
      toast.success("CSV exported");
    };
  


  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Form Submissions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <div className="d-flex justify-content-end mb-3">
        <Button variant="outline-secondary" size="sm" onClick={handleExportCsv}>
          Export CSV
        </Button>
      </div>
        {submissions.length === 0 ? (
          <p className="text-muted">No submissions found.</p>
        ) : (
          <Table hover responsive style={{fontSize: '0.9rem'}}>
            <thead>
            <tr>
                <th>#</th>
                <th>Phone</th>
                <th>Name</th>
                <th>Status</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
  {submissions.map((sub, i) => {
    const ans = sub.answers || {};
    const lead = sub.msmartlead || {};
    const isExpanded = expandedRowId === sub.id;

    const extraFields = Object.entries(ans)
      .filter(([key]) => !["name", "phone", "countryCode"].includes(key))
      .map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {typeof value === "object" ? JSON.stringify(value) : value}
        </div>
      ));

    return (
      <React.Fragment key={sub.id}>
        <tr
          onClick={() => setExpandedRowId(isExpanded ? null : sub.id)}
          style={{ cursor: "pointer" }}
          className="align-middle"
        >
          <td>{i + 1}</td>
          <td>
            <span >{ans.countryCode + ans.phone || "-"}</span>
          </td>
          <td>{ans.name || "-"}</td>
          <td>
            <span>{lead.status || "No Status"}</span>
          </td>
          <td colSpan={2}>
            {isExpanded ? (
              <span className="text-primary">Click to collapse ↓</span>
            ) : (
              <span className="text-muted">Click to show →</span>
            )}
          </td>
        </tr>

        {isExpanded && (
  <tr className="bg-light">
    <td colSpan={6}>
      <div className="p-3" style={{
        backgroundColor: '#f8faff',  // ⚡ Slight blue
        border: '1px solid #cce',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      }}>
        <h6 className="mb-2 text-primary">Answers</h6>
        <div className="mb-3">
          {extraFields.length ? (
            <ul className="mb-0">
              {extraFields}
            </ul>
          ) : (
            <em className="text-muted">No extra fields submitted.</em>
          )}
        </div>

        <hr />

        <div style={{ fontSize: "0.85rem" }}>
          <div><strong>Submitted At:</strong> {new Date(sub.submittedAt).toLocaleString()} ({sub.desc?.timezone})</div>
        </div>

        <div className="mt-3 text-end">
          <Link
            to={`/msmart/db/manage/${sub.msmartlead?.teamId}?searchPhone=${ans.countryCode}${ans.phone}`}
            className="btn btn-outline-primary btn-sm"
            target="_blank"
          >
            Manage Lead
          </Link>
        </div>
      </div>
    </td>
  </tr>
)}

      </React.Fragment>
    );
  })}
</tbody>


          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
}
