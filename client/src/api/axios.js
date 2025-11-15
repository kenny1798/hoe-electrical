import axios from "axios";


const msmartAxios = axios.create({
    baseURL: process.env.REACT_APP_MSMART
})

const mbotAxios = axios.create({
    baseURL: process.env.REACT_APP_MBOT
})

const fileServerAxios = axios.create({
    baseURL: process.env.REACT_APP_FILE_SERVER
})

const muAxios = axios.create({
    baseURL: process.env.REACT_APP_MU
})

const mchatAxios = axios.create({
    baseURL: process.env.REACT_APP_MCHAT
})

export {msmartAxios, mbotAxios, fileServerAxios, muAxios, mchatAxios}

export default axios.create({
    baseURL: process.env.REACT_APP_SERVER
});


