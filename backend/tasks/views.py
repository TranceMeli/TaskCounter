from rest_framework import viewsets

from .models import Task, TaskList
from .serializers import TaskListSerializer, TaskSerializer


class TaskListViewSet(viewsets.ModelViewSet):
    """CRUD for named lists. Each list representation includes its tasks."""

    queryset = TaskList.objects.prefetch_related('tasks').all()
    serializer_class = TaskListSerializer
    http_method_names = ('get', 'post', 'patch', 'head', 'options', 'delete')


class TaskViewSet(viewsets.ModelViewSet):
    """CRUD for tasks. Updating `list` can move a task between lists."""

    queryset = Task.objects.select_related('task_list').all()
    serializer_class = TaskSerializer
    http_method_names = ('get', 'post', 'patch', 'head', 'options', 'delete')
