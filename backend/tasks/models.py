from django.db import models


class TaskList(models.Model):
    name = models.CharField(max_length=100)
    unit = models.CharField(
        max_length=50,
        default="Stück",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("created_at", "id")
        verbose_name = "task list"
        verbose_name_plural = "task lists"

    def __str__(self) -> str:
        return self.name


class Task(models.Model):
    task_list = models.ForeignKey(
        TaskList,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    name = models.CharField(max_length=200)
    count = models.PositiveIntegerField(default=0)
    unit = models.CharField(
        max_length=50,
        blank=True,
        default="",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("created_at", "id")
        indexes = [
            models.Index(
                fields=("task_list", "created_at"),
                name="task_list_created_idx",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.count})"

    @property
    def effective_unit(self) -> str:
        """Return the task's unit or fall back to its list's unit."""
        return self.unit.strip() or self.task_list.unit