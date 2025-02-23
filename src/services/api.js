/**
 * API service module for handling backend communication
 */

import { createSource } from '../streams/core';

const API_BASE_URL = 'http://localhost:3001/api/v1';

// WebSocket connection
const ws = new WebSocket('ws://localhost:3001');

/**
 * Creates a stream for WebSocket messages
 */
export const createWebSocketStream = () => createSource(({ next, error }) => {
  ws.onmessage = (event) => next(JSON.parse(event.data));
  ws.onerror = (err) => error(err);
  return () => ws.close();
});

/**
 * Generates an image based on provided configuration
 * @param {Object} config Image generation configuration
 * @returns {Promise} API response
 */
export const generateImage = async (config) => {
  const response = await fetch(`${API_BASE_URL}/images/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  return response.json();
};

/**
 * Retrieves image by ID
 * @param {string} id Image ID
 * @returns {Promise} API response
 */
export const getImage = async (id) => {
  const response = await fetch(`${API_BASE_URL}/images/${id}`);
  return response.json();
};

/**
 * Generates a video based on provided configuration
 * @param {Object} config Video generation configuration
 * @returns {Promise} API response
 */
export const generateVideo = async (config) => {
  const response = await fetch(`${API_BASE_URL}/videos/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  return response.json();
};

/**
 * Retrieves video status by ID
 * @param {string} id Video ID
 * @returns {Promise} API response
 */
export const getVideoStatus = async (id) => {
  const response = await fetch(`${API_BASE_URL}/videos/${id}`);
  return response.json();
};

/**
 * Creates a new workflow
 * @param {Object} workflow Workflow configuration
 * @returns {Promise} API response
 */
export const createWorkflow = async (workflow) => {
  const response = await fetch(`${API_BASE_URL}/workflows/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflow),
  });
  return response.json();
};