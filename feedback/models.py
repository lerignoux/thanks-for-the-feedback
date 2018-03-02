import uuid
from datetime import timedelta
from django.db import models
from django.utils import timezone


def default_expiration_date():
    return timezone.now() + timedelta(days=90)


class Campaign(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.TextField(default='')
    creation_date = models.DateTimeField(default=timezone.now)
    expiration_date = models.DateTimeField(default=default_expiration_date)

    def __str__(self):
        return "Feedback campaign started the %s valid until %s" % (self.creation_date, self.expiration_date)


class Feedback(models.Model):
    campaign = models.ForeignKey('Campaign', on_delete=models.CASCADE)
    feedback = models.TextField()
    creation_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return "Feedback: %s" % self.feedback
