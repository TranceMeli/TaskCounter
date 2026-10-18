from rest_framework import serializers

from .models import Task, TaskList


class TaskSerializer(serializers.ModelSerializer):
    unit = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=50,
    )
    effective_unit = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "task_list",
            "name",
            "count",
            "unit",
            "effective_unit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "effective_unit",
            "created_at",
            "updated_at",
        ]

    def get_effective_unit(self, obj):
        return obj.effective_unit


class TaskListSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = TaskList
        fields = [
            "id",
            "name",
            "unit",
            "tasks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
