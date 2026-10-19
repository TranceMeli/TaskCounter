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

    def test_custom_unit_is_returned_in_nested_list_representation(self):
        list_response = self.client.post(
            '/api/lists/',
            {'name': 'Reading'},
            format='json',
        )
        task_response = self.client.post(
            '/api/tasks/',
            {
                'list': list_response.data['id'],
                'name': 'Read a book',
                'count': 2,
                'unit': 'chapters',
            },
            format='json',
        )

        self.assertEqual(task_response.status_code, status.HTTP_201_CREATED)
        task_id = task_response.data['id']
        update_response = self.client.patch(
            f'/api/tasks/{task_id}/',
            {'unit': 'pages'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        nested_task = self.client.get('/api/lists/').data[0]['tasks'][0]
        self.assertEqual(nested_task['unit'], 'pages')
        self.assertEqual(nested_task['effective_unit'], 'pages')

    def test_deleting_a_list_cascades_to_tasks(self):
        task_list = TaskList.objects.create(name='Temporary')
        task = Task.objects.create(task_list=task_list, name='Temporary task', count=1)

        response = self.client.delete(f'/api/lists/{task_list.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())

    def test_list_endpoint_does_not_query_per_task(self):
        for index in range(3):
            task_list = TaskList.objects.create(name=f'List {index}')
            for task_index in range(3):
                Task.objects.create(task_list=task_list, name=f'Task {task_index}')

        # One query for the lists, one for the prefetched tasks.
        with self.assertNumQueries(2):
            response = self.client.get('/api/lists/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['tasks'][0]['effective_unit'], 'Stück')
