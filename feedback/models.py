import io
import os
import logging
import uuid
from urllib.parse import quote
from datetime import timedelta
from django.db import models
from django.utils import timezone

import qrcode
from qrcode.image import svg
from fpdf import FPDF

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

    def mail_request(self, host):
        return "mailto:?subject=Thanks for the feedback&body=Hello\n\nCould you please send me some anonymous feedback at:\n%s\n\nThank you." % self.url(host)

    def url(self, host):
        return "https://{host}/feedback/{campaign_id}".format(
            host=host, campaign_id=self.id
        )

    def linkedin_url(self, host):
        return "https://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}&summary={summary}&source={source}".format(
            url=self.url(host),
            title="Thanks%20For%20The%20Feedback",
            summary=quote(self.message, safe=''),
            source=host
        )

    def qr_code(self, host, png=False):
        url = self.url(host)

        qr = qrcode.QRCode()
        qr.add_data(url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#325f73", back_color="#ffffff") if png else qr.make_image(image_factory=svg.SvgPathImage)
        log.info("campaign QR generated %s " % img)

        output = io.BytesIO()
        img.save(output)
        if png:
            output.seek(0)
        else:
            output.seek(39)  # we ignore the svg header

        qr_str = output.read()
        if not png:
            qr_str = qr_str.decode("utf-8").replace("#000000", "#325f73")

        return qr_str

    def pdf(self, host):
        qr_file = '%s.png' % self.id
        with open(qr_file, 'wb') as f:
            f.write(self.qr_code(host, png=True))
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("helvetica", size=52)
        pdf.set_text_color(50, 95, 115)
        # QR code
        pdf.set_y(0)
        pdf.image(qr_file, x=6, y=96, w=200)
        # Logo
        pdf.set_y(0)
        pdf.image("static/logo.png", x=108, y=18, w=80)

        # Text
        pdf.set_y(0)
        pdf.cell(100, 60, "Thanks", 0, 1, 'C')
        pdf.set_y(0)
        pdf.cell(100, 110, "for the", 0, 1, 'C')
        pdf.set_y(0)
        pdf.cell(100, 160, "feedback", 0, 1, 'C')
        res = pdf.output(dest='S').encode('latin-1')
        os.remove(qr_file)
        return res


class Feedback(models.Model):
    campaign = models.ForeignKey('Campaign', on_delete=models.CASCADE)
    feedback = models.TextField()
    creation_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return "Feedback: %s" % self.feedback
