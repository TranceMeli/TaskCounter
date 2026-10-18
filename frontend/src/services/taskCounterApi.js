import api from './api';

export const taskCounterApi = {
  async getLists() {
    const { data } = await api.get('/lists/');
    return data;
  },

  async createList(name) {
    const { data } = await api.post('/lists/', { name });
    return data;
  },

  async renameList(id, name) {
    const { data } = await api.patch(`/lists/${id}/`, { name });
    return data;
  },


  async deleteList(id) {
    await api.delete(`/lists/${id}/`);
  },
async createTask(payload) {
  try {
    const response = await api.post('/tasks/', payload);
    return response.data;
  } catch (error) {
    console.error('Task creation failed:', error.response?.data);
    console.error('Submitted payload:', payload);
    throw error;
  }
},

  async updateTask(id, { task_list, name, count, unit }) {
    const { data } = await api.patch(`/tasks/${id}/`, {
      task_list,
      name,
      count,
      unit,
    });
    return data;
  },

  async deleteTask(id) {
    await api.delete(`/tasks/${id}/`);
  },
};
