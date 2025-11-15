import React, { useState, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_green.css';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
import {msmartAxios} from '../../api/axios';
import { NumericFormat } from 'react-number-format';
import { useAuthContext } from '../../hooks/useAuthContext';

function SalesTarget({ teamId }) {
  const {user} = useAuthContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const getMonth = (date) => date.getMonth() + 1;
  const getYear = (date) => date.getFullYear();

  const fetchTarget = async () => {
    setLoading(true);
    try {
      const month = getMonth(selectedDate);
      const year = getYear(selectedDate);
      const res = await msmartAxios.post(`/api/msmart/get/sales-target/${teamId}`,{month, year} ,{
        headers: {accessToken: user.token}
      });
      setTargetAmount(res.data.targetAmount || '');
    } catch (err) {
      console.log('❌ Fetch error:', err.response?.data || err.message);
      setTargetAmount('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarget();
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const month = getMonth(selectedDate);
      const year = getYear(selectedDate);
      const res = await msmartAxios.post(`/api/msmart/post/sales-target/${teamId}`, {
        month,
        year,
        targetAmount
      }, {
        headers: {accessToken: user.token}
      });
      alert(res.data.message);
      window.location.reload();
    } catch (err) {
      alert('❌ Error saving target');
      console.log(err);
    }
  };

  return (
    <div className='my-3'>
      <label>Select Month & Year:</label>
      <Flatpickr
        value={selectedDate}
        onChange={(date) => setSelectedDate(date[0])}
        options={{
          plugins: [new monthSelectPlugin({ shorthand: true, dateFormat: "m/Y" })],
          disableMobile: true
        }}
        className='form-control mb-3'
      />

      <label>Target Amount (RM):</label>
      <NumericFormat
        className="form-control mb-3"
        value={targetAmount}
        thousandSeparator
        prefix="RM "
        allowNegative={false}
        decimalScale={2}
        fixedDecimalScale
        onValueChange={(values) => {
          setTargetAmount(values.value); // `values.value` = tanpa RM, tanpa koma
        }}
        placeholder="Eg. : RM 1,000.00"
      />

      <div className="d-grid">
      <button className="btn btn-dark" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : 'Save Target'}
      </button>
      </div>
    </div>
  );
}

export default SalesTarget;
