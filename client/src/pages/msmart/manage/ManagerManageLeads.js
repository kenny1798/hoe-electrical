import React, { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { msmartAxios } from "../../../api/axios";
import { Link, useParams, useLocation  } from "react-router-dom";
import countries from "../../../components/country";
import Select from "react-select";
import { NumericFormat } from "react-number-format";
import "flatpickr/dist/themes/material_green.css";
import Flatpickr from "react-flatpickr";
import { useRef } from 'react';
import { useToast } from '../../../context/ToastContext';
import ExcelJS from 'exceljs';
import { formatDistanceToNow, format } from 'date-fns';

import template from "../../../components/Bulk_Upload_Template.xlsx";

function ManagerManageLeads() {

  const {user} = useAuthContext();
  const {teamId} = useParams();
  const [dbData, setDbData] = useState([]);
  const location = useLocation();

  const { notifyError, notifySuccess } = useToast();
  const [viewMode, setViewMode] = useState('card');

  const [deleteDbId, setDeleteDbId] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [filterKey, setFilterKey] = useState('phone');
  const [filterValue, setFilterValue] = useState('');
  const [view, setView] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 26;
  const [isLoading, setIsLoading] = useState(true);
  const [bulkFile, setBulkFile] = useState(null);
  const [uploadStep, setUploadStep] = useState('select_mode');
  const [uploadMode, setUploadMode] = useState('easy');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [editingPreviewRowId, setEditingPreviewRowId] = useState(null);
  const originalPhonesRef = useRef(new Map());
  const [fileHeaders, setFileHeaders] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
        name: '',
        phone_number_full: '',
        status: '',
        remark: '',
        followUpDate: '',
        followUpTime: ''
    });
  const [phoneFormat, setPhoneFormat] = useState('single'); 

  //create
  const [createName, setCreateName] = useState("");
  const [createCountry, setCreateCountry] = useState("");
  const [createMobile, setCreateMobile] = useState("");
  const [createStatus, setCreateStatus] = useState("");
  const [createRemarks, setCreateRemarks] = useState("");
  const [createFollowUp, setCreateFollowUp] = useState("");
  const [createClosedAmount, setCreateClosedAmount] = useState('');

  //edit
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [editFollowUp, setEditFollowUp] = useState("");
  const [editClosedAmount, setEditClosedAmount] = useState('');
  const [editAddedDate, setEditAddedDate] = useState('');
  const [showEditButton, setShowEditButton] = useState(false);
  const [repeatSalesAmt, setRepeatSalesAmt] = useState('');
  const [repeatRemark, setRepeatRemark] = useState('');
  const [isEditingClosedAmount, setIsEditingClosedAmount] = useState(true);
  const initialClosedAmount = useRef('');
  const totalClosedAmount = useRef(0);
  const [salesHistory, setSalesHistory] = useState([]);
  const [activeRepeatTab, setActiveRepeatTab] = useState('form');
  const [closedBaseAmount, setClosedBaseAmount] = useState(0);

  const [editingRowId, setEditingRowId] = useState(null);
  const [editRowAmount, setEditRowAmount] = useState('');
  const [editRowRemarks, setEditRowRemarks] = useState('');




  const options = countries.map(country => ({
    value: country.dialCode,
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={country.flag} alt={country.name} style={{ width: '20px', marginRight: '5px' }} />
        {country.isoCode}
      </div>
    ),
    name: country.name,
    isoCode: country.isoCode,
  }));

  const filterOption = (option, inputValue) => {
    return (
      option.data.name.toLowerCase().includes(inputValue.toLowerCase()) || // Carian ikut nama
      option.data.isoCode.toLowerCase().includes(inputValue.toLowerCase()) // Carian ikut kod ISO
    );
  };

  const fetchData = () => {
    setIsLoading(true);
    msmartAxios.get(`/api/msmart/leads/all/${teamId}`, {
        headers: {
            accessToken: user.token
        }
    }).then((response) => {
        const resdata = response.data;
        if (resdata.error) {
            notifyError(resdata.error);
        } else {
            setDbData(resdata);
        }
    }).catch((err) => {
        notifyError("Error fetching data");
    }).finally(() => {
        setIsLoading(false);
    });
};

  useEffect(() => {
    if (editCountry) {
      const selectedCountry = options.find(option => option.value === editCountry);
      if (selectedCountry) {
        setEditCountry(selectedCountry);
      }
    }
  }, [editCountry, options]);

  useEffect (() => {
    msmartAxios.get('/api/msmart/get/user/team', {
      headers: {
        accessToken: user.token
      }
    }).then((response) => {
      if (response.status === 201){
        if (parseInt(response.data.teamId, 10) === parseInt(teamId, 10)){
          setView(true);
        }else{
          setView(false);
        }
      }
      
    }).catch((err) => {
      notifyError("Error fetching data");
      })
  }, [user.token, teamId])

  useEffect(() => {
    fetchData(); 
}, [teamId, user.token]);

  useEffect(() => {
    if (filterValue) {
      const filtered = dbData.filter(item => {
        if (filterKey === 'phone') {
          const fullPhone = `${item.country}${item.phone}`;
          return fullPhone.toLowerCase().includes(filterValue.toLowerCase());
        }
  
        if (filterKey === 'createdAt' && filterValue.includes(' to ')) {
          const [start, end] = filterValue.split(' to ');
          const itemDate = new Date(item.createdAt);
          const startDate = new Date(`${start}T00:00:00`);
          const endDate = new Date(`${end}T23:59:59`);
          return itemDate >= startDate && itemDate <= endDate;
        }
  
        // fallback untuk semua jenis string match
        return item[filterKey]?.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
  
      setFilteredData(filtered);
    } else {
      setFilteredData(dbData);
    }
  }, [filterKey, filterValue, dbData]);

  useEffect(() => {
    if (editStatus !== 'Closed') {
      setIsEditingClosedAmount(true); // supaya field input aktif semula kalau tukar status
    }
  }, [editStatus]);

  useEffect(() => {
    if (editId && activeRepeatTab === 'history') {
      msmartAxios.get(`/api/msmart/sales/${editId}`, {
        headers: { accessToken: user.token }
      })
      .then(res => {
        setSalesHistory(res.data || []);
      })
      .catch(err => {
        console.error("Error fetching sales history:", err);
        setSalesHistory([]);
      });
    }
  }, [editId, activeRepeatTab, user.token]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const phone = params.get("searchPhone");
    if (phone) {
      setFilterKey("phone");
      setFilterValue(phone);
    }
  }, [location.search]);

  useEffect(() => {
    // Simpan data telefon asal dari DB untuk rujukan semasa re-analyze
    if (previewData.length > 0 && originalPhonesRef.current.size === 0) {
        const phoneMap = new Map();
        previewData.forEach(item => {
            if (item.originalData) {
                phoneMap.set(item.originalData.phone, item.originalData);
            }
        });
        originalPhonesRef.current = phoneMap;
    }
}, [previewData]);

const previewCounts = useMemo(() => {
  const counts = { new: 0, duplicate: 0, error: 0 };
  for (const item of previewData) {
      if (counts.hasOwnProperty(item.status)) {
          counts[item.status]++;
      }
  }
  return counts;
}, [previewData]); 
  
  
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
// FUNGSI BARU untuk dapatkan header
const handleGetHeaders = async () => {
  if (!bulkFile) {
      notifyError("Please select a file.");
      return;
  }
  setIsProcessing(true);
  const formData = new FormData();
  formData.append('file', bulkFile);

  try {
      const response = await msmartAxios.post('/api/msmart/bulk-upload/get-headers', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
              accessToken: user.token,
          },
      });
      setFileHeaders(response.data.headers);
      setUploadStep('mapping'); // Pindah ke skrin mapping
  } catch (err) {
      notifyError(err.response?.data?.error || "Could not get file headers.");
  } finally {
      setIsProcessing(false);
  }
};

