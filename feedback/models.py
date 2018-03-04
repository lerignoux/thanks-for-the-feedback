import io
import logging
import uuid
from datetime import timedelta
from django.db import models
from django.utils import timezone

import qrcode
from qrcode.image import svg

log = logging.getLogger(__name__)


default_message = """Hello
Welcome on tftf, please give me feedback for self improvement.
"""


def default_expiration_date():
    return timezone.now() + timedelta(days=90)


class Campaign(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.TextField(default=default_message)
    creation_date = models.DateTimeField(default=timezone.now)
    expiration_date = models.DateTimeField(default=default_expiration_date)

    def __str__(self):
        return "Feedback campaign started the %s valid until %s" % (self.creation_date, self.expiration_date)

    def qr_code(self, host, png=False):
        url = "{host}/feedback/{campaign_id}".format(
            host=host, campaign_id=self.id
        )

        qr = qrcode.QRCode()
        qr.add_data(url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#ffffff", back_color="#008899") if png else qr.make_image(image_factory=svg.SvgPathImage)
        log.info("campaign QR generated %s " % img)

        output = io.BytesIO()
        img.save(output)
        if png:
            output.seek(0)
        else:
            output.seek(39)  # we ignore the svg header

        qr_str = output.read()
        if not png:
            qr_str = qr_str.decode("utf-8").replace("#000000", "#008899")

        return qr_str


class Feedback(models.Model):
    campaign = models.ForeignKey('Campaign', on_delete=models.CASCADE)
    feedback = models.TextField()
    creation_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return "Feedback: %s" % self.feedback
