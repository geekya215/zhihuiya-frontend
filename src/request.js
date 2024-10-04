import axios from 'axios';

// 从环境变量中读取 API URL
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // 使用环境变量
});

export default apiClient;