// FUNGSI BARU untuk handle butang utama
const handleProceed = () => {
  if (uploadMode === 'easy') {
      handleAnalyzeFile(); // Terus analyze
  } else {
      handleGetHeaders(); // Dapatkan header dulu
  }
};
  const resetUploadModal = () => {
  setUploadStep('select_mode');
  setBulkFile(null);
  setPreviewData([]);
  setFinalReport(null);
  setIsProcessing(false);
  setEditingPreviewRowId(null);
  originalPhonesRef.current = new Map();
  const fileInput = document.getElementById('bulkFile');
  if (fileInput) fileInput.value = "";
};

  const handleAnalyzeFile = async () => {
  if (!bulkFile) {
      notifyError("Please select a file.");
      return;
  }
  setIsProcessing(true);
  const formData = new FormData();
  formData.append('file', bulkFile);
  formData.append('teamId', teamId);
  formData.append('mode', uploadMode);

  if (uploadMode === 'advanced') {
      if (!fieldMapping.phone_number_full && (!fieldMapping.phone || !fieldMapping.country)) {
          notifyError("You must map the phone number field.");
          setIsProcessing(false);
          return;
      }
      formData.append('mapping', JSON.stringify(fieldMapping));
  }

  try {
      const response = await msmartAxios.post('/api/msmart/bulk-upload/analyze', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
              accessToken: user.token,
          },
      });

      const priority = { error: 1, duplicate: 2, new: 3 };
      const sortedData = response.data.previewData.sort((a, b) => priority[a.status] - priority[b.status]);
      
      const processedPreview = sortedData.map(item => ({
          ...item,
          action: item.status === 'duplicate' ? 'skip' : null,
          editData: { ...item.newData },
      }));

      setPreviewData(processedPreview);
      setUploadStep('preview');
  } catch (err) {
      notifyError(err.response?.data?.error || "Failed to analyze the file.");
  } finally {
      setIsProcessing(false);
  }
};

const handleDuplicateActionChange = (rowIndex, action) => {
  const updatedPreviewData = [...previewData];
  updatedPreviewData[rowIndex].action = action;
  setPreviewData(updatedPreviewData);
};

const handleExecuteUpload = async () => {
  setIsProcessing(true);
  const leadsToProcess = previewData
      .filter(item => item.status !== 'error') // Exclude error rows
      .map(item => {
          if (item.status === 'new') {
              return { action: 'create', data: item.newData };
          }
          if (item.status === 'duplicate') {
              return { action: item.action, data: item.newData, originalData: item.originalData };
          }
          return { action: 'skip' };
      });

  try {
      const response = await msmartAxios.post('/api/msmart/bulk-upload/execute', 
          { teamId, leadsToProcess },
          { headers: { accessToken: user.token } }
      );
      setFinalReport(response.data);
      setUploadStep('summary');
      fetchData();
  } catch (err) {
      notifyError(err.response?.data?.error || "Failed to save data.");
  } finally {
      setIsProcessing(false);
  }
};

const handlePreviewRowChange = (index, field, value) => {
  const updatedData = [...previewData];
  updatedData[index].editData[field] = value;
  setPreviewData(updatedData);
};

const handleSavePreviewRow = (index) => {
  const updatedData = [...previewData];
  const editedItem = updatedData[index];

  const sanitizedPhone = editedItem.editData.phone.replace(/\D/g, '');
  const sanitizedCountry = editedItem.editData.country.replace(/\D/g, '');

  // --- LOGIK BARU YANG DIPERBAIKI ---
  if (!sanitizedPhone) {
      editedItem.status = 'error';
      editedItem.errorReason = 'Phone number cannot be empty.';
  } else if (originalPhonesRef.current.has(sanitizedPhone)) {
      // Jika nombor yang diedit wujud dalam senarai asal dari DB,
      // ia adalah DUPLICATE, tak kira apa pun.
      editedItem.status = 'duplicate';
      editedItem.action = 'skip'; // Reset action ke default
      editedItem.errorReason = '';
  } else {
      // Jika tidak, baru ia dianggap NEW.
      editedItem.status = 'new';
      editedItem.action = null; // Reset action
      editedItem.errorReason = '';
  }
  // --- TAMAT LOGIK BARU ---

  // Kemaskini data utama dengan nilai yang telah diedit & dibersihkan
  editedItem.newData = { ...editedItem.newData, ...editedItem.editData, phone: sanitizedPhone, country: sanitizedCountry };
  
  // Isih semula senarai berdasarkan status baru
  const priority = { error: 1, duplicate: 2, new: 3 };
  updatedData.sort((a, b) => priority[a.status] - priority[b.status]);

  setPreviewData(updatedData);
  setEditingPreviewRowId(null); // Keluar dari mode edit
};

//   const handleBulkUpload = (e) => {
//     e.preventDefault();
//     if (!bulkFile) {
//         notifyError("Please select a file");
//         return;
//     }

//     const formData = new FormData();
//     formData.append('file', bulkFile);
//     formData.append('teamId', teamId);

//     setIsUploading(true);   // Start loading indicator
//     setUploadReport(null);  // Reset any previous report

//     msmartAxios.post('/api/msmart/bulk-upload/leads', formData, {
//         headers: {
//             'Content-Type': 'multipart/form-data',
//             accessToken: user.token,
//         },
//     })
//     .then((response) => {
//         // The backend now sends a detailed report object.
//         // We store this object in our state to display it.
//         setUploadReport(response.data);
//         notifySuccess(response.data.message || "Upload process completed.");
//     })
//     .catch((err) => {
//         // Use the smart error handling for specific messages
//         if (err.response && err.response.data && err.response.data.error) {
//             notifyError(err.response.data.error);
//         } else {
//             notifyError("Failed to upload leads. Please try again.");
//         }
//     })
//     .finally(() => {
//         // This will run after .then() or .catch() completes
//         setIsUploading(false); // Stop loading indicator
//     });
// };


//   const resetAndCloseUploadModal = () => {
//     setBulkFile(null);
//     setUploadReport(null);
//     const fileInput = document.getElementById('bulkFile');
//     if(fileInput) fileInput.value = ""; // Reset file input
//     fetchData(); // Refresh data table without reloading the page
// }

  const handleChange = (option) => {
    setEditCountry(option);
    setShowEditButton(true);
  };

  const handleCreateChange = (option) => {
    setCreateCountry(option.value); // Kemaskini state dengan pilihan baru
  };


  const createDb = (e) => {
    e.preventDefault();

    // This client-side validation is good, let's keep it.
    if (createFollowUp && createStatus === "No Status") {
        notifyError("A Follow Up Date is set. Please select a status other than 'No Status'.");
        return;
    }
    
    // Prepare the data payload
    const data = {
        team: teamId,
        name: createName,
        country: createCountry,
        phone: createMobile,
        status: createStatus,
        remarks: createRemarks,
        followUp: createFollowUp,
        salesAmount: createClosedAmount
    };

    msmartAxios.post(`/api/msmart/lead`, data, {
        headers: {
            accessToken: user.token
        }
    })
    .then((response) => {
        // The .then() block now only handles the success case
        if (response.data.status) {
            notifySuccess('Lead created successfully');
            document.getElementById('closeCreate').click();
            setTimeout(() => window.location.reload(), 1500);
        }
    })
    .catch((err) => {
        // --- NEW ERROR HANDLING LOGIC ---
        // This block will catch all non-2xx server responses

        // Check if the error object has a structured response from our API
        if (err.response && err.response.data && err.response.data.error) {
            // If yes, display the specific error message from the backend
            // e.g., "This phone number already exists in your list."
            notifyError(err.response.data.error);
        } else {
            // Fallback for network errors, server crashes, or other unexpected issues
            console.log(err);
            notifyError("A server or network error occurred. Please try again.");
        }
        // --- END OF NEW LOGIC ---
    });
};


  const deleteDB = (e) => {
    e.preventDefault();
    msmartAxios.delete(`/api/msmart/lead/${deleteDbId}`, {headers: {
      accessToken: user.token
    }}).then((response) => {
      if(response.data.succ){
        document.getElementById('deleteConfirm').click();
        notifySuccess("Database deleted successfully");
        setTimeout(() => window.location.reload(), 1500);
      }else{
        document.getElementById('deleteConfirm').click();
        notifyError("Unable to delete database");
      }
    })
  }

  const cancelDelete = () => {
    setDeleteDbId(0);
  }

  const editSingle = (id) => {
    msmartAxios.get(`/api/msmart/lead/${id}`, {headers: {
      accessToken: user.token
    }}).then((response) => {
      const json = response.data.db
      if(json){
        setEditId(json.id);
        setEditName(json.name);
        setEditMobile(json.phone);
        setEditCountry(json.country);
        setEditStatus(json.status);
        setEditRemarks(json.remark);
        setEditClosedAmount(json.salesAmount);
        setEditAddedDate(json.createdAt);
        setClosedBaseAmount(parseFloat(json.salesAmount || 0));
        totalClosedBaseAmount(json.id);

        if(json.followUpDate != null){
          setEditFollowUp(new Date(json.followUpDate.toString()));
        }
      }
    }).catch((err) => {
      notifyError("No response from server, please try again")
    })
  }
  

  const submitEdit = (e) => {
    e.preventDefault();
    if((editFollowUp > new Date(Date.now())) && editStatus === "No Status"){
      notifyError("Follow Up Date detected. Please select status other than 'No Status'");
    }else{
      const data = {name: editName, country: editCountry.value, phone: editMobile, status: editStatus, remark: editRemarks, followUp: editFollowUp, salesAmount: editClosedAmount}
      msmartAxios.put(`/api/msmart/lead/${teamId}/${editId}`, data, {headers: {
        accessToken: user.token
      }}).then((response) => {
        if(response.data.error){
          notifyError(response.data.error);
        }else if(response.data.success){
          notifySuccess('Leads updated successfully')
          document.getElementById('closeEdit').click();
          setTimeout(() => window.location.reload(), 1500);
        }
      }).catch((err) => {
        notifyError("No response from server, please try again")
      })

    }

  }

  const submitRepeat = (e) => {
    e.preventDefault();
      const data = {repeatAmount: repeatSalesAmt, remarks: repeatRemark}
      msmartAxios.post(`/api/msmart/repeat-sale/${teamId}/${editId}`, data, {headers: {
        accessToken: user.token
      }}).then((response) => {
        if(response.data.error){
          notifyError(response.data.error);
        }else if(response.data.message){
          notifySuccess('Sales submitted successfully')
          document.getElementById('closeRepeat').click();
          setTimeout(() => window.location.reload(), 1500);
        }
      }).catch((err) => {
        notifyError("No response from server, please try again")
      })

    

  }

  const handleSaveEdit = async (id) => {
    try {
      await msmartAxios.put(`/api/msmart/repeat-sales/${id}`, {
        repeatAmount: editRowAmount,
        remarks: editRowRemarks
      }, {
        headers: { accessToken: user.token }
      });
  
      const updatedHistory = salesHistory.map((item) =>
        item.id === id
          ? { ...item, repeatAmount: editRowAmount, remarks: editRowRemarks}
          : item
      );
      setSalesHistory(updatedHistory);
      setEditingRowId(null);
      notifySuccess('Sales updated successfully')
    } catch (error) {
      notifyError("Error updating:", error);
    }
  };

  // Letak fungsi ni dalam komponen ManageLeads
