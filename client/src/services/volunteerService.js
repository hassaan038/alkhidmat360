import api from './api';

// ============================================
// VOLUNTEER TASK SERVICES
// ============================================

export async function createVolunteerTask(taskData) {
  const response = await api.post('/volunteers/task', taskData);
  return response.data;
}

export async function getVolunteerTasks() {
  const response = await api.get('/volunteers/task');
  return response.data;
}
