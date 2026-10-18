from rest_framework import status
from rest_framework.test import APITestCase

from .models import Task, TaskList


class TaskCounterApiTests(APITestCase):
    def test_create_list_and_task_and_receive_nested_representation(self):
        list_response = self.client.post('/api/lists/', {'name': 'Daily habits'}, format='json')
        self.assertEqual(list_response.status_code, status.HTTP_201_CREATED)
        list_id = list_response.data['id']

        task_response = self.client.post(
            '/api/tasks/',
            {'list': list_id, 'name': 'Drink water', 'count': 4},
            format='json',
        )
        self.assertEqual(task_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(task_response.data['count'], 4)

        detail = self.client.get(f'/api/lists/{list_id}/')
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data['tasks'][0]['name'], 'Drink water')

    def test_blank_names_are_rejected(self):
        response = self.client.post('/api/lists/', {'name': '   '}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_task_can_be_moved_to_another_list(self):
        first = TaskList.objects.create(name='First')
        second = TaskList.objects.create(name='Second')
        task = Task.objects.create(task_list=first, name='Move me', count=3)

        response = self.client.patch(
            f'/api/tasks/{task.id}/',
            {'list': second.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.task_list_id, second.id)

    def test_deleting_a_list_cascades_to_tasks(self):
        task_list = TaskList.objects.create(name='Temporary')
        task = Task.objects.create(task_list=task_list, name='Temporary task', count=1)

        response = self.client.delete(f'/api/lists/{task_list.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())
