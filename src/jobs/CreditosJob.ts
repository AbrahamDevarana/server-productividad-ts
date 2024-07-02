import cron from 'node-cron';
import axios from 'axios';
import { authToken } from '../services/cronAuth';


const API_URL = `http://127.0.0.0:5010/api`;

const AUTH_TOKEN = authToken;

// cada minuto
cron.schedule('* * * * *', async () => {
    try {
        const { data } = await axios.get(`${API_URL}/creditos`, {
            headers: {
                accessToken: AUTH_TOKEN
            }
        });
        console.log(data);
    } catch (error) {
        console.log('Error al obtener los creditos');
        
        // console.log(error);
    }
})