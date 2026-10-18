from django.core.management.commands.runserver import Command as RunserverCommand


class Command(RunserverCommand):
    def handle(self, *args, **options):
        if options['addrport'] is None:
            options['addrport'] = '127.0.0.1:8001'
        return super().handle(*args, **options)
