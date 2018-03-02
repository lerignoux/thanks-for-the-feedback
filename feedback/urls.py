from django.conf.urls import url
from django.urls import path
from . import views

urlpatterns = [
    url(r'home', views.home, name='home'),
    url(r'feedbacks', views.feedbacks, name='feedbacks'),
    url(r'feedback/(?P<campaign_id>\w{8}-\w{4}-\w{4}-\w{4}-\w{12})$', views.feedback, name='feedback'),
    url(r'thankyou', views.thankyou, name='thankyou'),
]
