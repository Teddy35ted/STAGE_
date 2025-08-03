// lib/appwrite.js
import { Client, Storage } from 'appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1') 
  .setProject('688f85190004fa948692');
export const storage = new Storage(client);