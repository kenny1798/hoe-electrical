// /utils/bulkUploadHelpers.js

// Senarai Penuh Kod Panggilan Negara & Wilayah
const ALL_COUNTRY_CODES = [
    '1242', '1246', '1264', '1268', '1284', '1340', '1345', '1441', '1473',
    '1649', '1664', '1670', '1671', '1684', '1758', '1767', '1784', '1868',
    '1869', '1876', '211', '212', '213', '216', '218', '220', '221', '222',
    '223', '224', '225', '226', '227', '228', '229', '230', '231', '232',
    '233', '234', '235', '236', '237', '238', '239', '240', '241', '242',
    '243', '244', '245', '248', '249', '250', '251', '252', '253', '254',
    '255', '256', '257', '258', '260', '261', '262', '263', '264', '265',
    '266', '267', '268', '269', '290', '291', '297', '298', '299', '350',
    '351', '352', '353', '354', '355', '356', '357', '358', '359', '370',
    '371', '372', '373', '374', '375', '376', '377', '378', '380', '381',
    '382', '385', '386', '387', '389', '420', '421', '423', '500', '501',
    '502', '503', '504', '505', '506', '507', '508', '509', '590', '591',
    '592', '593', '594', '595', '596', '597', '598', '599', '670', '672',
    '673', '674', '675', '676', '677', '678', '679', '680', '681', '682',
    '683', '685', '686', '687', '688', '689', '690', '691', '692', '850',
    '852', '853', '855', '856', '880', '886', '960', '961', '962', '963',
    '964', '965', '966', '967', '968', '970', '971', '972', '973', '974',
    '975', '976', '977', '992', '993', '994', '995', '996', '998', '20',
    '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44',
    '45', '46', '47', '48', '49', '51', '52', '53', '54', '55', '56', '57',
    '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86',
    '90', '91', '92', '93', '94', '95', '98', '7', '1'
  ].sort((a, b) => b.length - a.length);
  
  function parsePhoneNumber(phoneData) {
    if (phoneData.phone && phoneData.country) {
        const sanitizedPhone = phoneData.phone.toString().replace(/\D/g, '');
        const sanitizedCountry = phoneData.country.toString().replace(/\D/g, '');
        return { country: sanitizedCountry, phone: sanitizedPhone };
    }

    const fullNumberStr = phoneData.full_phone_number;
    if (!fullNumberStr) {
        return { country: null, phone: null };
    }

    const sanitizedNumber = fullNumberStr.toString().replace(/\D/g, '');

    for (const code of ALL_COUNTRY_CODES) {
        if (sanitizedNumber.startsWith(code)) {
            let phone = sanitizedNumber.substring(code.length);
            if (phone.startsWith('0')) {
                 phone = phone.substring(1);
            }
            return { country: code, phone };
        }
    }
    return { country: null, phone: null };
}
  
  function excelSerialDateToJSDate(serial) {
    const excelEpoch = new Date(1899, 11, 30);
    const daysSinceEpoch = serial - 1; 
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    return new Date(excelEpoch.getTime() + daysSinceEpoch * millisecondsInDay);
  }
  
  function combineDateTime(dateObj, timeStr) {
      if (!dateObj || !timeStr) return dateObj;
      if (typeof timeStr === 'number') {
          const totalSeconds = Math.round(timeStr * 86400);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const newDate = new Date(dateObj);
          newDate.setHours(hours, minutes, 0, 0);
          return newDate;
      } else {
          const [hours, minutes, seconds] = timeStr.split(':').map(Number);
          const newDate = new Date(dateObj);
          newDate.setHours(hours || 0, minutes || 0, seconds || 0, 0);
          return newDate;
      }
  }
  
  // Export semua fungsi
  module.exports = { 
      parsePhoneNumber,
      excelSerialDateToJSDate,
      combineDateTime 
  };