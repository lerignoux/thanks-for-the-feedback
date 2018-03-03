from django.conf.urls import url
from django.urls import path
from . import views

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^feedbacks', views.feedbacks, name='feedbacks'),
    url(r'^campaign/qr', views.campaign_qr, name='campaign_qr'),
    url(r'^thankyou', views.thankyou, name='thankyou'),
    url(r'^feedback/(?P<campaign_id>\w{8}-\w{4}-\w{4}-\w{4}-\w{12})$', views.feedback, name='feedback'),
    url(r'^feedback/$', views.feedback, name='feedback'),
]
