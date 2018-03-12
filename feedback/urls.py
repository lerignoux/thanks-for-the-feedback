from django.conf.urls import url
from django.urls import path
from . import views

handler404 = views.error404


urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^contribute$', views.contribute, name='contribute'),
    url(r'^thankyou$', views.thankyou, name='thankyou'),
    url(r'^feedbacks$', views.feedbacks, name='feedbacks'),
    url(r'^feedbacks/(?P<feedback_id>\w+)$', views.feedbacks, name='feedbacks_id'),
    url(r'^campaign/$', views.campaign, name='campaign'),
    url(r'^campaign/(?P<campaign_id>\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/qr$', views.campaign_qr, name='campaign_qr'),
    url(r'^campaign/(?P<campaign_id>\w{8}-\w{4}-\w{4}-\w{4}-\w{12})$', views.campaign, name='campaign_get'),
    url(r'^feedback/(?P<campaign_id>\w{8}-\w{4}-\w{4}-\w{4}-\w{12})$', views.feedback, name='feedback'),
    url(r'^feedback/', views.bad_campaign, name='bad_campaign'),
]
