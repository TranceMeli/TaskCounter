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

  async createTask({ task_list, name, count, unit }) {
    const { data } = await api.post('/tasks/', {
      task_list,
      name,
      count,
      unit,
    });
    return data;
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
