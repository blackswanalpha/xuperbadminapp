// Debug script to test API calls
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api/v1';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY0OTE5MTA3LCJpYXQiOjE3NjQ4MzI3MDcsImp0aSI6ImI0N2E4ZjE1NGQ1ZjRkYWViNWQ5MTZkOGZmNzdkYzRhIiwidXNlcl9pZCI6MX0.OuVTUVmhkxWN_dalsIw_N0wd0XL19qGyIquIv7xpitY';

async function testAPI() {
    try {
        console.log('Testing GET /inventory/vehicles/4/');
        const getResponse = await axios.get(`${API_BASE_URL}/inventory/vehicles/4/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('GET Success:', JSON.stringify(getResponse.data, null, 2));
        
        console.log('\nTesting PUT /inventory/vehicles/4/ with minimal data');
        const putData = {
            condition: 'GOOD',
            location: 'Test Location'
        };
        
        const putResponse = await axios.put(`${API_BASE_URL}/inventory/vehicles/4/`, putData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('PUT Success:', JSON.stringify(putResponse.data, null, 2));
        
    } catch (error) {
        console.error('API Error:');
        console.error('Status:', error.response?.status);
        console.error('StatusText:', error.response?.statusText);
        console.error('Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('URL:', error.config?.url);
        console.error('Method:', error.config?.method);
        console.error('Sent Data:', error.config?.data);
    }
}

testAPI();