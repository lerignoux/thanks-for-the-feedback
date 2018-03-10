import logging
from django.shortcuts import render, redirect
from django.utils import timezone
from django.http import HttpResponse
from django.core.exceptions import ObjectDoesNotExist

from .forms import FeedbackForm, CampaignForm
from .models import Campaign, Feedback

log = logging.getLogger(__name__)


def home(request):
    user = request.user
    if user.is_authenticated:
        campaign = Campaign.objects.filter(user=user, expiration_date__gte=timezone.now()).order_by('-creation_date').first()
        if campaign:
            mail_link = campaign.mail_request(request.get_host())
            campaign.mailLink = mail_link.replace('\n', '%0A')
            campaign.link = campaign.url(request.get_host())
            campaign.linkedin = campaign.linkedin_url(request.get_host())
            qrcode = campaign.qr_code(request.get_host())
            form = CampaignForm(instance=campaign)
            return render(request, 'home.html', {'form': form, 'campaign': campaign, 'qr_code': qrcode,
                                                 'expiration_date': campaign.expiration_date})
        else:
            return render(request, 'home.html', {})
    else:
        return render(request, 'home.html', {})


def campaign(request, campaign_id=None):
    user = request.user
    if user.is_authenticated:
        if request.method == "POST":
            campaign = Campaign.objects.filter(user=user, expiration_date__gte=timezone.now()).first()
            if campaign_id is None and campaign is None:
                log.debug("Creating a campaign for user %s" % user)
                campaign = Campaign(user=user)
                campaign.save()
            else:
                campaign = Campaign.objects.filter(id=campaign_id).update(message=request.POST['message'])
        elif request.method == "DELETE":
            Campaign.objects.filter(id=campaign_id).update(expiration_date=timezone.now())
    return redirect('home')


def campaign_qr(request, campaign_id):
    user = request.user
    if user.is_authenticated:
        campaign = Campaign.objects.get(id=campaign_id)
        response = HttpResponse(campaign.qr_code(request.get_host(), png=True), content_type="application/png")
        response['Content-Disposition'] = 'inline; filename=tftf_qr.png'
        return response


def feedbacks(request, feedback_id=None):
    user = request.user
    if user.is_authenticated:

        if request.method == "DELETE":
            Feedback.objects.get(id=feedback_id).delete()

        campaigns = Campaign.objects.filter(user=user, expiration_date__gte=timezone.now()).order_by('-creation_date')
        feedbacks = Feedback.objects.filter(campaign__in=campaigns).order_by('-creation_date')
        return render(request, 'feedbacks.html', {'feedbacks': feedbacks})
    else:
        return redirect('home')


def contribute(request):
    return render(request, 'contribute.html')


def feedback(request, campaign_id):
    try:
        campaign = Campaign.objects.get(id=campaign_id, expiration_date__gte=timezone.now())
    except ObjectDoesNotExist:
        return render(request, 'bad_campaign.html', {})
    if request.method == "POST":
        form = FeedbackForm(request.POST)
        if form.is_valid():
            feedback = form.save(commit=False)
            feedback.campaign = Campaign.objects.get(id=campaign_id)
            feedback.creation_date = timezone.now()
            feedback.save()
            return redirect('thankyou')
    form = FeedbackForm()
    campaign = Campaign.objects.get(id=campaign_id)
    return render(request, 'feedback.html', {'form': form, 'message': campaign.message})


def bad_campaign(request):
    return render(request, 'bad_campaign.html', {})


def thankyou(request):
    return render(request, 'thankyou.html', {})
