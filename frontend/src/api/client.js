import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Resolve the API base URL from app.json's `extra.apiBaseUrl`, falling back
// to localhost for the web/simulator case. When testing on a physical
// device via Expo Go, replace this with your machine's LAN IP
// (e.g. http://192.168.1.23:5000/api) - localhost on the phone refers to
// the phone itself, not your dev machine.
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('feedants_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function setAuthToken(token) {
  if (token) await AsyncStorage.setItem('feedants_token', token);
  else await AsyncStorage.removeItem('feedants_token');
}

export async function getAuthToken() {
  return AsyncStorage.getItem('feedants_token');
}

export default client;
