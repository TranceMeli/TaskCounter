from rest_framework.routers import DefaultRouter

from .views import TaskListViewSet, TaskViewSet

router = DefaultRouter()
router.register('lists', TaskListViewSet, basename='task-list')
router.register('tasks', TaskViewSet, basename='task')

urlpatterns = router.urls
