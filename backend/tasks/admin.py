from django.contrib import admin

from .models import Task, TaskList


class TaskInline(admin.TabularInline):
    model = Task
    extra = 0


@admin.register(TaskList)
class TaskListAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'updated_at')
    search_fields = ('name',)
    inlines = (TaskInline,)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'task_list', 'count', 'updated_at')
    list_filter = ('task_list',)
    search_fields = ('name', 'task_list__name')