const handleDropdownToggle = (e) => {
  // 1. Hentikan klik dari 'tembus' ke kad
  e.stopPropagation();

  // 2. Cari dropdown lain yang sedang terbuka
  const allDropdowns = document.querySelectorAll('.card .dropdown-menu.show');
  const parentBtnGroup = e.currentTarget.parentNode;
  const currentDropdownMenu = parentBtnGroup.querySelector('.dropdown-menu');

  // 3. Tutup semua dropdown lain KECUALI yang kita baru klik
  allDropdowns.forEach(dropdown => {
      if (dropdown !== currentDropdownMenu) {
          dropdown.classList.remove('show');
      }
  });
};
  


  const handlePhoneChange = (e) => {
    let newValue = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if(newValue.startsWith("0") || newValue.startsWith(0)) {
      newValue = newValue.slice(1);
    };
    setShowEditButton(true);
    setEditMobile(newValue);
  };

  const handlePhoneAdd = (e) => {
    let newValue = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if(newValue.startsWith("0") || newValue.startsWith(0)) {
      newValue = newValue.slice(1);
    };
    setCreateMobile(newValue);
  };

  const handleFollowUpChange = (e, type, val) => {
    e.preventDefault();
    setShowEditButton(true);
    if (type === 'Add'){
      if(createStatus !== "Closed"){
        setCreateStatus('Follow Up');
      }
      setCreateFollowUp(val);
    }else if(type === 'Edit'){
      if(editStatus !== "Closed"){
        setEditStatus('Follow Up');
      }
      setEditFollowUp(val);
    }
  }

  const setDefault = (e) => {
    e.preventDefault();
    setRepeatSalesAmt("");
    setShowEditButton(false);
  }

  const totalClosedBaseAmount = (id) => {
    msmartAxios.get(`/api/msmart/sales/${id}`, {
      headers: { accessToken: user.token }
    })
    .then(res => {
      const history = res.data || [];
    
      const totalRepeat = history.reduce((sum, item) => sum + parseFloat(item.repeatAmount || 0), 0);
    
      initialClosedAmount.current = totalRepeat.toFixed(2);
    })
    .catch(err => {
      console.error("Error fetching sales data:", err);
    });
  };

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Filtered Leads");
  
      worksheet.columns = [
        { header: '#', key: 'index', width: 5 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Phone No.', key: 'phone', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Remarks', key: 'remark', width: 15 },
        { header: 'Follow Up Date', key: 'followUpDate', width: 20 },
        { header: 'Created At', key: 'createdAt', width: 20 },
        { header: 'Last Update', key: 'updatedAt', width: 20 },
      ];
  
      filteredData.forEach((lead, idx) => {
        worksheet.addRow({
          index: idx + 1,
          name: lead.name,
          phone: `${lead.country}${lead.phone}`,
          status: lead.status,
          remark: lead.remark || '-',
          followUpDate: lead.followUp ? new Date(lead.followUp).toLocaleDateString('en-GB') : '-',
          createdAt: new Date(lead.createdAt).toLocaleString('en-GB'),
          updatedAt: new Date(lead.updatedAt).toLocaleString('en-GB')
        });
      });
  
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Export_Leads_${user.username}_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      notifyError("Failed to export Excel file");
    }
  };
  

  const totalRepeatAmount = useMemo(() => {
    return salesHistory.reduce((sum, item) => sum + parseFloat(item.repeatAmount || 0), 0);
  }, [salesHistory]);

  const totalClosedValue = useMemo(() => {
    return (closedBaseAmount + totalRepeatAmount).toFixed(2);
  }, [closedBaseAmount, totalRepeatAmount]);
  





  return (

              <div>
                    <div className="container mt-4">
                <div className="row justify-content-center text-center">
                  <div className="col-lg-12">
                  <h1 className="mt-4 header-title">M-SMART</h1>
                  </div>
                  </div>
          
                  <div className="row justify-content-center">
          <div className="col-md-6">
            <nav
              class="nav nav-pills nav-justified my-4"
              style={{ backgroundColor: "#e9ecef", borderRadius: "10px" }}
            >
              <Link class="nav-link" to={`/msmart/team/summary/${teamId}`}>
                Team
              </Link>
              <Link class="nav-link active" href="#">
                Personal
              </Link>
            </nav>
          </div>
        </div>

        <div class="card text-center mt-4">
          <div class="card-header text-start">
            <ul class="nav nav-tabs card-header-tabs">
              <li class="nav-item">
                <Link class="nav-link active" aria-current="true" href="#">
                  Database
                </Link>
              </li>
              <li class="nav-item">
                <Link
                  className="nav-link"
                  to={`/msmart/manager/followup/${teamId}`}
                >
                  Follow Up
                </Link>
              </li>
              <li class="nav-item">
                <Link
                  className="nav-link"
                  to={`/msmart/manager/summary/${teamId}`}
                >
                  Summary
                </Link>
              </li>
              <li class="nav-item">
              </li>
            </ul>
          </div>
            
            <div class="card-body">
          
                   { view === null ? (<></>) : view === false ? (<div className='row justify-content-center mt-3'>

          <div>
          <div className="alert alert-danger text-center" role="alert">
            You do not have permission to access this team M-Smart page
          </div>
          </div>

        </div>) : (<>
          <div className='row justify-content-center mt-3'>
          <div className='text-center'>
            <div className='container'>

            {/* Control Panel Baru: Filter di kiri, Butang Aksi di kanan */}
            <div className="card mb-5" style={{ fontSize: "0.8rem" }}>
                <div className="card-body p-3">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                        
                        {/* Bahagian Kiri: Filter */}
                        <div className="w-100 me-md-3 mb-3 mb-md-0">
                            <div className="row g-2">
                                <div className="col-md-5">
                                    <div className="form-floating">
                                        <select id="filterKey" className="form-select" value={filterKey} onChange={(e) => { setFilterKey(e.target.value); setFilterValue(""); }}>
                                            <option value="phone">Phone Number</option>
                                            <option value="name">Name</option>
                                            <option value="status">Status</option>
                                            <option value="createdAt">Added Date</option>
                                        </select>
                                        <label htmlFor="filterKey">Filter By</label>
                                    </div>
                                </div>
                                <div className="col-md-7">
                                  {filterKey === "status" ? (
                                    <div className="form-floating">
                                      <select
                                        id="statusSelect"
                                        className="form-select"
                                        value={filterValue}
                                        onChange={(e) => setFilterValue(e.target.value)}
                                      >
                                        <option value="">All Status</option>
                                        <option value="No Status">No Status</option>
                                        <option value="Follow Up">Follow Up</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Booking">Booking</option>
                                        <option value="Closed">Closed</option>
                                      </select>
                                      <label htmlFor="statusSelect">Select Status</label>
                                    </div>
                                  ) : filterKey === "createdAt" ? (
                                    <div className="form-floating">
                                      <Flatpickr
                                        className="form-control"
                                        options={{
                                          mode: "range",
                                          dateFormat: "Y-m-d",
                                          disableMobile: true
                                        }}
                                        placeholder="Select date range"
                                        value={
                                          filterValue.includes(" to ")
                                            ? filterValue.split(" to ").map((d) => new Date(d))
                                            : []
                                        }
                                        onChange={(selectedDates) => {
                                          if (selectedDates.length === 2) {
                                            const format = (date) =>
                                              `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                                                2,
                                                "0"
                                              )}-${String(date.getDate()).padStart(2, "0")}`;
                                            setFilterValue(`${format(selectedDates[0])} to ${format(selectedDates[1])}`);
                                          } else {
                                            setFilterValue("");
                                          }
                                        }}
                                      />
                                      <label style={{color: 'grey'}}>Select Date Range</label>
                                    </div>
                                  ) : (
                                    <div className="form-floating">
                                      <input
                                        type="text"
                                        id="filterInput"
                                        className="form-control"
                                        placeholder={`Search By ${filterKey}`}
                                        value={filterValue}
                                        onChange={(e) => setFilterValue(e.target.value)}
                                      />
                                      <label htmlFor="filterInput" style={{color: 'grey'}}>{`Search by ${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}`}</label>
                                    </div>
                                  )}
                                </div>
                            </div>
                        </div>


                        {/* Bahagian Kanan: Butang Aksi */}
                        <div className="d-flex align-items-center flex-shrink-0">
                            <div className="btn-group">
                                <button className='btn btn-outline-success' data-bs-toggle="modal" data-bs-target="#createDB">+ New</button>
                                <button className='btn btn-outline-success' data-bs-toggle="modal" data-bs-target="#bulkUploadModal">
                                    <i className="bi bi-upload"></i> Bulk
                                </button>
                            </div>
                            <button className="btn btn-outline-secondary ms-2" onClick={exportToExcel} title="Export current list to Excel">
                                <i className="bi bi-download"></i>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            

    {/* -- VIEW TOGGLE BUTTONS -- */}
    <div className="d-flex justify-content-end mb-3">
        <div className="btn-group" role="group" aria-label="View mode toggle">
            <button 
                type="button" 
                className={`btn btn-sm ${viewMode === 'card' ? 'btn-secondary' : 'btn-outline-secondary'}`} 
                onClick={() => setViewMode('card')}
            >
                <i className="bi bi-grid-3x3-gap-fill me-1"></i>Card View
            </button>
            <button 
                type="button" 
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-secondary' : 'btn-outline-secondary'}`} 
                onClick={() => setViewMode('table')}
            >
                <i className="bi bi-table me-1"></i>Table View
            </button>
        </div>
    </div>


            <div className="d-flex justify-content-end my-1">
              <button
                className="btn btn-sm btn-light mx-1"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <i class="bi bi-caret-left"></i>
              </button>
              <span className="mx-2 align-self-center">Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}</span>
              <button
                className="btn btn-sm btn-light mx-1"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
              >
                <i class="bi bi-caret-right"></i>
              </button>
            </div>

            <small className="text-muted" style={{fontSize: '0.8rem', fontStyle: 'italic'}}>Showing {currentData.length} of {filteredData.length} leads</small>
            
            <div>

    {/* -- CONDITIONAL RENDERING: Show Card View or Table View based on state -- */}
    {viewMode === 'card' ? (
        // --- CARD VIEW ---
        // --- CARD VIEW ---
<div className="row">
  
    {isLoading ? (
        <div className="text-center col-12">
            <div className="spinner-border text-dark" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    ) : currentData.length > 0 ? (
        currentData.map((lead) => {
            // #CHANGED# - Logic for soft background colors
            let statusBgClass = "bg-light"; // Default background
            let statusBorderClass = "border-light"; // Default background
            if (lead.status === "Closed") {statusBgClass = "bg-success-subtle"; statusBorderClass = "border-success-subtle";}
            if (lead.status === "Follow Up") {statusBgClass = "bg-info-subtle"; statusBorderClass = "border-info-subtle";}
            if (lead.status === "Rejected") {statusBgClass = "bg-danger-subtle"; statusBorderClass = "border-danger-subtle";}
            if (lead.status === "Booking") {statusBgClass = "bg-warning-subtle"; statusBorderClass = "border-warning-subtle";}

            return (
                <div className="col-lg-6 col-md-12" key={lead.id} style={{fontSize: '0.9rem'}}>
                    <div 
                        className={`card mb-3 shadow-sm ${statusBorderClass} border-1 card-interactive`}
                        style={{ cursor: 'pointer' }} // #CHANGED# - Add pointer cursor on hover
                    >
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div className="card-title mb-0 text-truncate" style={{fontSize: '0.9rem'}}>{lead.name}</div>
                            <span className={`badge rounded-pill text-bg-${lead.status === "Closed" ? "success" : lead.status === "Follow Up" ? "primary" : lead.status === "Rejected" ? "danger" : lead.status === "Booking" ? "warning" : "secondary"}`}>{lead.status}</span>
                            

                        </div>

                        <div className={`card-body ${statusBgClass}`}>
                            <p className="card-text mb-2"><i className="bi bi-phone me-2 text-muted"></i> +{lead.country}{lead.phone}</p>
                            {lead.remark ? (<p className="card-text text-muted fst-italic" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={lead.remark}><i className="bi bi-chat-left-text me-2"></i>"{lead.remark}"</p>) : (<p className="card-text text-muted fst-italic"><i className="bi bi-chat-left-text me-2"></i>"No Remarks"</p>)}
                        </div>

                        <div className="card-footer d-flex justify-content-between align-items-center text-muted" style={{fontSize: '0.85rem'}}>
                            <span>Added: {format(new Date(lead.createdAt), "dd MMM yyyy")}</span>
                            <div>
                            <div 
                                className="btn-group"
                            >
                                <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" onClick={handleDropdownToggle}>
                                    <i className="bi bi-gear-fill"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    {lead.status === "Closed" && (<><li><button className='dropdown-item' onClick={() => editSingle(lead.id)} data-bs-toggle="modal" data-bs-target="#SalesRepeat"><i className="bi bi-arrow-repeat"></i> Repeat Sale</button></li><li><hr className="dropdown-divider" /></li></>)}
                                    
                                    <li><a className="dropdown-item text-success" target="_blank" rel='noreferrer' href={`https://api.whatsapp.com/send?phone=${lead.country + lead.phone}`}><i className="bi bi-whatsapp me-2"></i> WhatsApp</a></li>
                                    <li><a className="dropdown-item" href={`tel:${lead.country}${lead.phone}`}><i className="bi bi-telephone-forward me-2"></i> Call</a></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className='dropdown-item text-danger' onClick={() => setDeleteDbId(lead.id)} data-bs-toggle="modal" data-bs-target="#deleteDB"><i className="bi bi-person-x-fill me-2"></i> Delete</button></li>
                                </ul>
                            </div>
                            <button className='btn btn-sm btn-outline-secondary ms-2' onClick={() => editSingle(lead.id)} data-bs-toggle="modal" data-bs-target="#EditDB"><i className="bi bi-pencil-fill"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        })
    ) : (<div className="col-12 text-center"><p className="text-muted">No leads found.</p></div>) }
</div>

    ) : (
        // --- TABLE VIEW (Your original table code) ---
        <div className='table-responsive' style={{fontSize: '0.9rem'}}>
            <table className="table table-bordered table-hover align-middle">
                <thead className="bg-light">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col" className='text-start'>Name</th>
                        <th scope="col" className='text-start'>Phone No.</th>
                        <th scope="col">Status</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                {isLoading ? (
                    <tbody>
                        <tr>
                            <td colSpan="5" className="text-center">
                                <div className="spinner-border text-dark" role="status"><span className="visually-hidden">Loading...</span></div>
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody>
                        {currentData.map((value, key) => {
                            let rowClass = "";
                            if (value.status === "Rejected") { rowClass = "status-rejected"; } 
                            else if (value.status === "Booking") { rowClass = "status-booking"; } 
                            else if (value.status === "Closed") { rowClass = "status-closed"; } 
                            else if (value.status === "Follow Up") { rowClass = "status-followup"; }
                            return (
                                <tr key={value.id || key}>
                                    <th scope="row" className={rowClass}>{key + 1 + indexOfFirstItem}</th>
                                    <td className={`text-start ${rowClass}`}>{value.name}</td>
                                    <td className={`text-start ${rowClass}`}>{value.country}{value.phone}</td>
                                    <td className={rowClass}>{value.status}</td>
                                    <td className={rowClass}>
                                        <div className='d-flex gap-2 justify-content-center'>
                                            <div className="btn-group">
                                                <button type="button" className="btn btn-sm btn-light dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="bi bi-person-lines-fill"></i></button>
                                                <ul className="dropdown-menu">
                                                    <li><a className="dropdown-item" target="_blank" rel='noreferrer' href={`https://api.whatsapp.com/send?phone=${value.country + value.phone}`} style={{color:'green'}}> <i className="bi bi-whatsapp"></i> WhatsApp</a></li>
                                                    <li><a className="dropdown-item" href={`tel:${value.country}${value.phone}`} style={{color:'blue'}}><i className="bi bi-telephone-forward"></i> Call</a></li>
                                                </ul>
                                            </div>
                                            <div className="btn-group">
                                                <button type="button" className="btn btn-sm btn-light dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="bi bi-gear-fill"></i></button>
                                                <ul className="dropdown-menu">
                                                    <li><button className='dropdown-item' onClick={() => editSingle(value.id)} data-bs-toggle="modal" data-bs-target="#EditDB"><i className="bi bi-pencil-fill"></i> Edit</button></li>
                                                    {value.status === "Closed" && (<li><button className='dropdown-item' style={{color:'green'}} onClick={() => editSingle(value.id)} data-bs-toggle="modal" data-bs-target="#SalesRepeat"><i className="bi bi-arrow-repeat"></i> Repeat Sale</button></li>)}
                                                    <div className="dropdown-divider"></div>
                                                    <li><button className='dropdown-item' style={{color:'red'}} onClick={() => setDeleteDbId(value.id)} data-bs-toggle="modal" data-bs-target="#deleteDB"><i className="bi bi-person-x-fill"></i> Delete</button></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                )}
            </table>
        </div>
    )}

<small className="text-muted" style={{fontSize: '0.8rem', fontStyle: 'italic'}}>Showing {currentData.length} of {filteredData.length} leads</small>

    {/* -- PAGINATION (This part is shared for both views) -- */}
    {filteredData.length > itemsPerPage && (
         <div className="d-flex justify-content-center my-1">
            <button className="btn btn-sm btn-light mx-1" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                <i className="bi bi-caret-left"></i>
            </button>
            <span className="mx-2 align-self-center">Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}</span>
            <button className="btn btn-sm btn-light mx-1" onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage)))} disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}>
                <i className="bi bi-caret-right"></i>
            </button>
        </div>
    )}
</div>
                

                


<div className="modal fade" id="deleteDB" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content yellow-100" >
      <div class="modal-header">
        <button type="button" class="btn-close" id='deleteConfirm' onClick={cancelDelete} data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <h5>Are you sure you want to delete this database?</h5>
        <br/>
        <button type="button" class="btn btn-sm btn-secondary mx-1" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-danger mx-1" onClick={deleteDB}>Delete</button>
      </div>
    </div>
  </div>
</div>

<div className="modal fade" id="EditDB" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header">
        <h1 className="modal-title fs-5" id="exampleModalLabel"><strong>Edit Database</strong></h1>
        <button type="button" id='closeEdit' className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">

      <form onSubmit={submitEdit}>

      <div class="form-floating mb-3">
      <input type="text" className="form-control" value={editName} onChange={(event) => {setEditName(event.target.value); setShowEditButton(true);}} required />
      <label className='mx-1'>Name</label>
      </div>

      <div className="mb-3 text-start">
  <label className="mx-1 text-muted">Phone Number: +{editCountry.value}{editMobile}</label>
  <div className="input-group">
    <div className="input-group-text p-0" style={{ zIndex: 2 }}>
      <Select
        options={options}
        onChange={handleChange}
        filterOption={filterOption}
        value={editCountry}
        menuPortalTarget={document.body}
        styles={{
          control: (base) => ({
            ...base,
            border: 'none',
            boxShadow: 'none',
            minHeight: '100%',
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        className="border-0"
      />
    </div>
    <input
      type="number"
      className="form-control"
      value={editMobile}
      onChange={handlePhoneChange}
      required
    />
  </div>
</div>




      <div className="form-floating mb-3 text-start">
        <select type="text" className="form-control" value={editStatus} onChange={(event) => {setEditStatus(event.target.value); setEditClosedAmount(''); setShowEditButton(true);}} required>
          <option value={editStatus}>{editStatus}</option>
          <option style={{color:'#2b2b2b'}} value="No Status">No Status</option>
                <option style={{color:'#002791'}} value="Follow Up">Follow Up</option>
          <option style={{color:'#b00202'}} value="Rejected">Rejected</option>
          <option style={{color:'#b89404'}} value="Booking">Booking</option>
          <option style={{color:'#238204'}} value="Closed">Closed</option>
        </select>
        <label className='mx-1'>Status</label>
      </div>

      {editStatus === 'Closed' && (!initialClosedAmount.current || parseFloat(initialClosedAmount.current) < 1) ? (
  // Boleh edit kalau tiada value
  <div className="form-floating mb-3 text-start">
    <NumericFormat
      className="form-control mb-3"
      value={editClosedAmount}
      thousandSeparator
      prefix="RM "
      allowNegative={false}
      decimalScale={2}
      fixedDecimalScale
      onValueChange={(values) => {
        setEditClosedAmount(values.value);
        setShowEditButton(true);
      }}
      placeholder="RM 0.00"
    />
    <label className='mx-1'>Closed Value</label>
  </div>
) : (
  // Kalau ada value → show jumlah termasuk repeatAmount
  <div className="form-floating mb-3 text-start">
    <NumericFormat
      className="form-control mb-3"
      value={initialClosedAmount.current}
      thousandSeparator
      prefix="RM "
      allowNegative={false}
      decimalScale={2}
      fixedDecimalScale
      disabled
    />
    <label className='mx-1'>Total Closed Value</label>
  </div>
)}


      <div className="form-floating mb-3 text-start">
        <textarea style={{ height: 'auto' }} className="form-control" value={editRemarks} onChange={(event) => {setEditRemarks(event.target.value); setShowEditButton(true);}} rows={5} />
        <label className='mx-1'>Remarks</label>
      </div>

      <div className="form-floating mb-3 text-start">
        
        <input type="datetime-local" className="form-control" min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16)} value={editFollowUp || ''} onChange={(event) => {handleFollowUpChange(event, 'Edit', event.target.value)}} />
        <label className='mx-1'>Follow Up Date</label>

        {editFollowUp < new Date(Date.now()) ? (<></>) 

        : typeof editFollowUp === 'string' ? (<div className='mt-2'><p>Upcoming Follow Up: <strong style={{color:'green'}}>{new Date(editFollowUp).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}</strong> <button
        className="btn btn-sm btn-danger"
        style={{ padding: '0px 3px', fontSize: '0.8rem' }}
        onClick={() => {
          setEditFollowUp('');           // Kosongkan value datetime-local
          setEditStatus('No Status');    // Reset status ikut flow kau
          setShowEditButton(true);
        }}
      >
        remove date
      </button></p></div>) 
       
        : (<div className='mt-2'><p>Upcoming Follow Up: <strong style={{color:'green'}}>{editFollowUp.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}</strong> <button
        className="btn btn-sm btn-danger"
        style={{ padding: '0px 3px', fontSize: '0.8rem' }}
        onClick={() => {
          setEditFollowUp('');           // Kosongkan value datetime-local
          setEditStatus('No Status');    // Reset status ikut flow kau
          setShowEditButton(true);
        }}
      >
        remove date
      </button></p></div>)
        }
        
      </div>

      <div className="mb-3 text-start">
    {/* We still check if editAddedDate has a value */}
    {editAddedDate && (
        <p>
            Added Date: <strong>
                {/* 1. This is the EXACT date format */}
                {format(new Date(editAddedDate), "dd MMM yyyy, h:mm a")}
                
                {/* 2. This is the RELATIVE time format, in brackets */}
                <span style={{ color: '#6c757d', marginLeft: '8px' }}>
                    ({formatDistanceToNow(new Date(editAddedDate), { addSuffix: true })})
                </span>
            </strong>
        </p>
    )}
</div> 
      
      {showEditButton === true && <div className='d-grid gap-2 mt-4 mb-3'><button type="submit" class="btn btn-primary my-3">Save changes</button></div>}
      
      </form>
      </div>
    </div>
  </div>
</div>

<div className="modal fade" id="SalesRepeat" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header">
        <h1 className="modal-title fs-5" id="exampleModalLabel"><strong>Repeat Sale Form</strong></h1>
        <button type="button" id='closeRepeat' className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={(e) => {setDefault(e)}}></button>
      </div>
      <div className="modal-body scrollable-modal-body">
  <ul className="nav nav-tabs mb-3">
    <li className="nav-item">
      <button className={`nav-link ${activeRepeatTab === 'form' ? 'active' : ''}`} onClick={() => setActiveRepeatTab('form')}>
        Repeat Sale
      </button>
    </li>
    <li className="nav-item">
      <button className={`nav-link ${activeRepeatTab === 'history' ? 'active' : ''}`} onClick={() => setActiveRepeatTab('history')}>
        Sale History
      </button>
    </li>
  </ul>

  {activeRepeatTab === 'form' && (
    <>

      <form onSubmit={submitRepeat}>

      <div class="form-floating mb-3">
      <input type="text" className="form-control" value={editName} onChange={(event) => {setEditName(event.target.value); setShowEditButton(true);}} disabled required />
      <label className='mx-1'>Name</label>
      </div>

      <div className="mb-3 text-start">
  <label className="mx-1 text-muted">Phone Number: +{editCountry.value}{editMobile}</label>
  <div className="input-group">
    <div className="input-group-text p-0" style={{ zIndex: 2 }}>
      <Select
        options={options}
        onChange={handleChange}
        filterOption={filterOption}
        value={editCountry}
        menuPortalTarget={document.body}
        styles={{
          control: (base) => ({
            ...base,
            border: 'none',
            boxShadow: 'none',
            minHeight: '100%',
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        className="border-0"
        isDisabled
      />
    </div>
    <input
      type="number"
      className="form-control"
      value={editMobile}
      onChange={handlePhoneChange}
      required
      disabled
    />
  </div>
</div>




      <div className="form-floating mb-3 text-start">
        <select type="text" className="form-control" value={editStatus} onChange={(event) => {setEditStatus(event.target.value); setEditClosedAmount(''); setShowEditButton(true);}} required disabled>
          <option value={editStatus}>{editStatus}</option>
          <option style={{color:'#2b2b2b'}} value="No Status">No Status</option>
                <option style={{color:'#002791'}} value="Follow Up">Follow Up</option>
          <option style={{color:'#b00202'}} value="Rejected">Rejected</option>
          <option style={{color:'#b89404'}} value="Booking">Booking</option>
          <option style={{color:'#238204'}} value="Closed">Closed</option>
        </select>
        <label className='mx-1'>Status</label>
      </div>

      {editStatus === 'Closed' && <>
        <div className="form-floating mb-3 text-start">
        <NumericFormat
                className="form-control mb-3"
                value={repeatSalesAmt}
                thousandSeparator
                prefix="RM "
                allowNegative={false}
                decimalScale={2}
                fixedDecimalScale
                onValueChange={(values) => {
                  setRepeatSalesAmt(values.value); // `values.value` = tanpa RM, tanpa koma
                  setShowEditButton(true);
                }}
                placeholder="RM 0.00"
                required
              />
      <label className='mx-1'>Close Value</label>
      </div>
      </>}

      <div className="form-floating mb-3 text-start">
        <textarea type="text" className="form-control" style={{height:'100px'}} value={repeatRemark}  onChange={(event) => {setRepeatRemark(event.target.value)}} />
        <label className='mx-1'>Remarks</label>
      </div>   
      
<div class="d-grid gap-2 mt-4 mb-3">
  <button class="btn btn-success" type="submit">Submit Sale Repeat</button>
</div>
      
      </form>
    </>
  )}

  {activeRepeatTab === 'history' && (
    <div className="table-responsive" style={{ fontSize: '0.85rem' }}>
      {salesHistory.length === 0 ? (
        <p className="text-muted">No repeat sales recorded yet.</p>
      ) : (
        <table className="table table-bordered table-sm">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Amount (RM)</th>
              <th>Remarks</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {salesHistory.map((sale, index) => (
              <tr key={sale.id}>
              <td>{index + 1}</td>
            
              <td style={{ minWidth: '130px' }}>
                {editingRowId === sale.id ? (
                  <input

                    type="number"
                    className="form-control form-control-sm"
                    value={editRowAmount}
                    onChange={(e) => setEditRowAmount(e.target.value)}
                  />
                ) : (
                  parseFloat(sale.repeatAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })
                )}
              </td>
            
              <td style={{ minWidth: '180px' }}>
                {editingRowId === sale.id ? (
                  <textarea
                    type="text"
                    className="form-control form-control-sm"
                    value={editRowRemarks}
                    onChange={(e) => setEditRowRemarks(e.target.value)}
                  />
                ) : (
                  sale.remarks || '-'
                )}
              </td>
            
              <td style={{ minWidth: '180px' }}>
                    {new Date(sale.createdAt).toLocaleString('en-GB', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', hour12: true
                    })}

                </td>

            
              <td className='align-middle'>
                {editingRowId === sale.id ? (
                  <div className='d-flex gap-2 justify-content-center mx-2'>
                    <button className="btn btn-sm btn-success me-1" onClick={() => handleSaveEdit(sale.id)}>
                      Save
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingRowId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setEditingRowId(sale.id);
                      setEditRowAmount(sale.repeatAmount);
                      setEditRowRemarks(sale.remarks || '');
                    }}                    
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                )}
              </td>
            </tr>
            
            ))}
          </tbody>
        </table>
      )}
    </div>
  )}
</div>
    </div>
  </div>
</div>

<div class="modal fade" id="createDB" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel"><strong>New Database</strong></h1>
        <button id='closeCreate' type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">

      <form onSubmit={createDb}>

      <div class="form-floating  mb-3 text-start">
        <input type="text" class="form-control" onChange={(event) => {setCreateName(event.target.value)}} required />
        <label className='mx-1'>Name</label>
      </div>

      
      <div className="mb-3 text-start">
  <label className="mx-1 text-muted">Phone Number: {createCountry}{createMobile}</label>
  <div className="input-group">
    <div className="input-group-text p-0" style={{ zIndex: 2 }}>
      <Select
        options={options}
        onChange={handleCreateChange}
        filterOption={filterOption}
        menuPortalTarget={document.body}
        styles={{
          control: (base) => ({
            ...base,
            border: 'none',
            boxShadow: 'none',
            minHeight: '100%',
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        className="border-0"
      />
    </div>
    <input
      type="number"
      className="form-control"
      value={createMobile}
      onChange={handlePhoneAdd}
      required
    />
  </div>
</div>



      <div class="form-floating mb-3 text-start">
        <select type="text" class="form-control" value={createStatus}  onChange={(event) => {setCreateStatus(event.target.value); setCreateClosedAmount('')}} required>
          <option value=''></option>
          <option style={{color:'#2b2b2b'}} value="No Status">No Status</option>
          <option style={{color:'#002791'}} value="Follow Up">Follow Up</option>
          <option style={{color:'#b00202'}} value="Rejected">Rejected</option>
          <option style={{color:'#b89404'}} value="Booking">Booking</option>
          <option style={{color:'#238204'}} value="Closed">Closed</option>
        </select>
        <label className='mx-1'>Status</label>
      </div>

      {createStatus === 'Closed' && <>
        <div className="mb-3 text-start">
        <label className='mx-1'>Close Value</label>
        <NumericFormat
                className="form-control mb-3"
                value={createClosedAmount}
                thousandSeparator
                prefix="RM "
                allowNegative={false}
                decimalScale={2}
                fixedDecimalScale
                onValueChange={(values) => {
                  setCreateClosedAmount(values.value); // `values.value` = tanpa RM, tanpa koma
                }}
                placeholder="RM 000,000.00"
              />
      </div>
      </>}

      <div class="form-floating mb-3 text-start">
        <textarea type="text" class="form-control"  onChange={(event) => {setCreateRemarks(event.target.value)}} />
        <label className='mx-1'>Remarks</label>
      </div>

      <div class="form-floating  mb-3 text-start">
        <input type="datetime-local" className="form-control" min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16)}  onChange={(event) => {handleFollowUpChange(event, 'Add', event.target.value)}} />
        <label className='mx-1'>Follow Up Date</label>
      </div>

      <div className='d-grid gap-2 mt-4 mb-3'><button class="btn btn-success" type="submit">Add New Database</button></div>
      
      </form>

      </div>
        
    </div>
  </div>
</div>

{/* GANTIKAN KESELURUHAN MODAL LAMA DENGAN YANG INI */}
<div className="modal fade" id="bulkUploadModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="bulkUploadLabel" aria-hidden="true">
    <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
            <div className="modal-header">
                <h1 className="modal-title fs-5" id="bulkUploadLabel">
                    {uploadStep === 'select_mode' && 'Bulk Upload - Select Mode'}
                    {uploadStep === 'preview' && 'Review & Confirm Data'}
                    {uploadStep === 'mapping' && 'Headers Mapping'}
                    {uploadStep === 'summary' && 'Upload Summary'}
                </h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetUploadModal}></button>
            </div>
            <div className="modal-body">

                {/* ====================================================== */}
                {/* LANGKAH 1: PILIH MODE                                  */}
                {/* ====================================================== */}
                {uploadStep === 'select_mode' && (
                    <div className="text-center">
                        <p className="lead">Choose your upload method.</p>
                        <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 my-4">
                            <div className={`card p-3 text-center w-100 ${uploadMode === 'easy' ? 'border-primary border-2 shadow-sm' : ''}`} style={{cursor: 'pointer', maxWidth: '300px'}} onClick={() => setUploadMode('easy')}>
                                <div className="card-body">
                                    <h5><i className="bi bi-file-earmark-spreadsheet-fill me-2"></i>Easy Mode</h5>
                                    <p className="text-muted small mb-0">Use our pre-defined template for a straightforward process.</p>
                                </div>
                            </div>
                            <div className={`card p-3 text-center w-100 ${uploadMode === 'advanced' ? 'border-primary border-2 shadow-sm' : ''}`} style={{cursor: 'pointer', maxWidth: '300px'}} onClick={() => setUploadMode('advanced')}>
                                <div className="card-body">
                                    <h5><i className="bi bi-gear-wide-connected me-2"></i>Advanced Mode</h5>
                                    <p className="text-muted small mb-0">Upload your own file and map the columns yourself.</p>
                                </div>
                            </div>
                        </div>
                        {uploadMode === 'easy' && (
                          <>
                          <div className="alert alert-secondary p-3 my-4 mx-auto" style={{maxWidth: '600px', textAlign: 'left'}}>

                                            
                            <h6 className="alert-heading fw-bold"><i className="bi bi-info-circle-fill me-2"></i>Easy Mode Instructions</h6>
                            <p className="mb-2 small">Please use our template and follow these rules:</p>
                            <ul className="list-unstyled mb-0 small">
                              <li className="mb-3"><span className="fw-bold">1. Download the template.</span><br/><a href={template} download="Bulk_Upload_Template.xlsx" className="btn btn-sm btn-success"><i className="bi bi-download me-2"></i>Download Template</a></li>
                              <li className="mb-3"><span className="fw-bold">2. Only `phone_number_full` column is required.</span><br/>Other columns like name, status, etc., are optional.</li>
                              <li className="mb-2"><span className="fw-bold">3. Country Code is MANDATORY for phone numbers.</span><br/>The system can automatically clean up formats with spaces or dashes.</li>
                              <li><span className="fw-bold">✅ Correct Examples:</span> <code>+60123456789</code>, <code>60123456789</code></li>
                              <li><span className="fw-bold">❌ Incorrect Examples:</span> <code>0123456789</code>, <code>123456789</code></li>
                            </ul>
                          </div>
                          <hr className='my-4' />
                          </>
                        )}
                        <div className="mx-auto">
                            <div className="mx-auto mb-4" style={{maxWidth: '600px'}}>
                            <label htmlFor="bulkFile" className="form-label">Select your <strong>{uploadMode === 'easy' ? 'template' : 'Excel/CSV'}</strong> file:</label>
                            <input className="form-control" type="file" id="bulkFile" onChange={(e) => setBulkFile(e.target.files[0])} accept=".xlsx, .xls, .csv" />
                            </div>
                        </div>
                    </div>
                )}

                 {/* ====================================================== */}
                {/* LANGKAH 2: SKRIN MAPPING (BARU)                        */}
                {/* ====================================================== */}
                {uploadStep === 'mapping' && (
                <div className="container-fluid">
                <p className="text-muted text-start">Follow the steps below by matching the columns from your file (right) to the required system fields (left).</p>
                {/* --- Pilihan Format Nombor Telefon (Accordion BARU) --- */}
                <div className="my-4 text-start">
            <strong >1. How is your phone number data formatted?</strong>
            
            <div className="accordion mt-2" id="phoneFormatAccordion">
                {/* --- Pilihan 1: Single Column --- */}
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button 
                            className={`accordion-button ${phoneFormat !== 'single' ? 'collapsed' : ''}`} 
                            type="button" 
                            onClick={() => setPhoneFormat('single')}
                        >
                            In a single column (<strong>e.g., +60123456789</strong>)
                        </button>
                    </h2>
                    <div 
                        className={`accordion-collapse collapse ${phoneFormat === 'single' ? 'show' : ''}`}
                        data-bs-parent="#phoneFormatAccordion"
                    >
                        <div className="accordion-body">
                            <p className="text-muted small">Map the column from your file that contains the complete phone number including the country code.</p>
                            <div className="row align-items-center">
                                <div className="col-4"><label className="form-label mb-0">Full Phone Number *</label></div>
                                <div className="col-8">
                                    <Select options={fileHeaders.map(h => ({ value: h, label: h }))} isClearable placeholder="Select column..." onChange={(s) => setFieldMapping(p => ({ ...p, country: '', phone: '', phone_number_full: s ? s.value : '' }))} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Pilihan 2: Separate Columns --- */}
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button 
                            className={`accordion-button ${phoneFormat !== 'separate' ? 'collapsed' : ''}`} 
                            type="button" 
                            onClick={() => setPhoneFormat('separate')}
                        >
                            In two separate columns (<strong>e.g., Country Code | Phone</strong>)
                        </button>
                    </h2>
                    <div 
                        className={`accordion-collapse collapse ${phoneFormat === 'separate' ? 'show' : ''}`}
                        data-bs-parent="#phoneFormatAccordion"
                    >
                        <div className="accordion-body">
                            <p className="text-muted small">Map the columns for the country dial code and the local phone number separately.</p>
                            <div className="row align-items-center mb-2">
                                <div className="col-4"><label className="form-label mb-0">Country Dial Code *</label></div>
                                <div className="col-8">
                                    <Select options={fileHeaders.map(h => ({ value: h, label: h }))} isClearable placeholder="Select country column..." onChange={(s) => setFieldMapping(p => ({ ...p, phone_number_full: '', country: s ? s.value : '' }))} />
                                </div>
                            </div>
                            <div className="row align-items-center">
                                <div className="col-4"><label className="form-label mb-0">Local Phone Number *</label></div>
                                <div className="col-8">
                                    <Select options={fileHeaders.map(h => ({ value: h, label: h }))} isClearable placeholder="Select phone column..." onChange={(s) => setFieldMapping(p => ({ ...p, phone_number_full: '', phone: s ? s.value : '' }))} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="alert alert-warning small mt-4">
                            <strong>*Note: Phone Numbers {phoneFormat === 'separate'  && 'and Country Code'} are required</strong>
                </div>
            </div>
        </div>
        
        <hr/>
                        
                        <hr/>
                        <div className="row g-3 mt-3 text-start">
                        <strong >2. Optional columns</strong>

                            {[
                                { field: 'name', label: 'Full Name' },
                                { field: 'status', label: 'Status' },
                                { field: 'remark', label: 'Remark' },
                                { field: 'followUpDate', label: 'Follow Up Date' },
                                { field: 'followUpTime', label: 'Follow Up Time' },
                            ].map(({ field, label }) => (
                                <div className="col-md-12" key={field}>
                                    <div className="row align-items-center">
                                        <div className="col-4">
                                            <label htmlFor={field} className="form-label mb-0">{label}</label>
                                        </div>
                                        <div className="col-8">
                                            <Select
                                                id={field}
                                                options={fileHeaders.map(h => ({ value: h, label: h }))}
                                                isClearable
                                                onChange={(selected) => {
                                                    setFieldMapping(prev => ({ ...prev, [field]: selected ? selected.value : '' }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ====================================================== */}
                {/* LANGKAH 3: PREVIEW DATA (VERSI LENGKAP)                */}
                {/* ====================================================== */}
                {uploadStep === 'preview' && (
                    <div>
                        <div className="alert alert-info">
                            <p className="mb-1"><strong>Review your data below.</strong> Errors and duplicates are shown first.</p>
                            <ul className="small mb-0">
                                <li>Rows with errors can be edited and fixed directly.</li>
                                <li>For duplicates, choose to <strong>Skip</strong> or <strong>Update</strong> the existing data.</li>
                            </ul>
                        </div>
                        <div className="d-flex justify-content-end gap-3 small mb-2">
                            <span><i className="bi bi-check-circle-fill text-success"></i> New: <strong>{previewCounts.new}</strong></span>
                            <span><i className="bi bi-exclamation-triangle-fill text-warning"></i> Duplicates: <strong>{previewCounts.duplicate}</strong></span>
                            <span><i className="bi bi-x-circle-fill text-danger"></i> Errors: <strong>{previewCounts.error}</strong></span>
                        </div>
                        <div className="table-responsive" style={{maxHeight: '60vh', fontSize: '0.85rem'}}>
                            <table className="table table-sm table-hover table-bordered">
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th>Status</th>
                                        <th>Name</th>
                                        <th>Country</th>
                                        <th>Phone</th>
                                        <th>New Status</th>
                                        <th>Remark</th>
                                        <th>Action</th>
                                        <th>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>
                                                {item.status === 'new' && <span className="badge bg-success-subtle text-success-emphasis">New</span>}
                                                {item.status === 'duplicate' && <span className="badge bg-warning-subtle text-warning-emphasis">Duplicate</span>}
                                                {item.status === 'error' && <span className="badge bg-danger-subtle text-danger-emphasis" title={item.errorReason}>Error</span>}
                                            </td>
                                            <td>
                                                {editingPreviewRowId === item.id ? (<input type="text" className="form-control form-control-sm" value={item.editData.name} onChange={(e) => handlePreviewRowChange(index, 'name', e.target.value)} />) : (item.newData.name)}
                                            </td>
                                            <td>
                                                {editingPreviewRowId === item.id ? (<input type="text" className="form-control form-control-sm" value={item.editData.country} onChange={(e) => handlePreviewRowChange(index, 'country', e.target.value)} />) : (`+${item.newData.country}`)}
                                            </td>
                                            <td>
                                                {editingPreviewRowId === item.id ? (<input type="text" className="form-control form-control-sm" value={item.editData.phone} onChange={(e) => handlePreviewRowChange(index, 'phone', e.target.value)} />) : (item.newData.phone)}
                                            </td>
                                            <td>
                                                {editingPreviewRowId === item.id ? (
                                                    <select className="form-select form-select-sm" value={item.editData.status} onChange={(e) => handlePreviewRowChange(index, 'status', e.target.value)}>
                                                        <option value="No Status">No Status</option>
                                                        <option value="Follow Up">Follow Up</option>
                                                        <option value="Rejected">Rejected</option>
                                                        <option value="Booking">Booking</option>
                                                        <option value="Closed">Closed</option>
                                                    </select>
                                                ) : (item.newData.status)}
                                            </td>
                                            <td>
                                                {editingPreviewRowId === item.id ? (<input type="text" className="form-control form-control-sm" value={item.editData.remark} onChange={(e) => handlePreviewRowChange(index, 'remark', e.target.value)} />) : (<span className="d-inline-block text-truncate" style={{maxWidth: '150px'}} title={item.newData.remark}>{item.newData.remark}</span>)}
                                            </td>
                                            <td>
                                                {item.status === 'duplicate' ? (
                                                    <select className="form-select form-select-sm" value={item.action} onChange={(e) => handleDuplicateActionChange(index, e.target.value)} disabled={editingPreviewRowId === item.id}>
                                                        <option value="skip">Skip</option>
                                                        <option value="update">Update</option>
                                                    </select>
                                                ) : (<span className="text-muted small">{item.status === 'error' ? 'Fix to proceed' : 'Will be added'}</span>)}
                                            </td>
                                            <td>
                                                {editingPreviewRowId === item.id ? (
                                                    <div className="btn-group">
                                                        <button className="btn btn-sm btn-success" onClick={() => handleSavePreviewRow(index)}>Save</button>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingPreviewRowId(null)}>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => setEditingPreviewRowId(item.id)}>
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* ====================================================== */}
                {/* LANGKAH 4: LAPORAN AKHIR                              */}
                {/* ====================================================== */}
                {uploadStep === 'summary' && finalReport && (
                     <div className="text-center">
                        <h4 className="text-success">Upload Complete!</h4>
                        <p className="lead">{finalReport.message}</p>
                        <ul className="list-group">
                            <li className="list-group-item d-flex justify-content-between align-items-center">Successfully Added<span className="badge bg-success rounded-pill">{finalReport.successfullyAdded}</span></li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">Successfully Updated<span className="badge bg-primary rounded-pill">{finalReport.successfullyUpdated}</span></li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">Skipped (Duplicates or Errors)<span className="badge bg-secondary rounded-pill">{finalReport.skipped}</span></li>
                        </ul>
                    </div>
                )}
            </div>
            <div className="modal-footer">
                {uploadStep === 'select_mode' && (
                    <button type="button" className="btn btn-primary" onClick={handleProceed} disabled={isProcessing || !bulkFile}>
                        {isProcessing ? 'Processing...' : 'Next'}
                    </button>
                )}
                {uploadStep === 'mapping' && (
                    <button type="button" className="btn btn-primary" onClick={handleAnalyzeFile} disabled={isProcessing}>
                        {isProcessing ? 'Analyzing...' : 'Analyze File'}
                    </button>
                )}
                {uploadStep === 'preview' && (
                     <button type="button" className="btn btn-success" onClick={handleExecuteUpload} disabled={isProcessing || editingPreviewRowId !== null}>
                        {isProcessing ? 'Saving...' : `Confirm & Save`}
                    </button>
                )}
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetUploadModal}>
                    {uploadStep === 'summary' ? 'Done' : 'Cancel'}
                </button>
            </div>
        </div>
    </div>
</div>

            </div>
            </div>
          </div>
        
        </>)}
          
            </div>
          </div>
          
          
                    </div>    
                  </div>
  )
}

export default ManagerManageLeads;
