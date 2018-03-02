import logging
from django.shortcuts import render, redirect
from django.utils import timezone

from .forms import FeedbackForm, CampaignForm
from .models import Campaign, Feedback

log = logging.getLogger(__name__)


def home(request):
    user = request.user
    if request.user.is_authenticated:
        campaign = Campaign.objects.filter(user=user, expiration_date__gte=timezone.now()).order_by('-creation_date').first()
        if request.method == "POST":
            if campaign is None:
                log.debug("Creating a campaign for user %s" % user)
                campaign = Campaign(user=user)
                campaign.save()
            else:
                campaign.message = request.POST['message']
                campaign.save()
        if campaign:
            form = CampaignForm(instance=campaign)
            return render(request, 'home.html', {'form': form, 'campaign': campaign})
        else:
            return render(request, 'home.html', {})
    else:
        return redirect('home')


def feedbacks(request):
    user = request.user
    if user.is_authenticated:
        campaign = Campaign.objects.filter(user=user, expiration_date__gte=timezone.now()).order_by('-creation_date').first()
        feedbacks = Feedback.objects.filter(campaign=campaign).order_by('-creation_date')
        return render(request, 'feedbacks.html', {'feedbacks': feedbacks})
    else:
        return redirect('home')


def feedback(request, campaign_id):
    if request.method == "POST":
        form = FeedbackForm(request.POST)
        if form.is_valid():
            feedback = form.save(commit=False)
            feedback.campaign = Campaign.objects.get(id=campaign_id)
            feedback.creation_date = timezone.now()
            feedback.save()
            return redirect('thankyou.html')

    form = FeedbackForm()
    campaign = Campaign.objects.get(id=campaign_id)
    return render(request, 'feedback.html', {'form': form, 'message': campaign.message})


def thankyou(request):
    return render(request, 'thankyou.html')
