// lib/appwrite.js
import { Client, Storage } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('688fa4c00025e643934d');
export const storage = new Storage(client);