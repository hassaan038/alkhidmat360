import api from './api';

// Admin endpoints -----------------------------------------------------------

export const adminListVolunteers = () =>
  api.get('/admin/volunteer-assignments/volunteers').then((r) => r.data?.data?.volunteers || []);

export const adminListAssignments = (params = {}) =>
  api.get('/admin/volunteer-assignments', { params }).then((r) => r.data?.data?.assignments || []);

export const adminCreateAssignment = (payload) =>
  api.post('/admin/volunteer-assignments', payload).then((r) => r.data?.data?.assignment);

export const adminUpdateAssignment = (id, payload) =>
  api
    .patch(`/admin/volunteer-assignments/${id}`, payload)
    .then((r) => r.data?.data?.assignment);

export const adminDeleteAssignment = (id) =>
  api.delete(`/admin/volunteer-assignments/${id}`).then((r) => r.data);

export const adminUpdateAssignmentStatus = (id, status) =>
  api
    .patch(`/admin/volunteer-assignments/${id}/status`, { status })
    .then((r) => r.data?.data?.assignment);

// Volunteer endpoints -------------------------------------------------------

export const listMyAssignments = (params = {}) =>
  api.get('/volunteers/assignments', { params }).then((r) => r.data?.data?.assignments || []);

export const updateMyAssignmentStatus = (id, status, completionNotes) =>
  api
    .patch(`/volunteers/assignments/${id}/status`, { status, completionNotes })
    .then((r) => r.data?.data?.assignment);
